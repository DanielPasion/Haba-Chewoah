import "server-only";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "~/env";

// `requestChecksumCalculation: "WHEN_REQUIRED"` is critical: post-Jan-2025
// @aws-sdk/client-s3 defaults to "WHEN_SUPPORTED", which bakes
// `x-amz-sdk-checksum-algorithm` into presigned PutObject URLs. R2 rejects
// those and the browser surfaces it as a CORS/network error. Same for
// response checksum validation. Region must be "auto" — R2 ignores it.
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

// Time-limited, not single-use: the holder can PUT to the key any number of
// times within the expiry window. Safe because the key is server-generated
// (UUID) and `isOwnedAvatarKey` prevents another user from claiming it.
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

// Fire-and-forget — a cleanup failure must never mask the real error.
export async function deleteAvatarObject(objectKey: string): Promise<void> {
  try {
    await r2.send(
      new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: objectKey }),
    );
  } catch (err) {
    console.warn("[r2] orphan delete failed", { objectKey, err });
  }
}

// Server-side guard so a malicious client can't claim another user's object.
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

// Returns null for non-R2 URLs (e.g. Discord CDN avatars) so cleanup paths
// never try to delete storage we don't own.
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

// ============================================================
// Habit-log media (photo + short video). Mirrors the avatar pattern:
// time-limited presigned PUT, server-issued object key, ownership prefix
// guard. Limits + the R2 cleanup contract live in
// `.claude/db/NOTES.md §17`.
// ============================================================

const ALLOWED_PHOTO_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const ALLOWED_VIDEO_MIME = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);
const MEDIA_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

const PHOTO_MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const VIDEO_MAX_BYTES = 30 * 1024 * 1024; // 30 MB — headroom for 15s @ ~16Mbps
export const VIDEO_MAX_DURATION_MS = 15_000;

const MEDIA_PRESIGN_EXPIRES_SECONDS = 600; // 10 min — videos take longer

export type HabitLogMediaKind = "photo" | "video";

export type HabitLogMediaUploadGrant = {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  kind: HabitLogMediaKind;
  maxBytes: number;
};

export async function presignHabitLogMediaUpload({
  userId,
  contentType,
}: {
  userId: string;
  contentType: string;
}): Promise<HabitLogMediaUploadGrant> {
  const kind: HabitLogMediaKind | null = ALLOWED_PHOTO_MIME.has(contentType)
    ? "photo"
    : ALLOWED_VIDEO_MIME.has(contentType)
      ? "video"
      : null;
  if (!kind) {
    throw new Error(`unsupported media content-type: ${contentType}`);
  }

  const ext = MEDIA_MIME_TO_EXT[contentType]!;
  const objectKey = `habit-logs/${userId}/${crypto.randomUUID()}.${ext}`;
  const maxBytes = kind === "photo" ? PHOTO_MAX_BYTES : VIDEO_MAX_BYTES;

  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: objectKey,
    ContentType: contentType,
    ContentLength: undefined,
  });

  const uploadUrl = await getSignedUrl(r2, command, {
    expiresIn: MEDIA_PRESIGN_EXPIRES_SECONDS,
  });

  return {
    uploadUrl,
    objectKey,
    publicUrl: `${env.R2_PUBLIC_URL}/${objectKey}`,
    kind,
    maxBytes,
  };
}

export function isOwnedHabitLogMediaKey(
  objectKey: string,
  userId: string,
): boolean {
  return (
    objectKey.startsWith(`habit-logs/${userId}/`) &&
    !objectKey.includes("..") &&
    objectKey.length < 200
  );
}

export function ownedHabitLogMediaKeyFromPublicUrl(
  url: string,
  userId: string,
): string | null {
  const prefix = `${env.R2_PUBLIC_URL}/`;
  if (!url.startsWith(prefix)) return null;
  const key = url.slice(prefix.length);
  return isOwnedHabitLogMediaKey(key, userId) ? key : null;
}

// Fire-and-forget — same contract as `deleteAvatarObject`. R2 cleanup
// must not mask the real error from the caller.
export async function deleteHabitLogMediaObject(
  objectKey: string,
): Promise<void> {
  try {
    await r2.send(
      new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: objectKey }),
    );
  } catch (err) {
    console.warn("[r2] habit-log media delete failed", { objectKey, err });
  }
}

export const HABIT_LOG_MEDIA_LIMITS = {
  photo: {
    maxBytes: PHOTO_MAX_BYTES,
    acceptMime: Array.from(ALLOWED_PHOTO_MIME),
  },
  video: {
    maxBytes: VIDEO_MAX_BYTES,
    maxDurationMs: VIDEO_MAX_DURATION_MS,
    acceptMime: Array.from(ALLOWED_VIDEO_MIME),
  },
} as const;
