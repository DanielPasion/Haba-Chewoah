import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
import { buttonClass } from "~/components/ui";
import {
  computeHabitStats,
  dayNumberForLog,
  localYmd,
} from "~/lib/habit-stats";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { FeedCard, type FeedItem } from "./_components/feed-card";
import {
  TodayStreaksStrip,
  type TodayStreak,
} from "./_components/today-streaks-strip";

export const metadata: Metadata = { title: "feed" };

const FEED_PAGE_SIZE = 30;

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  // Followed-user IDs in one round-trip; "+self" so users see their own
  // logs without having to follow themselves. Block filtering done in the
  // same query — pulling blocks first costs another roundtrip but keeps
  // the main query plan simple. Pull the viewer's own active habits in
  // the same batch — `MyStreaks` strip needs them and the data is small.
  const [me, follows, blocksByMe, blocksOfMe, myActiveHabits] =
    await Promise.all([
      db.user.findUnique({
        where: { id: session.user.id },
        select: { timezone: true },
      }),
      db.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      }),
      db.block.findMany({
        where: { blockerId: session.user.id },
        select: { blockedId: true },
      }),
      db.block.findMany({
        where: { blockedId: session.user.id },
        select: { blockerId: true },
      }),
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
    ]);
  const myTimezone = me?.timezone ?? "UTC";
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

  const followingIds = follows.map((f) => f.followingId);
  const authorIds = [...new Set([session.user.id, ...followingIds])];
  const blockedSet = new Set([
    ...blocksByMe.map((b) => b.blockedId),
    ...blocksOfMe.map((b) => b.blockerId),
  ]);
  const visibleAuthorIds = authorIds.filter((id) => !blockedSet.has(id));

  const logs =
    visibleAuthorIds.length === 0
      ? []
      : await db.habitLog.findMany({
          where: {
            userId: { in: visibleAuthorIds },
            habit: { isPublic: true },
          },
          orderBy: { completedAt: "desc" },
          take: FEED_PAGE_SIZE,
          select: {
            id: true,
            completedAt: true,
            notes: true,
            mediaUrl: true,
            mediaType: true,
            mediaDurationMs: true,
            userId: true,
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
                timezone: true,
              },
            },
            habit: {
              select: { id: true, name: true, icon: true },
            },
            _count: { select: { likes: true, comments: true } },
          },
        });

  // Day-N depends on the *owner's* streak, not the viewer's. We need
  // every log the owner has on each habit that appears in this feed
  // slice. Bulk-fetch with one query keyed by the unique (userId, habitId)
  // pairs in `logs`, then bucket in memory — replaces the per-log
  // sequential await loop that previously hit the DB once per pair.
  const ownerHabitPairs = Array.from(
    new Map(
      logs.map((l) => [
        `${l.userId}:${l.habit.id}`,
        { userId: l.userId, habitId: l.habit.id, timezone: l.user.timezone },
      ]),
    ).values(),
  );
  const allOwnerLogs =
    ownerHabitPairs.length === 0
      ? []
      : await db.habitLog.findMany({
          where: {
            OR: ownerHabitPairs.map((p) => ({
              userId: p.userId,
              habitId: p.habitId,
            })),
          },
          select: { userId: true, habitId: true, completedAt: true },
        });
  const dayCountsByAuthorHabit = new Map<string, Map<string, number>>();
  for (const p of ownerHabitPairs) {
    dayCountsByAuthorHabit.set(`${p.userId}:${p.habitId}`, new Map());
  }
  // Each pair has its own timezone (the owner's), so look it up per row
  // rather than caching a single formatter.
  const tzByAuthor = new Map(
    ownerHabitPairs.map((p) => [p.userId, p.timezone]),
  );
  for (const l of allOwnerLogs) {
    const tz = tzByAuthor.get(l.userId) ?? "UTC";
    const ymd = localYmd(l.completedAt, tz);
    const counts = dayCountsByAuthorHabit.get(`${l.userId}:${l.habitId}`)!;
    counts.set(ymd, (counts.get(ymd) ?? 0) + 1);
  }

  // One bulk query for the viewer's like rows on this slice.
  const myLikeRows =
    logs.length === 0
      ? []
      : await db.like.findMany({
          where: {
            userId: session.user.id,
            habitLogId: { in: logs.map((l) => l.id) },
          },
          select: { habitLogId: true },
        });
  const likedSet = new Set(myLikeRows.map((l) => l.habitLogId));

  const items: FeedItem[] = logs
    .filter((l) => l.user.username)
    .map((l) => ({
      id: l.id,
      completedAt: l.completedAt,
      notes: l.notes,
      mediaUrl: l.mediaUrl,
      mediaType: l.mediaType,
      mediaDurationMs: l.mediaDurationMs,
      likeCount: l._count.likes,
      commentCount: l._count.comments,
      likedByMe: likedSet.has(l.id),
      isOwn: l.userId === session.user.id,
      habit: l.habit,
      author: {
        id: l.user.id,
        username: l.user.username!,
        displayName: l.user.name ?? l.user.username!,
        imageUrl: l.user.image,
      },
      dayNumber: dayNumberForLog({
        logCompletedAt: l.completedAt,
        dayCounts:
          dayCountsByAuthorHabit.get(`${l.userId}:${l.habit.id}`) ?? new Map(),
        timezone: l.user.timezone,
      }),
    }));

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
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          items.map((item) => <FeedCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-hc-3 border-hc border-dashed border-hc-line-strong bg-hc-surface-alt px-6 py-12 text-center">
      <TwoFaceMascot size={84} mood="wink" bg="#1B1726" />
      <div className="flex flex-col items-center gap-1">
        <p className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-muted">
          quiet in here
        </p>
        <p className="max-w-sm text-sm text-hc-ink">
          follow some humans, or log your own habit. either way, the feed only
          shows up when somebody actually does the thing.
        </p>
      </div>
      <Link
        href="/profile"
        className={buttonClass({ variant: "primary", size: "md" })}
      >
        log something →
      </Link>
    </div>
  );
}
