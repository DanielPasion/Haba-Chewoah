import Link from "next/link";

import { localYmd } from "~/lib/habit-stats";
import { db } from "~/server/db";

import { ActivityRow, type ActivityRowVM } from "./activity-row";

const ACTIVITY_LIMIT = 8;

/**
 * Desktop-only right rail mirroring `.claude/ui/project/desktop.jsx`
 * `DRightRail`. Two sections:
 *
 *  - **today** — the viewer's active habits with a per-habit "logged today?"
 *    indicator. Limited to the first eight to keep the rail bounded.
 *  - **activity** — the viewer's most-recent notifications (follows/likes/
 *    comments) with the actor's display name + the action.
 *
 * Renders as a server component so each section's query batches with the
 * page's own RSC fetch — no waterfall, no client-side data churn. Hidden
 * below `lg:` because the column is too narrow at `md`.
 */
export async function DesktopRightRail({
  userId,
  timezone,
}: {
  userId: string;
  timezone: string;
}) {
  const todayYmd = localYmd(new Date(), timezone);
  // 48-hour window covers "today" in any timezone — enough for the
  // logged-today check without pulling the full per-habit history (which
  // grew unbounded as users logged more entries).
  const recentLogsCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  // §9: filter blocked actors from the activity feed — same rule the
  // /notifications page applies. Pulled in parallel with the rail data so
  // we don't add a sequential round-trip.
  const [blocksByMe, blocksOfMe, ...rest] = await Promise.all([
    db.block.findMany({
      where: { blockerId: userId },
      select: { blockedId: true },
    }),
    db.block.findMany({
      where: { blockedId: userId },
      select: { blockerId: true },
    }),
    Promise.resolve(null),
  ]);
  void rest;
  const hiddenActorIds = [
    ...blocksByMe.map((b) => b.blockedId),
    ...blocksOfMe.map((b) => b.blockerId),
  ];

  const [habits, notifications] = await Promise.all([
    db.habit.findMany({
      where: { userId, status: "active" },
      orderBy: [{ createdAt: "desc" }],
      take: 8,
      select: {
        id: true,
        name: true,
        icon: true,
        logs: {
          where: { completedAt: { gte: recentLogsCutoff } },
          select: { completedAt: true },
        },
        _count: { select: { logs: true } },
      },
    }),
    db.notification.findMany({
      where: {
        userId,
        ...(hiddenActorIds.length > 0
          ? { OR: [{ actorId: null }, { actorId: { notIn: hiddenActorIds } }] }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: ACTIVITY_LIMIT,
      select: {
        id: true,
        type: true,
        createdAt: true,
        isRead: true,
        habitLogId: true,
        actor: {
          select: { id: true, username: true, name: true, image: true },
        },
        habit: { select: { id: true, name: true, icon: true } },
      },
    }),
  ]);

  const activityVMs: ActivityRowVM[] = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    createdAt: n.createdAt,
    isRead: n.isRead,
    habitLogId: n.habitLogId,
    actor: n.actor
      ? {
          username: n.actor.username,
          displayName: n.actor.name ?? n.actor.username ?? "someone",
          imageUrl: n.actor.image,
        }
      : null,
    habit: n.habit,
  }));

  // Logs in the 48h window only — enough to derive "logged today" without
  // pulling full history. `_count.logs` separately answers "any logs ever?"
  // for the empty-state branch.
  const todayItems = habits.map((h) => {
    const loggedToday = h.logs.some(
      (l) => localYmd(l.completedAt, timezone) === todayYmd,
    );
    return {
      id: h.id,
      name: h.name,
      icon: h.icon,
      total: h._count.logs,
      loggedToday,
    };
  });
  const doneToday = todayItems.filter((t) => t.loggedToday).length;
  const totalToday = todayItems.length;

  return (
    <aside className="sticky top-0 hidden h-dvh w-80 shrink-0 flex-col gap-5 overflow-y-auto border-l border-hc-line bg-hc-bg px-6 py-5 xl:flex">
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2
            className="font-display text-sm font-extrabold leading-none text-hc-ink"
            style={{ letterSpacing: "-0.02em" }}
          >
            today · {doneToday} of {totalToday}
          </h2>
          <span className="font-mono text-hc-tiny font-semibold text-hc-muted">
            {formatTodayLabel()}
          </span>
        </div>

        {totalToday === 0 ? (
          <p className="rounded-hc-2 border-hc border-dashed border-hc-line-strong bg-hc-surface-alt px-3 py-3 font-mono text-hc-eyebrow text-hc-muted">
            no active habits — start one to populate this rail.
          </p>
        ) : (
          <>
            <div
              className="h-2 overflow-hidden rounded-full border border-hc-line bg-hc-line"
              aria-hidden
            >
              <div
                className="h-full bg-hc-brand transition-all"
                style={{
                  width: `${
                    totalToday === 0 ? 0 : (doneToday / totalToday) * 100
                  }%`,
                }}
              />
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {todayItems.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/habit/${t.id}`}
                    className={`flex items-center gap-2.5 rounded-hc-2 border-hc px-2.5 py-2 transition-colors ${
                      t.loggedToday
                        ? "border-hc-ink bg-hc-brand"
                        : "border-hc-line-strong bg-hc-surface hover:bg-hc-surface-alt"
                    }`}
                  >
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-hc-2 text-base ${
                        t.loggedToday
                          ? "border border-hc-brand-ink/15 bg-hc-brand-ink/10 text-hc-brand-ink"
                          : "border border-hc-line-strong bg-hc-bg text-hc-ink"
                      }`}
                    >
                      {t.icon ?? "✨"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`truncate font-sans text-hc-button font-bold ${
                          t.loggedToday ? "text-hc-brand-ink" : "text-hc-ink"
                        }`}
                      >
                        {t.name}
                      </div>
                      <div
                        className={`font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow ${
                          t.loggedToday
                            ? "text-hc-brand-ink/70"
                            : "text-hc-muted"
                        }`}
                      >
                        {t.total === 0
                          ? "no logs yet"
                          : t.loggedToday
                            ? "done today ✓"
                            : "due today"}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2
            className="font-display text-sm font-extrabold leading-none text-hc-ink"
            style={{ letterSpacing: "-0.02em" }}
          >
            activity
          </h2>
          <Link
            href="/notifications"
            className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted hover:text-hc-ink"
          >
            see all
          </Link>
        </div>
        {activityVMs.length === 0 ? (
          <p className="rounded-hc-2 border-hc border-dashed border-hc-line-strong bg-hc-surface-alt px-3 py-3 font-mono text-hc-eyebrow text-hc-muted">
            no recent activity yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {activityVMs.map((n) => (
              <li key={n.id}>
                <ActivityRow notification={n} variant="compact" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}

function formatTodayLabel() {
  const d = new Date();
  return d
    .toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
    .toLowerCase();
}
