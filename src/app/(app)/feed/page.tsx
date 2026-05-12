import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
import { buttonClass } from "~/components/ui";
import { computeHabitStats, localYmd } from "~/lib/habit-stats";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { getViewerContext } from "~/server/viewer";

import { loadInitialFeed } from "./_data";
import { FeedList } from "./_components/feed-list";
import {
  TodayStreaksStrip,
  type TodayStreak,
} from "./_components/today-streaks-strip";

export const metadata: Metadata = { title: "feed" };

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  // Pull viewer chrome (timezone + active habits for the streaks strip)
  // in parallel with the first feed page. `getViewerContext` is wrapped
  // in React.cache, so it shares its round-trip with the layout call.
  const [viewer, myActiveHabits, firstPage] = await Promise.all([
    getViewerContext(session.user.id),
    db.habit.findMany({
      where: { userId: session.user.id, status: "active" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        icon: true,
        frequencyType: true,
        targetCount: true,
        periodDays: true,
        startDate: true,
        // Bound the per-habit history to a year so the query stops
        // growing as users log more. `computeHabitStats` walks backward
        // from today through consecutive days, so anything older than
        // the longest plausible streak (365d) doesn't affect the answer.
        logs: {
          where: {
            completedAt: {
              gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            },
          },
          select: { completedAt: true },
        },
      },
    }),
    loadInitialFeed(session.user.id),
  ]);
  const myTimezone = viewer.timezone;
  const todayYmd = localYmd(new Date(), myTimezone);

  const todayItems: TodayStreak[] = myActiveHabits.map((h) => {
    const stats = computeHabitStats({
      logs: h.logs,
      timezone: myTimezone,
      startDate: h.startDate,
      frequencyType: h.frequencyType,
      targetCount: h.targetCount,
      periodDays: h.periodDays,
    });
    const loggedToday = (stats.dayCounts.get(todayYmd) ?? 0) > 0;
    return {
      id: h.id,
      name: h.name,
      icon: h.icon,
      // "day N" = current-streak day number (matches feed cards / log
      // detail / habit detail). Total log count would be misleading: a
      // habit with 100 logs but a 3-day streak should show "day 3".
      day: stats.currentStreak,
      done: loggedToday,
    };
  });

  return (
    <div className="-mx-5 -my-6 flex flex-col gap-4 pb-2 md:-mx-8 md:-my-8 md:gap-6">
      <header className="sticky top-0 z-10 hidden items-center border-b border-hc-line bg-hc-bg/90 px-5 py-3 backdrop-blur md:flex md:px-8 md:py-4">
        <h1
          className="font-display text-2xl font-extrabold leading-none text-hc-ink"
          style={{ letterSpacing: "-0.04em" }}
        >
          home
        </h1>
      </header>

      <TodayStreaksStrip items={todayItems} />

      <div className="mx-auto flex w-full max-w-180 flex-col gap-3 px-3 md:px-8">
        {firstPage.items.length === 0 ? (
          <EmptyState username={session.user.username} />
        ) : (
          <FeedList
            initialItems={firstPage.items}
            initialCursor={firstPage.nextCursor}
          />
        )}
      </div>
    </div>
  );
}

function EmptyState({ username }: { username: string }) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-hc-3 border border-dashed border-hc-line-strong bg-hc-surface-alt px-6 py-14 text-center">
      <TwoFaceMascot size={72} mood="wink" bg="#1B1726" />
      <div className="flex flex-col items-center gap-2">
        <h2
          className="font-display text-xl font-extrabold text-hc-ink"
          style={{ letterSpacing: "-0.03em" }}
        >
          your feed is quiet
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-hc-muted">
          follow a few humans, or log a habit of your own. the feed lights up
          when people show up for themselves.
        </p>
      </div>
      <Link
        href={`/profile/${username}`}
        className={buttonClass({ variant: "primary", size: "md" })}
      >
        log something
      </Link>
    </div>
  );
}
