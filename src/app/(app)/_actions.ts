"use server";

import { signOut } from "~/server/auth";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
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
