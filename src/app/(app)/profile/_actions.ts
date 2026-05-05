"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { createNotification } from "~/server/notifications";
import { NotificationType, Prisma } from "../../../../generated/prisma";

import {
  type LoadMoreProfileLogsResult,
  type ProfileLogsCursor,
  loadProfileLogsSlice,
} from "./_data";

export async function getMoreProfileLogsAction(input: {
  userId: string;
  cursor: ProfileLogsCursor;
}): Promise<LoadMoreProfileLogsResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (typeof input?.userId !== "string") {
    return { ok: false, message: "invalid input" };
  }
  return loadProfileLogsSlice({
    viewerId: session.user.id,
    targetUserId: input.userId,
    before: input.cursor,
  });
}

export type FollowListUser = {
  id: string;
  username: string;
  displayName: string;
  imageUrl: string | null;
};

const FOLLOW_LIST_LIMIT = 200;

const ToggleFollowSchema = z.object({
  targetUserId: z.string().uuid(),
});

const GetFollowListSchema = z.object({
  userId: z.string().uuid(),
  kind: z.enum(["followers", "following"]),
});

/**
 * Fetch the followers/following list for a user, modal-friendly.
 * Returns at most FOLLOW_LIST_LIMIT rows, newest follow first. Block-aware:
 * users blocked in either direction are filtered out (matches feed/comments
 * — `.claude/db/NOTES.md` §9 — so the viewer never sees someone they shouldn't).
 *
 * Returns a flat list, no follow-back state. Modal just links to profiles.
 */
export async function getFollowListAction(input: {
  userId: string;
  kind: "followers" | "following";
}): Promise<
  | { ok: true; users: FollowListUser[] }
  | { ok: false; message: string }
> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };

  const parsed = GetFollowListSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "invalid input" };

  const [blocksByMe, blocksOfMe] = await Promise.all([
    db.block.findMany({
      where: { blockerId: session.user.id },
      select: { blockedId: true },
    }),
    db.block.findMany({
      where: { blockedId: session.user.id },
      select: { blockerId: true },
    }),
  ]);
  const hidden = [
    ...blocksByMe.map((b) => b.blockedId),
    ...blocksOfMe.map((b) => b.blockerId),
  ];

  const rows = await db.follow.findMany({
    where:
      parsed.data.kind === "followers"
        ? {
            followingId: parsed.data.userId,
            ...(hidden.length > 0
              ? { followerId: { notIn: hidden } }
              : {}),
          }
        : {
            followerId: parsed.data.userId,
            ...(hidden.length > 0
              ? { followingId: { notIn: hidden } }
              : {}),
          },
    orderBy: { createdAt: "desc" },
    take: FOLLOW_LIST_LIMIT,
    select:
      parsed.data.kind === "followers"
        ? {
            follower: {
              select: { id: true, username: true, name: true, image: true },
            },
          }
        : {
            following: {
              select: { id: true, username: true, name: true, image: true },
            },
          },
  });

  type FollowRow = {
    follower?: { id: string; username: string | null; name: string | null; image: string | null };
    following?: { id: string; username: string | null; name: string | null; image: string | null };
  };
  const users: FollowListUser[] = (rows as FollowRow[])
    .map((r) => (parsed.data.kind === "followers" ? r.follower : r.following))
    .filter(
      (u): u is { id: string; username: string; name: string | null; image: string | null } =>
        Boolean(u?.username),
    )
    .map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.name ?? u.username,
      imageUrl: u.image,
    }));

  return { ok: true, users };
}

export type ToggleFollowResult =
  | { ok: true; isFollowing: boolean }
  | { ok: false; message: string };

/**
 * Idempotent follow/unfollow toggle. Returns the resulting state so the
 * client can flip its optimistic UI without re-fetching.
 *
 * Self-follows are blocked at the action layer. Either-direction blocks
 * (caller blocked target, or target blocked caller) reject the follow per
 * .claude/db/NOTES.md §9 — the DB has no FK to enforce this, it's app-layer.
 *
 * Race-safety: two concurrent toggles for the same pair could both observe
 * "not following" and both try to insert. We catch the unique-constraint
 * violation (P2002) on create and treat it as idempotent success. Likewise,
 * `deleteMany` is used over `delete` so a concurrent delete doesn't throw.
 */
