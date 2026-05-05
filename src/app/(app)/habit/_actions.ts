"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { localYmd } from "~/lib/habit-stats";
import { createNotification } from "~/server/notifications";
import {
  deleteHabitLogMediaObject,
  ownedHabitLogMediaKeyFromPublicUrl,
} from "~/server/r2";

import { FrequencyType, NotificationType, Prisma } from "../../../../generated/prisma";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const FREQUENCY_VALUES = [
  FrequencyType.daily,
  FrequencyType.weekly,
  FrequencyType.n_per_period,
] as const;

const HabitFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "habit needs a name")
    .max(80, "name is too long"),
  description: z
    .string()
    .trim()
    .max(200, "description is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  icon: z
    .string()
    .trim()
    .max(8, "use a single emoji")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  frequencyType: z.enum(FREQUENCY_VALUES),
  targetCount: z.coerce
    .number()
    .int()
    .min(1, "target must be at least 1")
    .max(99, "target is too high"),
  periodDays: z.coerce
    .number()
    .int()
    .min(2, "period must be at least 2 days")
    .max(365, "period is too long")
    .nullable()
    .optional(),
  isPublic: z.coerce.boolean(),
});

type ParsedHabit = z.infer<typeof HabitFormSchema>;
type HabitField = keyof ParsedHabit | "form";

export type HabitMutationResult =
  | { ok: true; habitId: string }
  | { ok: false; field?: HabitField; message: string };

function readFormData(formData: FormData) {
  // `isPublic` rides as "true"/"false" because hidden inputs always send
  // strings — coerce explicitly so the schema's boolean stays honest.
  // periodDays comes through as "" when frequency != n_per_period; the
  // schema's `z.coerce.number()` would turn "" into 0 and fail the .min,
  // so collapse empties to null up front.
  const rawIsPublic = formData.get("isPublic");
  const rawPeriodDays = formData.get("periodDays");
  return {
    name: formData.get("name"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    frequencyType: formData.get("frequencyType"),
    targetCount: formData.get("targetCount") ?? 1,
    periodDays:
      rawPeriodDays == null || rawPeriodDays === "" ? null : rawPeriodDays,
    isPublic: rawIsPublic === "true" || rawIsPublic === "on",
  };
}

// Daily forces target=1, no period; weekly has count but no period;
// n_per_period needs both. Keeping this in one spot so create + update agree.
function normalize(parsed: ParsedHabit) {
  if (parsed.frequencyType === FrequencyType.daily) {
    return { ...parsed, targetCount: 1, periodDays: null as number | null };
  }
  if (parsed.frequencyType === FrequencyType.weekly) {
    return { ...parsed, periodDays: null as number | null };
  }
  return { ...parsed, periodDays: parsed.periodDays ?? 7 };
}

function firstIssueField(error: z.ZodError): HabitField | undefined {
  const path = error.issues[0]?.path[0];
  if (typeof path !== "string") return undefined;
  return path as HabitField;
}

export async function createHabitAction(
  formData: FormData,
): Promise<HabitMutationResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (!session.user.username) {
    return { ok: false, message: "finish creating your account first" };
  }

  const parsed = HabitFormSchema.safeParse(readFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      field: firstIssueField(parsed.error),
      message: parsed.error.issues[0]?.message ?? "invalid input",
    };
  }

  const data = normalize(parsed.data);

  const habit = await db.habit.create({
    data: {
      userId: session.user.id,
      name: data.name,
      description: data.description,
      icon: data.icon,
      frequencyType: data.frequencyType,
      targetCount: data.targetCount,
      periodDays: data.periodDays,
      isPublic: data.isPublic,
      startDate: new Date(),
    },
    select: { id: true },
  });

  revalidatePath(`/profile/${session.user.username}`);
  return { ok: true, habitId: habit.id };
}

export async function updateHabitAction(
  habitId: string,
  formData: FormData,
): Promise<HabitMutationResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (!session.user.username) {
    return { ok: false, message: "finish creating your account first" };
  }

  // Confirm ownership before doing the work — `updateMany` would silently
  // no-op for non-owners, but we want to surface "not found" semantics.
  const existing = await db.habit.findUnique({
    where: { id: habitId },
    select: { userId: true },
  });
  if (!existing || existing.userId !== session.user.id) {
    return { ok: false, message: "habit not found" };
  }

  const parsed = HabitFormSchema.safeParse(readFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      field: firstIssueField(parsed.error),
      message: parsed.error.issues[0]?.message ?? "invalid input",
    };
  }

  const data = normalize(parsed.data);

  await db.habit.update({
    where: { id: habitId },
    data: {
      name: data.name,
      description: data.description,
      icon: data.icon,
      frequencyType: data.frequencyType,
      targetCount: data.targetCount,
      periodDays: data.periodDays,
      isPublic: data.isPublic,
    },
  });

  revalidatePath(`/habit/${habitId}`);
  revalidatePath(`/profile/${session.user.username}`);
  return { ok: true, habitId };
}

