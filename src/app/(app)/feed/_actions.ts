"use server";

import { auth } from "~/server/auth";

import {
  FEED_PAGE_SIZE,
  type FeedCursor,
  type LoadMoreFeedResult,
  loadFeedSlice,
} from "./_data";

export async function getMoreFeedAction(
  cursor: FeedCursor,
): Promise<LoadMoreFeedResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (!session.user.username) {
    return { ok: false, message: "finish creating your account first" };
  }
  if (
    typeof cursor?.completedAt !== "string" ||
    typeof cursor?.id !== "string"
  ) {
    return { ok: false, message: "invalid cursor" };
  }
  const parsed = new Date(cursor.completedAt);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, message: "invalid cursor" };
  }

  const { items, nextCursor } = await loadFeedSlice({
    viewerId: session.user.id,
    before: cursor,
    limit: FEED_PAGE_SIZE,
  });
  return { ok: true, items, nextCursor };
}
