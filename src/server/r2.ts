import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
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

/**
 * Issue a single-use presigned PUT URL scoped to a specific user's avatar
 * prefix. The browser uploads directly to R2 — we never proxy bytes.
 *
 * Object keys are unguessable (UUID) and ownership-namespaced
 * (`users/<userId>/avatar/<uuid>.<ext>`) so a later "save profile" call
 * can verify the caller owns the key before persisting it.
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

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 60 });

  return {
    uploadUrl,
    objectKey,
    publicUrl: `${env.R2_PUBLIC_URL}/${objectKey}`,
    maxBytes: AVATAR_MAX_BYTES,
  };
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

export const AVATAR_LIMITS = {
  maxBytes: AVATAR_MAX_BYTES,
  acceptMime: Array.from(ALLOWED_AVATAR_MIME),
} as const;
