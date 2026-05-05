import "server-only";

import { dayNumberForLog, localYmd } from "~/lib/habit-stats";
import { db } from "~/server/db";

import type { FeedItem } from "./_components/feed-card";

export const FEED_PAGE_SIZE = 30;

export type FeedCursor = {
  // ISO string so the cursor crosses the wire cleanly. Pair `completedAt`
  // with `id` so two logs with the same timestamp still produce a stable
  // total order — single-column cursors skip rows when ties exist.
  completedAt: string;
  id: string;
};

export type LoadMoreFeedResult =
  | { ok: true; items: FeedItem[]; nextCursor: FeedCursor | null }
  | { ok: false; message: string };

/**
 * Internal loader shared by the initial RSC fetch and the "load more"
 * server action. Pull-then-shape with no client surface so the same
 * privacy + tz logic powers both entry points.
 *
 * Lives in a `_data.ts` (not `_actions.ts`) because Next's "use server"
 * file constraint only allows async-function exports — the constants,
 * types, and shared loader belong in a regular module.
 */
export async function loadFeedSlice({
  viewerId,
  before,
  limit,
}: {
  viewerId: string;
  before: FeedCursor | null;
  limit: number;
}): Promise<{ items: FeedItem[]; nextCursor: FeedCursor | null }> {
  const [follows, blocksByMe, blocksOfMe] = await Promise.all([
    db.follow.findMany({
      where: { followerId: viewerId },
      select: { followingId: true },
    }),
    db.block.findMany({
      where: { blockerId: viewerId },
      select: { blockedId: true },
    }),
    db.block.findMany({
      where: { blockedId: viewerId },
      select: { blockerId: true },
    }),
  ]);
  const blockedSet = new Set([
    ...blocksByMe.map((b) => b.blockedId),
    ...blocksOfMe.map((b) => b.blockerId),
  ]);
  const visibleAuthorIds = [
    ...new Set([viewerId, ...follows.map((f) => f.followingId)]),
  ].filter((id) => !blockedSet.has(id));

  if (visibleAuthorIds.length === 0) {
    return { items: [], nextCursor: null };
  }

  // Stable sort key: (completedAt desc, id desc). Cursor `before` must
  // satisfy "strictly older": same-instant ties use the id tiebreaker so
  // a dropped row never repeats and a duplicate row never skips one.
  const cursorWhere = before
    ? {
        OR: [
          { completedAt: { lt: new Date(before.completedAt) } },
          {
            completedAt: new Date(before.completedAt),
            id: { lt: before.id },
          },
        ],
      }
    : {};

  const logs = await db.habitLog.findMany({
    where: {
      userId: { in: visibleAuthorIds },
      habit: { isPublic: true },
      ...cursorWhere,
    },
    orderBy: [{ completedAt: "desc" }, { id: "desc" }],
    take: limit,
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

  if (logs.length === 0) return { items: [], nextCursor: null };

  // Day-N depends on the *owner's* full timeline for each habit that
  // appears in this batch. One bulk query keyed by (userId, habitId) keeps
  // the math at one round-trip per page, regardless of batch size.
  const ownerHabitPairs = Array.from(
    new Map(
      logs.map((l) => [
        `${l.userId}:${l.habit.id}`,
        { userId: l.userId, habitId: l.habit.id, timezone: l.user.timezone },
      ]),
    ).values(),
  );
  const ownerLogs = await db.habitLog.findMany({
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
  const tzByAuthor = new Map(
    ownerHabitPairs.map((p) => [p.userId, p.timezone]),
  );
  for (const l of ownerLogs) {
    const tz = tzByAuthor.get(l.userId) ?? "UTC";
    const ymd = localYmd(l.completedAt, tz);
    const counts = dayCountsByAuthorHabit.get(`${l.userId}:${l.habitId}`)!;
    counts.set(ymd, (counts.get(ymd) ?? 0) + 1);
  }

  const myLikeRows = await db.like.findMany({
    where: { userId: viewerId, habitLogId: { in: logs.map((l) => l.id) } },
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
      isOwn: l.userId === viewerId,
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

  const last = logs[logs.length - 1]!;
  // `nextCursor` only set when the page filled — when the page is short,
  // we know there's nothing further and the client can stop polling.
  const nextCursor: FeedCursor | null =
    logs.length === limit
      ? { completedAt: last.completedAt.toISOString(), id: last.id }
      : null;

  return { items, nextCursor };
}

/**
 * Server-component entry point. Returns the first page + a cursor for
 * the client to feed back into `getMoreFeedAction`.
 */
export async function loadInitialFeed(viewerId: string) {
  return loadFeedSlice({ viewerId, before: null, limit: FEED_PAGE_SIZE });
}