export async function toggleFollowAction(input: {
  targetUserId: string;
}): Promise<ToggleFollowResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };

  const parsed = ToggleFollowSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "invalid target" };

  const followerId = session.user.id;
  const followingId = parsed.data.targetUserId;

  if (followerId === followingId) {
    return { ok: false, message: "cannot follow yourself" };
  }

  const target = await db.user.findUnique({
    where: { id: followingId },
    select: { username: true },
  });
  if (!target?.username) return { ok: false, message: "user not found" };

  // Either-direction block check. Reads both rows in one query so a single
  // round-trip rules out both "I blocked them" and "they blocked me".
  const block = await db.block.findFirst({
    where: {
      OR: [
        { blockerId: followerId, blockedId: followingId },
        { blockerId: followingId, blockedId: followerId },
      ],
    },
    select: { blockerId: true },
  });
  if (block) return { ok: false, message: "cannot follow this user" };

  const existing = await db.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { followerId: true },
  });

  let isFollowing: boolean;
  let didCreate = false;
  if (existing) {
    // `deleteMany` instead of `delete` so a concurrent delete (count=0) is a
    // no-op rather than P2025.
    await db.follow.deleteMany({ where: { followerId, followingId } });
    isFollowing = false;
  } else {
    try {
      await db.follow.create({ data: { followerId, followingId } });
      isFollowing = true;
      didCreate = true;
    } catch (err) {
      // Concurrent request inserted the same row first — the toggle's
      // observable end state is still "following", so report success.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        isFollowing = true;
      } else {
        throw err;
      }
    }
  }

  // Only notify on the *new* follow. A concurrent insert (P2002) shouldn't
  // double-notify, and an unfollow obviously shouldn't notify.
  if (didCreate) {
    const actorHandle = session.user.username ?? "someone";
    await createNotification({
      recipientId: followingId,
      actorId: followerId,
      type: NotificationType.follow,
      pushTitle: `@${actorHandle} followed you`,
      pushBody: "tap to see their profile",
      pushUrl: session.user.username
        ? `/profile/${session.user.username}`
        : "/notifications",
    });
  }

  revalidatePath(`/profile/${target.username}`);
  if (session.user.username) {
    revalidatePath(`/profile/${session.user.username}`);
  }
  return { ok: true, isFollowing };
}

// ============================================================
// BLOCKS — NOTES.md §9
// ============================================================
// Blocking is a hard separation: existing follow rows in either direction
// are removed at block-time (per §9), and the read-side filtering already
// in `ensureLogVisible`, `getFollowListAction`, and the notification
// fanout helper kicks in immediately. Unblocking does NOT restore prior
// follows — the user has to re-follow if they want to.

const BlockSchema = z.object({
  targetUserId: z.string().uuid(),
});

export type ToggleBlockResult =
  | { ok: true; isBlocking: boolean }
  | { ok: false; message: string };

export async function blockUserAction(input: {
  targetUserId: string;
}): Promise<ToggleBlockResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };

  const parsed = BlockSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "invalid target" };

  const blockerId = session.user.id;
  const blockedId = parsed.data.targetUserId;
  if (blockerId === blockedId) {
    return { ok: false, message: "cannot block yourself" };
  }

  const target = await db.user.findUnique({
    where: { id: blockedId },
    select: { username: true },
  });
  if (!target?.username) return { ok: false, message: "user not found" };

  // §9: "Existing follow relationships in either direction should be
  // removed at block time." Run all three writes in one transaction so a
  // partial failure doesn't leave a half-blocked state.
  try {
    await db.$transaction([
      db.block.upsert({
        where: { blockerId_blockedId: { blockerId, blockedId } },
        update: {},
        create: { blockerId, blockedId },
      }),
      db.follow.deleteMany({
        where: {
          OR: [
            { followerId: blockerId, followingId: blockedId },
            { followerId: blockedId, followingId: blockerId },
          ],
        },
      }),
    ]);
  } catch (err) {
    console.warn("[block] create failed", err);
    return { ok: false, message: "could not block" };
  }

  revalidatePath(`/profile/${target.username}`);
  if (session.user.username) {
    revalidatePath(`/profile/${session.user.username}`);
  }
  // Block changes affect feed visibility, comment lists, and the bell
  // count — broad layout revalidation is the cheapest correct option.
  revalidatePath("/", "layout");
  return { ok: true, isBlocking: true };
}

export async function unblockUserAction(input: {
  targetUserId: string;
}): Promise<ToggleBlockResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };

  const parsed = BlockSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "invalid target" };

  const blockerId = session.user.id;
  const blockedId = parsed.data.targetUserId;

  // Concurrent unblocks → use deleteMany so count=0 is a no-op rather
  // than P2025.
  await db.block.deleteMany({ where: { blockerId, blockedId } });

  const target = await db.user.findUnique({
    where: { id: blockedId },
    select: { username: true },
  });
  if (target?.username) revalidatePath(`/profile/${target.username}`);
  if (session.user.username) {
    revalidatePath(`/profile/${session.user.username}`);
  }
  revalidatePath("/", "layout");
  return { ok: true, isBlocking: false };
}
