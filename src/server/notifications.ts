import "server-only";

import webpush from "web-push";

import { env } from "~/env";
import { localYmd } from "~/lib/habit-stats";

import { NotificationType, Prisma } from "../../generated/prisma";
import { db } from "./db";

// Configure VAPID once per process. If env vars are missing (local dev,
// preview, or before the user runs `web-push generate-vapid-keys`), we
// silently skip sending pushes — the in-app notification still lands.
let vapidConfigured = false;
function ensureVapid(): boolean {
  if (vapidConfigured) return true;
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) {
    return false;
  }
  webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY,
  );
  vapidConfigured = true;
  return true;
}

export type CreateNotificationInput = {
  recipientId: string;
  /** Null for system notifications (cron-fired reminder/streak/milestone). */
  actorId?: string | null;
  type: NotificationType;
  habitId?: string | null;
  habitLogId?: string | null;
  commentId?: string | null;
  /**
   * Recipient's local YMD ("YYYY-MM-DD") for cron-fired notifs only. Set on
   * reminder / streak_at_risk / streak_milestone / habit_succeeded so the
   * `(userId, habitId, type, localDay)` unique constraint backstops dedup
   * under concurrent cron runs. Leave undefined for user-action notifs.
   */
  localDayYmd?: string | null;
  /** Push title — also used as the in-app aria label. */
  pushTitle?: string;
  /** Push body — short, plain text. */
  pushBody?: string;
  /** Path the user lands on when they tap the push (e.g. `/habit-log/abc`). */
  pushUrl?: string;
};

/**
 * Insert a notification row and (best-effort) fan it out to the recipient's
 * web-push subscriptions.
 *
 * Skips when:
 *  - actor === recipient (no self-notifications)
 *  - either party blocks the other (NOTES.md §9, §13)
 *
 * Push delivery is best-effort: a failed push must never roll back the
 * in-app notification, and a failed insert means we can't push (we never
 * push without a corresponding row to render).
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<{ created: boolean }> {
  const {
    recipientId,
    actorId,
    type,
    habitId,
    habitLogId,
    commentId,
    localDayYmd,
    pushTitle,
    pushBody,
    pushUrl,
  } = input;

  if (actorId && actorId === recipientId) return { created: false };

  if (actorId) {
    const blocked = await db.block.findFirst({
      where: {
        OR: [
          { blockerId: recipientId, blockedId: actorId },
          { blockerId: actorId, blockedId: recipientId },
        ],
      },
      select: { blockerId: true },
    });
    if (blocked) return { created: false };
  }

  try {
    await db.notification.create({
      data: {
        userId: recipientId,
        actorId: actorId ?? null,
        type,
        habitId: habitId ?? null,
        habitLogId: habitLogId ?? null,
        commentId: commentId ?? null,
        // Postgres `date` accepts an ISO `YYYY-MM-DD` string directly.
        localDay: localDayYmd ?? null,
      },
    });
  } catch (err) {
    // P2002 = unique on (userId, habitId, type, localDay). Concurrent
    // cron run beat us to this insert — that's the dedup working
    // correctly. Treat as idempotent success but DON'T fan out push
    // (the winning insert already did that).
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { created: false };
    }
    console.warn("[notif] create row failed", { type, recipientId, err });
    return { created: false };
  }

  if (pushTitle || pushBody) {
    // Fire-and-forget: this is invoked from a server action returning to
    // the caller as soon as the DB row lands. Awaiting the push fanout
    // would tax every like/comment/follow with a multi-hundred-ms RTT to
    // each push provider for no UX gain.
    void sendPushToUser(recipientId, {
      title: pushTitle ?? "Haba-Chewoah",
      body: pushBody ?? "",
      url: pushUrl ?? "/notifications",
    });
  }

  return { created: true };
}

type PushPayload = { title: string; body: string; url: string };

async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!ensureVapid()) return;

  const subs = await db.pushSubscription.findMany({
    where: { userId },
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  });
  if (subs.length === 0) return;

  const body = JSON.stringify(payload);

  const expiredIds: string[] = [];
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          body,
        );
        await db.pushSubscription
          .update({
            where: { id: s.id },
            data: { lastUsedAt: new Date() },
          })
          .catch(() => {
            // Stamping last-used is observability — never let it fail the
            // delivery branch.
          });
      } catch (err) {
        // 404 = subscription gone. 410 = unsubscribed. Drop the row so we
        // don't keep punching a dead endpoint.
        const statusCode =
          typeof err === "object" && err !== null && "statusCode" in err
            ? (err as { statusCode?: number }).statusCode
            : undefined;
        if (statusCode === 404 || statusCode === 410) {
          expiredIds.push(s.id);
        } else {
          console.warn("[push] send failed", { endpoint: s.endpoint, err });
        }
      }
    }),
  );

  if (expiredIds.length > 0) {
    await db.pushSubscription
      .deleteMany({ where: { id: { in: expiredIds } } })
      .catch((err) => {
        console.warn("[push] expired-cleanup failed", err);
      });
  }
}

// Public helper for the chew-out action so it can also send push without
// the createNotification wrapper (it does its own row insert + cooldown).
export async function fanoutPush(userId: string, payload: PushPayload) {
  await sendPushToUser(userId, payload);
}

/**
 * Fan out a `follow_log` notification to every follower of `actorId`,
 * skipping anyone the actor blocks (or who blocks the actor).
 *
 * Why a dedicated helper instead of a `Promise.all` over `createNotification`:
 * a popular user with N followers would issue N block-check queries via
 * `createNotification`'s per-call guard. We collapse those to a single
 * block lookup + a single `createMany` insert, then fire pushes
 * individually (best-effort). Push fanout stays non-blocking — the action
 * returns as soon as the rows are written.
 *
 * Caller is responsible for gating on `habit.isPublic` / `habit.status`.
 * Private or archived habits should not produce follower notifications
 * (it would leak the private activity that the visibility model otherwise
 * hides from the feed).
 */
