"use server";

import { revalidatePath } from "next/cache";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

/**
 * Marks every unread notification for the viewer as read. Called from the
 * "mark all read" button on /notifications. The bell badge in the layout
 * reflects the unread count, so we revalidate / so the next layout pass
 * re-counts and clears it.
 */
export async function markAllNotificationsReadOnView() {
  const session = await auth();
  if (!session?.user) return;

  await db.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
  // Layout re-runs for sibling pages too — clears the bell badge anywhere
  // it's rendered.
  revalidatePath("/", "layout");
}