export type DeleteHabitResult =
  | { ok: true; redirectTo: string }
  | { ok: false; message: string };

export async function deleteHabitAction(
  habitId: string,
): Promise<DeleteHabitResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };

  // Enumerate media URLs first — once the habit row is gone the cascade
  // wipes habit_logs and we lose the URLs needed to find the R2 keys.
  // NOTES.md §17 cleanup contract: habit deletion must enumerate child
  // log media and delete the R2 objects in the same action.
  const mediaUrls = (
    await db.habitLog.findMany({
      where: { habitId, userId: session.user.id, mediaUrl: { not: null } },
      select: { mediaUrl: true },
    })
  )
    .map((l) => l.mediaUrl)
    .filter((u): u is string => u !== null);

  // `deleteMany` instead of `delete` so a missing/foreign row is a no-op
  // rather than P2025. The where-clause enforces ownership.
  const result = await db.habit.deleteMany({
    where: { id: habitId, userId: session.user.id },
  });
  if (result.count === 0) {
    return { ok: false, message: "habit not found" };
  }

  // Best-effort R2 cleanup after the DB commit. A storage failure here
  // must not flip the user's "habit deleted" outcome (matches the
  // avatar/log delete contract).
  for (const url of mediaUrls) {
    const key = ownedHabitLogMediaKeyFromPublicUrl(url, session.user.id);
    if (key) await deleteHabitLogMediaObject(key);
  }

  if (session.user.username) {
    revalidatePath(`/profile/${session.user.username}`);
  }
  return { ok: true, redirectTo: "/profile" };
}

// ============================================================
// CHEW-OUT
// ============================================================
// "Chew out" pings a friend about an active habit they haven't completed
// yet today. Cooldown: one chew-out per (sender, recipient, habit, day),
// where `day` is the *recipient's* local YMD — so an East-Coaster chewing
// out a West-Coaster doesn't reset at the wrong wall-clock hour.
//
// Refused when:
//   - habit isn't active (challenge ended or owner abandoned)
//   - habit is private (no chewing out things you can't see)
//   - either party blocks the other (NOTES.md §9)
//   - recipient already logged today (don't pile on after they're done)
//   - sender already chewed out this combo today (DB unique catches the race)

export type ChewOutResult =
  | { ok: true }
  | { ok: false; message: string; cooldown?: boolean };

