"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import {
  type AvatarUploadGrant,
  deleteAvatarObject,
  isOwnedAvatarKey,
  presignAvatarUpload,
  publicUrlForKey,
} from "~/server/r2";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,32}$/;

const ProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(USERNAME_RE, "3–32 chars · letters, numbers, underscore"),
  bio: z
    .string()
    .trim()
    .max(160, "bio is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  timezone: z
    .string()
    .min(1)
    .max(64)
    // IANA tz strings look like Region/City — keep this loose; the <select>
    // is a closed set, but a malicious client could send anything.
    .regex(/^[A-Za-z_+\-/]+$/, "invalid timezone"),
  avatarObjectKey: z
    .string()
    .max(200)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type CreateProfileResult =
  | { ok: true }
  | { ok: false; field?: "username" | "bio" | "timezone" | "avatar"; message: string };

/**
 * Issue a presigned R2 PUT URL for the *current* user's avatar. Auth is
 * enforced here — anyone calling this without a session gets nothing.
 */
export async function getAvatarUploadUrl(input: {
  contentType: string;
}): Promise<{ ok: true; grant: AvatarUploadGrant } | { ok: false; message: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };

  try {
    const grant = await presignAvatarUpload({
      userId: session.user.id,
      contentType: input.contentType,
    });
    return { ok: true, grant };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "could not sign upload",
    };
  }
}

/**
 * Persist the user's chosen username, bio, timezone, and avatar. Validates:
 *  - session present
 *  - user has not already onboarded (username still null)
 *  - input matches schema (regex, lengths)
 *  - avatar object key, if supplied, is namespaced under the caller's userId
 *
 * The DB write is `updateMany` with `username: null` in the WHERE clause,
 * which makes the "first writer wins" check atomic at the DB layer instead of
 * relying on the in-memory session snapshot. Without this, a double-submit
 * with two different usernames could split-brain (one write wins username,
 * the other wins avatar).
 *
 * On success, redirects to /feed (no return reaches the client). On any
 * failure path after the avatar was uploaded to R2, we best-effort delete
 * the orphaned object so we don't accumulate storage cost on aborted signups.
 */
export async function createProfile(formData: FormData): Promise<CreateProfileResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, message: "not signed in" };
  }
  if (session.user.username) {
    // Fast-fail; the atomic updateMany below is the real guard.
    return { ok: false, message: "profile already exists" };
  }

  const parsed = ProfileSchema.safeParse({
    username: formData.get("username"),
    bio: formData.get("bio"),
    timezone: formData.get("timezone"),
    avatarObjectKey: formData.get("avatarObjectKey"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path[0];
    return {
      ok: false,
      field:
        field === "username" || field === "bio" || field === "timezone"
          ? field
          : field === "avatarObjectKey"
            ? "avatar"
            : undefined,
      message: issue?.message ?? "invalid input",
    };
  }

  const { username, bio, timezone, avatarObjectKey } = parsed.data;

  if (avatarObjectKey && !isOwnedAvatarKey(avatarObjectKey, session.user.id)) {
    // Don't attempt cleanup — we don't trust this key belongs to us.
    return {
      ok: false,
      field: "avatar",
      message: "avatar key does not belong to this user",
    };
  }

  try {
    const result = await db.user.updateMany({
      where: { id: session.user.id, username: null },
      data: {
        username,
        bio,
        timezone,
        ...(avatarObjectKey
          ? { image: publicUrlForKey(avatarObjectKey) }
          : {}),
      },
    });
    if (result.count === 0) {
      // Either the row vanished or another concurrent submit beat us to it.
      if (avatarObjectKey) await deleteAvatarObject(avatarObjectKey);
      return { ok: false, message: "profile already exists" };
    }
  } catch (err) {
    // P2002 = unique constraint violation. Username is the only unique
    // field on this update path.
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: unknown }).code === "P2002"
    ) {
      if (avatarObjectKey) await deleteAvatarObject(avatarObjectKey);
      return {
        ok: false,
        field: "username",
        message: "that username is already taken",
      };
    }
    throw err;
  }

  redirect("/feed");
}
