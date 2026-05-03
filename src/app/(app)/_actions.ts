"use server";

import { signOut } from "~/server/auth";

/**
 * Sign-out server action shared across the (app) shell. Defined as a top-level
 * server action so any component (sidebar, profile page, etc.) can wire up a
 * `<form action={...}>` without the parent layout having to thread a prop in.
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