export async function chewOutAction(habitId: string): Promise<ChewOutResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (typeof habitId !== "string" || !UUID_RE.test(habitId)) {
    return { ok: false, message: "invalid habit id" };
  }

  const habit = await db.habit.findUnique({
    where: { id: habitId },
    select: {
      id: true,
      userId: true,
      name: true,
      isPublic: true,
      status: true,
      user: { select: { id: true, username: true, timezone: true } },
    },
  });
  if (!habit) return { ok: false, message: "habit not found" };
  if (habit.userId === session.user.id) {
    return { ok: false, message: "can't chew out your own habit" };
  }
  if (!habit.isPublic) {
    return { ok: false, message: "habit not found" };
  }
  if (habit.status !== "active") {
    return { ok: false, message: "habit is no longer active" };
  }

  const block = await db.block.findFirst({
    where: {
      OR: [
        { blockerId: session.user.id, blockedId: habit.userId },
        { blockerId: habit.userId, blockedId: session.user.id },
      ],
    },
    select: { blockerId: true },
  });
  if (block) return { ok: false, message: "habit not found" };

  // "Already logged today" — relative to the *recipient's* timezone.
  const recipientTz = habit.user.timezone;
  const todayYmd = localYmd(new Date(), recipientTz);
  const dayDate = new Date(`${todayYmd}T00:00:00Z`);
  const tomorrowDate = new Date(dayDate);
  tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);

  // We can't filter by "local YMD" in SQL without a tz join, so pull a
  // generous 48h window and finish the comparison in JS (matches the
  // pattern in `desktop-right-rail.tsx` `loggedToday` check).
  const recentLogsCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const recentLogs = await db.habitLog.findMany({
    where: { habitId: habit.id, completedAt: { gte: recentLogsCutoff } },
    select: { completedAt: true },
  });
  const loggedToday = recentLogs.some(
    (l) => localYmd(l.completedAt, recipientTz) === todayYmd,
  );
  if (loggedToday) {
    return { ok: false, message: "they already logged today — go cheer them" };
  }

  // Cooldown — DB unique on (sender, recipient, habit, day). The findFirst
  // is a UX optimization (returns a friendly message instead of P2002);
  // the real protection is the unique index.
  const existing = await db.chewout.findFirst({
    where: {
      senderId: session.user.id,
      recipientId: habit.userId,
      habitId: habit.id,
      day: dayDate,
    },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      cooldown: true,
      message: "you already chewed them out today",
    };
  }

  try {
    await db.chewout.create({
      data: {
        senderId: session.user.id,
        recipientId: habit.userId,
        habitId: habit.id,
        day: dayDate,
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return {
        ok: false,
        cooldown: true,
        message: "you already chewed them out today",
      };
    }
    throw err;
  }

  const senderHandle = session.user.username ?? "someone";
  await createNotification({
    recipientId: habit.userId,
    actorId: session.user.id,
    type: NotificationType.chewout,
    habitId: habit.id,
    pushTitle: `@${senderHandle} chewed you out`,
    pushBody: `finish "${habit.name}" before the day ends`,
    pushUrl: `/habit/${habit.id}`,
  });

  revalidatePath(`/habit/${habit.id}`);
  if (habit.user.username) {
    revalidatePath(`/profile/${habit.user.username}`);
  }

  return { ok: true };
}

// ============================================================
// CHEW-OUT (profile-level)
// ============================================================
// The mockup's profile-page chew-out button is one tap, no habit picker —
// so we let the server pick. Strategy: find the recipient's *first*
// active public habit they haven't logged today, oldest-streak first
// (`createdAt asc`) so longstanding habits get the buzz. Falls back to
// "they're already done for today" when nothing's eligible.
//
// Refusals mirror `chewOutAction` (blocked, none active+public, all
// logged today, cooldown). The result type adds `noEligibleHabit` so the
// client can render the "all done" state distinctly from a real error.

export type ChewOutOnProfileResult =
  | { ok: true; habitName: string; habitId: string }
  | {
      ok: false;
      message: string;
      cooldown?: boolean;
      noEligibleHabit?: boolean;
    };

export async function chewOutOnProfileAction(input: {
  targetUserId: string;
}): Promise<ChewOutOnProfileResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (
    typeof input?.targetUserId !== "string" ||
    !UUID_RE.test(input.targetUserId)
  ) {
    return { ok: false, message: "invalid target" };
  }
  const targetUserId = input.targetUserId;
  if (targetUserId === session.user.id) {
    return { ok: false, message: "can't chew out yourself" };
  }

  // §9: blocks in either direction hide the target. Returning a generic
  // "user not found" matches the convention in `toggleFollowAction` —
  // don't reveal block status to either party.
  const block = await db.block.findFirst({
    where: {
      OR: [
        { blockerId: session.user.id, blockedId: targetUserId },
        { blockerId: targetUserId, blockedId: session.user.id },
      ],
    },
    select: { blockerId: true },
  });
  if (block) return { ok: false, message: "user not found" };

  const target = await db.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, username: true, timezone: true },
  });
  if (!target?.username) return { ok: false, message: "user not found" };

  // Pull all active public habits + their last 48h of logs in one shot;
  // we'll filter "logged today" + "already-chewed today" in JS.
  const tz = target.timezone;
  const todayYmd = localYmd(new Date(), tz);
  const dayDate = new Date(`${todayYmd}T00:00:00Z`);
  const recentLogsCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const habits = await db.habit.findMany({
    where: { userId: target.id, isPublic: true, status: "active" },
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      logs: {
        where: { completedAt: { gte: recentLogsCutoff } },
        select: { completedAt: true },
      },
    },
  });
  if (habits.length === 0) {
    return {
      ok: false,
      noEligibleHabit: true,
      message: "no active habits to buzz",
    };
  }

  // Sender's prior chew-outs to this user today, so we can skip habits
  // already buzzed in the same loop instead of round-tripping per habit.
  const priorChewouts = await db.chewout.findMany({
    where: {
      senderId: session.user.id,
      recipientId: target.id,
      day: dayDate,
    },
    select: { habitId: true },
  });
  const alreadyBuzzed = new Set(priorChewouts.map((c) => c.habitId));

  const eligible = habits.find((h) => {
    if (alreadyBuzzed.has(h.id)) return false;
    const loggedToday = h.logs.some(
      (l) => localYmd(l.completedAt, tz) === todayYmd,
    );
    return !loggedToday;
  });

  if (!eligible) {
    // All public habits are either logged-today or already buzzed today.
    // Distinct from "no habits" so the UI can phrase it as "they're done"
    // vs "no public habits".
    return {
      ok: false,
      noEligibleHabit: true,
      message: "they're already done for today",
    };
  }

  try {
    await db.chewout.create({
      data: {
        senderId: session.user.id,
        recipientId: target.id,
        habitId: eligible.id,
        day: dayDate,
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return {
        ok: false,
        cooldown: true,
        message: "you already buzzed them about that one",
      };
    }
    throw err;
  }

  const senderHandle = session.user.username ?? "someone";
  await createNotification({
    recipientId: target.id,
    actorId: session.user.id,
    type: NotificationType.chewout,
    habitId: eligible.id,
    pushTitle: `@${senderHandle} chewed you out`,
    pushBody: `finish "${eligible.name}" before the day ends`,
    pushUrl: `/habit/${eligible.id}`,
  });

  revalidatePath(`/habit/${eligible.id}`);
  revalidatePath(`/profile/${target.username}`);

  return { ok: true, habitName: eligible.name, habitId: eligible.id };
}
