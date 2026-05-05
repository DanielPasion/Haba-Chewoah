import Link from "next/link";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
import { localYmd } from "~/lib/habit-stats";
import { db } from "~/server/db";

import { type NotificationType } from "../../../../generated/prisma";

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

  const [habits, notifications] = await Promise.all([
    db.habit.findMany({
      where: { userId, status: "active" },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        icon: true,
        logs: { select: { completedAt: true } },
      },
    }),
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: ACTIVITY_LIMIT,
      select: {
        id: true,
        type: true,
        createdAt: true,
        habitLogId: true,
        actor: {
          select: { id: true, username: true, name: true, image: true },
        },
      },
    }),
  ]);

  // For each active habit, compute "logged today?" + a current-streak day
  // count for the secondary label. We only walk the logs once per habit.
  const todayItems = habits.slice(0, 8).map((h) => {
    let total = 0;
    let loggedToday = false;
    for (const l of h.logs) {
      total += 1;
      if (localYmd(l.completedAt, timezone) === todayYmd) loggedToday = true;
    }
    return {
      id: h.id,
      name: h.name,
      icon: h.icon,
      total,
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
        <h2
          className="mb-3 font-display text-sm font-extrabold leading-none text-hc-ink"
          style={{ letterSpacing: "-0.02em" }}
        >
          activity
        </h2>
        {notifications.length === 0 ? (
          <p className="rounded-hc-2 border-hc border-dashed border-hc-line-strong bg-hc-surface-alt px-3 py-3 font-mono text-hc-eyebrow text-hc-muted">
            no recent activity yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {notifications.map((n) => (
              <li key={n.id}>
                <ActivityRow
                  type={n.type}
                  actorUsername={n.actor?.username ?? null}
                  actorDisplayName={
                    n.actor?.name ?? n.actor?.username ?? "someone"
                  }
                  actorImageUrl={n.actor?.image ?? null}
                  habitLogId={n.habitLogId}
                  createdAt={n.createdAt}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}

function ActivityRow({
  type,
  actorUsername,
  actorDisplayName,
  actorImageUrl,
  habitLogId,
  createdAt,
}: {
  type: NotificationType;
  actorUsername: string | null;
  actorDisplayName: string;
  actorImageUrl: string | null;
  habitLogId: string | null;
  createdAt: Date;
}) {
  const verb =
    type === "follow"
      ? "started following you"
      : type === "like"
        ? "liked your log"
        : "commented on your log";

  // Prefer the log link when there's one (likes + comments); fall back to
  // the actor's profile (follows). Either is a meaningful destination.
  const href =
    habitLogId !== null
      ? `/habit-log/${habitLogId}`
      : actorUsername
        ? `/profile/${actorUsername}`
        : "#";

  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 transition-colors hover:opacity-90"
    >
      <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-hc-line bg-hc-ink">
        {actorImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={actorImageUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <TwoFaceMascot size={28} bg="#1B1726" />
        )}
      </span>
      <div className="min-w-0 flex-1 font-sans text-xs leading-snug text-hc-ink">
        <span className="font-bold">
          {actorUsername ? `@${actorUsername}` : actorDisplayName}
        </span>{" "}
        {verb}{" "}
        <span className="font-mono text-hc-tiny font-semibold text-hc-muted">
          · {formatRelative(createdAt)}
        </span>
      </div>
    </Link>
  );
}

function formatTodayLabel() {
  const d = new Date();
  return d
    .toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
    .toLowerCase();
}

const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function formatRelative(date: Date) {
  const now = Date.now();
  const diffSec = Math.round((date.getTime() - now) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return RTF.format(diffSec, "second");
  if (abs < 3600) return RTF.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return RTF.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 7) return RTF.format(Math.round(diffSec / 86400), "day");
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
