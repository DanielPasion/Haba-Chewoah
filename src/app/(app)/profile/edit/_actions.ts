"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

const UpdateProfileSchema = z.object({
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
  | { ok: true }
  | {
      ok: false;
      field?: "bio" | "timezone" | "avatar";
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

// Username isn't editable here — it's a unique identity slot used in share
// links and @-mentions; changing it would be a separate flow.
export async function updateProfile(
  formData: FormData,
): Promise<UpdateProfileResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (!session.user.username) {
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

  // Captured before the write so we can delete the old object after replace —
  // without this, every avatar swap leaks an R2 object indefinitely.
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

  // Must run before redirect() — that throws NEXT_REDIRECT.
  // `ownedAvatarKeyFromPublicUrl` returns null for non-R2 URLs (e.g. Discord
  // CDN avatars from OAuth) so we never touch storage we don't own.
  if (avatarObjectKey && priorImage) {
    const priorKey = ownedAvatarKeyFromPublicUrl(priorImage, session.user.id);
    if (priorKey && priorKey !== avatarObjectKey) {
      await deleteAvatarObject(priorKey);
    }
  }

  revalidatePath(`/profile/${session.user.username}`);
  revalidatePath("/profile");

  redirect(`/profile/${session.user.username}`);
}
