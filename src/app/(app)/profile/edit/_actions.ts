"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isValidTimezone } from "~/lib/timezones";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import {
  type AvatarUploadGrant,
  deleteAvatarObject,
  isOwnedAvatarKey,
  ownedAvatarKeyFromPublicUrl,
  presignAvatarUpload,
  publicUrlForKey,
} from "~/server/r2";

// NOTES.md §4 username rules — kept in sync with create-account/_actions.
const USERNAME_RE = /^[a-zA-Z0-9_]{3,32}$/;

const UpdateProfileSchema = z.object({
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
  // The <select> is a closed set, but a malicious client could POST
  // anything. `isValidTimezone` calls `Intl.DateTimeFormat` to confirm the
  // string is a real IANA name — without this, a user could store "AAAA"
  // and crash the notifications cron when it tries to format their tz.
  timezone: z
    .string()
    .refine(isValidTimezone, "invalid timezone"),
  avatarObjectKey: z
    .string()
    .max(200)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type UpdateProfileResult =
  | { ok: true; username: string }
  | {
      ok: false;
      field?: "username" | "bio" | "timezone" | "avatar";
      message: string;
    };

export async function getAvatarUploadUrl(input: {
  contentType: string;
}): Promise<
  { ok: true; grant: AvatarUploadGrant } | { ok: false; message: string }
> {
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

// Username IS editable here — but it's a unique slot used in share-links
// and @-mentions, so we re-validate uniqueness against the DB and revalidate
// the OLD username's profile path so any cached page picks up the rename.
export async function updateProfile(
  formData: FormData,
): Promise<UpdateProfileResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (!session.user.username) {
    return { ok: false, message: "finish creating your account first" };
  }

  const parsed = UpdateProfileSchema.safeParse({
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
    return {
      ok: false,
      field: "avatar",
      message: "avatar key does not belong to this user",
    };
  }

  // One read for prior state — we need the prior image (for R2 cleanup)
  // and the prior username (to push onto previousUsernames if it changed).
  // Session-cached username can be slightly stale across renames, so the
  // DB row is the source of truth here.
  const priorRow = await db.user.findUnique({
    where: { id: session.user.id },
    select: { image: true, username: true, previousUsernames: true },
  });
  const priorImage = priorRow?.image ?? null;
  const priorUsername = priorRow?.username ?? session.user.username;
  const usernameChanged = priorUsername.toLowerCase() !== username.toLowerCase();
  // Append the prior handle to history (lowercased, deduped) so a future
  // visit to /profile/<old-handle> can fall back to the renamed account.
  const nextHistory = usernameChanged
    ? Array.from(
        new Set([
          ...(priorRow?.previousUsernames ?? []),
          priorUsername.toLowerCase(),
        ]),
      ).filter((h) => h !== username.toLowerCase())
    : (priorRow?.previousUsernames ?? []);

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        username,
        bio,
        timezone,
        ...(usernameChanged ? { previousUsernames: nextHistory } : {}),
        ...(avatarObjectKey
          ? { image: publicUrlForKey(avatarObjectKey) }
          : {}),
      },
    });
  } catch (err) {
    // P2002 = unique constraint violation. Username is the only unique
    // field changed on this update path, so attribute it.
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
    if (avatarObjectKey) await deleteAvatarObject(avatarObjectKey);
    throw err;
  }

  // `ownedAvatarKeyFromPublicUrl` returns null for non-R2 URLs (e.g. Discord
  // CDN avatars from OAuth) so we never touch storage we don't own.
  if (avatarObjectKey && priorImage) {
    const priorKey = ownedAvatarKeyFromPublicUrl(priorImage, session.user.id);
    if (priorKey && priorKey !== avatarObjectKey) {
      await deleteAvatarObject(priorKey);
    }
  }

  // Revalidate both old and new username paths — the old one would otherwise
  // serve stale cached HTML, and we want the new one to render fresh.
  // The old path will now redirect (via the previousUsernames lookup in
  // /profile/[username]/page.tsx) instead of 404'ing.
  revalidatePath(`/profile/${priorUsername}`);
  revalidatePath(`/profile/${username}`);
  revalidatePath("/profile");

  return { ok: true, username };
}
