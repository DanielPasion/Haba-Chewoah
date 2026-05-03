import "server-only";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "~/env";

/**
 * R2 is S3-compatible. The endpoint is account-scoped:
 *   https://<account_id>.r2.cloudflarestorage.com
 * Region must be "auto" — R2 doesn't honor region routing.
 *
 * `requestChecksumCalculation: "WHEN_REQUIRED"` is critical: recent versions
 * of @aws-sdk/client-s3 (post-Jan 2025) default to "WHEN_SUPPORTED", which
 * bakes `x-amz-sdk-checksum-algorithm` into presigned PutObject URLs. R2
 * rejects/blocks those, and the browser surfaces it as a CORS/network error.
 * Same story for response checksum validation.
 */
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const ALLOWED_AVATAR_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const AVATAR_MAX_BYTES = 4 * 1024 * 1024; // 4 MB

export type AvatarUploadGrant = {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  maxBytes: number;
};

const AVATAR_PRESIGN_EXPIRES_SECONDS = 300; // 5 min — covers slow mobile uploads

/**
 * Issue a short-lived presigned PUT URL (5 min) scoped to a specific user's
 * avatar prefix. The browser uploads directly to R2 — we never proxy bytes.
 *
 * The URL is *time-limited*, not single-use: the holder can PUT to the same
 * key any number of times within the expiry window. That's fine because the
 * key itself is server-generated and unguessable (UUID), and namespaced as
 * `users/<userId>/avatar/<uuid>.<ext>`. The matching `isOwnedAvatarKey`
 * check at write-time prevents another user from claiming the key as theirs.
 */
export async function presignAvatarUpload({
  userId,
  contentType,
}: {
  userId: string;
  contentType: string;
}): Promise<AvatarUploadGrant> {
  if (!ALLOWED_AVATAR_MIME.has(contentType)) {
    throw new Error(`unsupported avatar content-type: ${contentType}`);
  }

  const ext = MIME_TO_EXT[contentType]!;
  const objectKey = `users/${userId}/avatar/${crypto.randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: objectKey,
    ContentType: contentType,
    ContentLength: undefined,
  });

  const uploadUrl = await getSignedUrl(r2, command, {
    expiresIn: AVATAR_PRESIGN_EXPIRES_SECONDS,
  });

  return {
    uploadUrl,
    objectKey,
    publicUrl: `${env.R2_PUBLIC_URL}/${objectKey}`,
    maxBytes: AVATAR_MAX_BYTES,
  };
}

/**
 * Best-effort delete of an R2 object. Used to clean up uploads that won't be
 * referenced — e.g., a user grabs a presigned URL, completes the upload, then
 * the profile-save step fails (username taken, race lost). Fire-and-forget;
 * we never want a cleanup failure to mask the real error from the caller.
 */
export async function deleteAvatarObject(objectKey: string): Promise<void> {
  try {
    await r2.send(
      new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: objectKey }),
    );
  } catch (err) {
    console.warn("[r2] orphan delete failed", { objectKey, err });
  }
}

/**
 * Verify that an object key belongs to the given user. Used server-side
 * before persisting an avatar URL so a malicious client can't claim
 * another user's object as their own.
 */
export function isOwnedAvatarKey(objectKey: string, userId: string): boolean {
  return (
    objectKey.startsWith(`users/${userId}/avatar/`) &&
    !objectKey.includes("..") &&
    objectKey.length < 200
  );
}

export function publicUrlForKey(objectKey: string): string {
  return `${env.R2_PUBLIC_URL}/${objectKey}`;
}

/**
 * Inverse of `publicUrlForKey` for cleanup paths. Returns the object key only
 * when the URL is an R2 avatar we host *and* belongs to the given user; otherwise
 * null. Used by /profile/edit to delete the user's prior avatar when they
 * replace it — Discord CDN URLs (e.g., the OAuth-provided default) and other
 * external URLs return null so we never try to delete something we don't own.
 */
export function ownedAvatarKeyFromPublicUrl(
  url: string,
  userId: string,
): string | null {
  const prefix = `${env.R2_PUBLIC_URL}/`;
  if (!url.startsWith(prefix)) return null;
  const key = url.slice(prefix.length);
  return isOwnedAvatarKey(key, userId) ? key : null;
}

export const AVATAR_LIMITS = {
  maxBytes: AVATAR_MAX_BYTES,
  acceptMime: Array.from(ALLOWED_AVATAR_MIME),
} as const;
