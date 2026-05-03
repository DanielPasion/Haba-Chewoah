"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

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
 * Self-follows are blocked at the action layer (DB would also reject the
 * resulting cycle on a future cascade pass, but the surface should be honest
 * about it). Unknown target IDs no-op into "not following".
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

  const existing = await db.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { followerId: true },
  });

  if (existing) {
    await db.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
    revalidatePath(`/profile/${target.username}`);
    if (session.user.username) {
      revalidatePath(`/profile/${session.user.username}`);
    }
    return { ok: true, isFollowing: false };
  }

  await db.follow.create({ data: { followerId, followingId } });
  revalidatePath(`/profile/${target.username}`);
  if (session.user.username) {
    revalidatePath(`/profile/${session.user.username}`);
  }
  return { ok: true, isFollowing: true };
}
