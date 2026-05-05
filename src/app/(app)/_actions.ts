"use server";

import { z } from "zod";

import { signOut } from "~/server/auth";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

// ============================================================
// PUSH SUBSCRIPTIONS (Web Push)
// ============================================================

const SubscriptionSchema = z.object({
  endpoint: z.string().url().max(2000),
  p256dh: z.string().min(1).max(500),
  auth: z.string().min(1).max(500),
  userAgent: z.string().max(500).optional().nullable(),
});

export type SavePushSubscriptionResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Idempotent upsert keyed on `endpoint` (the unique identifier the browser's
 * push service hands out). Re-subscribing the same browser twice is a no-op
 * for the row count, but updates `lastUsedAt` so cleanup jobs can prune
 * dead browsers via age.
 *
 * Re-binding endpoint to a new user is a normal state — same machine, two
 * Discord logins. We overwrite `userId` rather than rejecting.
 */
export async function savePushSubscriptionAction(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
}): Promise<SavePushSubscriptionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };

  const parsed = SubscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "invalid subscription",
    };
  }

  await db.pushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },
    update: {
      userId: session.user.id,
      p256dh: parsed.data.p256dh,
      auth: parsed.data.auth,
      userAgent: parsed.data.userAgent ?? null,
      lastUsedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.p256dh,
      auth: parsed.data.auth,
      userAgent: parsed.data.userAgent ?? null,
    },
  });

  return { ok: true };
}

export async function deletePushSubscriptionAction(input: {
  endpoint: string;
}): Promise<SavePushSubscriptionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };

  // Scope the delete by both endpoint AND user, so a stolen endpoint can't
  // be used to wipe someone else's subscription.
  await db.pushSubscription.deleteMany({
    where: { endpoint: input.endpoint, userId: session.user.id },
  });
  return { ok: true };
}

export type AddSheetHabit = {
  id: string;
  name: string;
  icon: string | null;
  isPublic: boolean;
};

/**
 * Lightweight habit list for the mobile AddSheet's "log a habit" inline
 * picker. Active habits only — archived ones can't accept new logs. Lazy
 * fetched when the sheet opens so the layout doesn't pay for a query the
 * user never triggers.
 */
export async function getMyHabitsForAddSheet(): Promise<
  | { ok: true; habits: AddSheetHabit[] }
  | { ok: false; message: string }
> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };

  const habits = await db.habit.findMany({
    where: { userId: session.user.id, status: "active" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, icon: true, isPublic: true },
  });

  return { ok: true, habits };
}
