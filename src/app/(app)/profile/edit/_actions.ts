"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

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

const UpdateProfileSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(160, "bio is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  // Mirrors create-account: closed-set <select>, but a malicious client could
  // POST anything, so we still validate shape.
  timezone: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[A-Za-z_+\-/]+$/, "invalid timezone"),
  avatarObjectKey: z
    .string()
    .max(200)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type UpdateProfileResult =
  | { ok: true }
  | {
      ok: false;
      field?: "bio" | "timezone" | "avatar";
      message: string;
    };

/**
 * Issue a presigned R2 PUT URL for the *current* user's avatar. Same shape as
 * the create-account version; duplicated as a small wrapper so each route's
 * server-action surface stays self-contained and the heavy lifting lives in
 * `~/server/r2.ts`.
 */
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

/**
 * Update the current user's bio, timezone, and (optionally) the avatar URL.
 * Username is *not* editable here — it's a unique identity slot that lives on
 * share-links and @-mentions; changing it is a separate flow.
 *
 * The avatar handling mirrors create-account: the client has already PUT the
 * file directly to R2 by the time this action runs. We just validate the key
 * is namespaced under the caller's userId, then persist `image`. If the DB
 * write fails we best-effort delete the orphan; if it succeeds, we delete the
 * user's *prior* R2 avatar so swaps don't leak storage.
 */
export async function updateProfile(
  formData: FormData,
): Promise<UpdateProfileResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (!session.user.username) {
    // Onboarding incomplete — user hasn't even set a username, edit is moot.
    return { ok: false, message: "finish creating your account first" };
  }

  const parsed = UpdateProfileSchema.safeParse({
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
        field === "bio" || field === "timezone"
          ? field
          : field === "avatarObjectKey"
            ? "avatar"
            : undefined,
      message: issue?.message ?? "invalid input",
    };
  }

  const { bio, timezone, avatarObjectKey } = parsed.data;

  if (avatarObjectKey && !isOwnedAvatarKey(avatarObjectKey, session.user.id)) {
    return {
      ok: false,
      field: "avatar",
      message: "avatar key does not belong to this user",
    };
  }

  // Capture the prior image *before* the write so we can clean it up from R2
  // after a successful avatar replace. Without this every swap leaks the old
  // object indefinitely. Skipped (set to null) when the user isn't replacing
  // the avatar at all.
  const priorImage = avatarObjectKey
    ? (
        await db.user.findUnique({
          where: { id: session.user.id },
          select: { image: true },
        })
      )?.image ?? null
    : null;

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        bio,
        timezone,
        ...(avatarObjectKey
          ? { image: publicUrlForKey(avatarObjectKey) }
          : {}),
      },
    });
  } catch (err) {
    if (avatarObjectKey) await deleteAvatarObject(avatarObjectKey);
    throw err;
  }

  // Best-effort delete of the prior R2 avatar after a successful replace.
  // `ownedAvatarKeyFromPublicUrl` returns null for non-R2 URLs (e.g., the
  // Discord CDN avatar set during OAuth), so we never touch storage we
  // don't own. Must run before `redirect()` — that throws NEXT_REDIRECT.
  if (avatarObjectKey && priorImage) {
    const priorKey = ownedAvatarKeyFromPublicUrl(priorImage, session.user.id);
    if (priorKey && priorKey !== avatarObjectKey) {
      await deleteAvatarObject(priorKey);
    }
  }

  // The profile page is a server component reading from the DB — bust its
  // cache so the user sees their new bio/avatar immediately.
  revalidatePath(`/profile/${session.user.username}`);
  revalidatePath("/profile");

  redirect(`/profile/${session.user.username}`);
}
