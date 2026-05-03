"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { Prisma } from "../../../../generated/prisma";

const ToggleFollowSchema = z.object({
  targetUserId: z.string().uuid(),
});

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
  if (existing) {
    // `deleteMany` instead of `delete` so a concurrent delete (count=0) is a
    // no-op rather than P2025.
    await db.follow.deleteMany({ where: { followerId, followingId } });
    isFollowing = false;
  } else {
    try {
      await db.follow.create({ data: { followerId, followingId } });
      isFollowing = true;
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

  revalidatePath(`/profile/${target.username}`);
  if (session.user.username) {
    revalidatePath(`/profile/${session.user.username}`);
  }
  return { ok: true, isFollowing };
}
