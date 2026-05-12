import "server-only";

import { cache } from "react";

import { db } from "~/server/db";

export type ViewerContext = {
  userId: string;
  timezone: string;
  hiddenActorIds: string[];
  // Symmetric block set — anyone hidden in either direction.
  blockedSet: Set<string>;
  // Strict-direction subsets so callers can ask "am I blocking them?"
  // vs. "did they block me?" without re-querying the DB.
  iAmBlockingSet: Set<string>;
  blockingMeSet: Set<string>;
  followingIds: string[];
  followingSet: Set<string>;
};

/**
 * Per-request viewer context: timezone, symmetric-block set, and follow
 * set. Wrapped in React.cache so the (app) layout, the page, AND the
 * desktop right rail all share a single round-trip to the DB instead of
 * each issuing its own block/follow queries. Cache scope is one request.
 */
export const getViewerContext = cache(
  async (userId: string): Promise<ViewerContext> => {
    const [me, blocksByMe, blocksOfMe, follows] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { timezone: true },
      }),
      db.block.findMany({
        where: { blockerId: userId },
        select: { blockedId: true },
      }),
      db.block.findMany({
        where: { blockedId: userId },
        select: { blockerId: true },
      }),
      db.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      }),
    ]);
    const iAmBlockingIds = blocksByMe.map((b) => b.blockedId);
    const blockingMeIds = blocksOfMe.map((b) => b.blockerId);
    const hiddenActorIds = [...iAmBlockingIds, ...blockingMeIds];
    const followingIds = follows.map((f) => f.followingId);
    return {
      userId,
      timezone: me?.timezone ?? "UTC",
      hiddenActorIds,
      blockedSet: new Set(hiddenActorIds),
      iAmBlockingSet: new Set(iAmBlockingIds),
      blockingMeSet: new Set(blockingMeIds),
      followingIds,
      followingSet: new Set(followingIds),
    };
  },
);

/**
 * Per-request snapshot of the viewer's active habit IDs. Used by the
 * (app) layout to eagerly prefetch each habit detail page into the client
 * router cache. Deduped via React.cache so the same query isn't re-issued
 * by callers that also need habit IDs.
 */
export const getMyActiveHabitIds = cache(
  async (userId: string): Promise<string[]> => {
    const rows = await db.habit.findMany({
      where: { userId, status: "active" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  },
);