export async function fanoutLogToFollowers(input: {
  actorId: string;
  actorHandle: string;
  habitId: string;
  habitName: string;
  habitLogId: string;
}): Promise<{ recipientCount: number }> {
  const { actorId, actorHandle, habitId, habitName, habitLogId } = input;

  // Followers of the actor + bidirectional blocks involving the actor +
  // the actor's timezone (used to bucket notifs by *the actor's* local
  // day for dedup). All independent — parallelize.
  const [follows, blocksByActor, blocksOfActor, actor] = await Promise.all([
    db.follow.findMany({
      where: { followingId: actorId },
      select: { followerId: true },
    }),
    db.block.findMany({
      where: { blockerId: actorId },
      select: { blockedId: true },
    }),
    db.block.findMany({
      where: { blockedId: actorId },
      select: { blockerId: true },
    }),
    db.user.findUnique({
      where: { id: actorId },
      select: { timezone: true },
    }),
  ]);

  if (follows.length === 0) return { recipientCount: 0 };

  const blockedSet = new Set<string>([
    ...blocksByActor.map((b) => b.blockedId),
    ...blocksOfActor.map((b) => b.blockerId),
  ]);
  const followerIds = follows
    .map((f) => f.followerId)
    .filter((id) => !blockedSet.has(id) && id !== actorId);

  if (followerIds.length === 0) return { recipientCount: 0 };

  // Per-day dedup: a user logging the same habit ten times in a day
  // would otherwise spam every follower with ten notifications + ten
  // pushes. Bucketing by the actor's local day means the first log of
  // the day fans out, subsequent logs of that habit on the same day
  // don't. Crossing midnight in the actor's TZ resets the bucket so
  // the next day's first log notifies again.
  //
  // The unique key `(userId, habitId, type, localDay)` enforces this at
  // the DB level. We *also* pre-query existing rows so we can suppress
  // push fanout for already-notified followers — `createMany` doesn't
  // tell us which rows it skipped.
  const actorLocalDay = localYmd(new Date(), actor?.timezone ?? "UTC");

  const existing = await db.notification.findMany({
    where: {
      userId: { in: followerIds },
      habitId,
      type: NotificationType.follow_log,
      // Postgres `date` accepts the ISO string directly; matches the
      // create path (createNotification passes `localDayYmd` as a string).
      localDay: actorLocalDay,
    },
    select: { userId: true },
  });
  const alreadyNotified = new Set(existing.map((e) => e.userId));
  const recipientIds = followerIds.filter((id) => !alreadyNotified.has(id));

  if (recipientIds.length === 0) return { recipientCount: 0 };

  // `skipDuplicates: true` is belt-and-braces — the pre-query already
  // filtered, but a concurrent fanout (same actor logging twice in
  // quick succession) could race past it.
  try {
    await db.notification.createMany({
      data: recipientIds.map((recipientId) => ({
        userId: recipientId,
        actorId,
        type: NotificationType.follow_log,
        habitId,
        habitLogId,
        localDay: actorLocalDay,
      })),
      skipDuplicates: true,
    });
  } catch (err) {
    console.warn("[notif] follow_log fanout insert failed", {
      actorId,
      habitLogId,
      err,
    });
    return { recipientCount: 0 };
  }

  // Push fanout is best-effort and runs in the background — the action
  // shouldn't wait for hundreds of round-trips to push providers. We
  // intentionally don't `await` the loop.
  const pushPayload: PushPayload = {
    title: `@${actorHandle} just logged`,
    body: habitName,
    url: `/habit-log/${habitLogId}`,
  };
  for (const recipientId of recipientIds) {
    void sendPushToUser(recipientId, pushPayload);
  }

  return { recipientCount: recipientIds.length };
}
