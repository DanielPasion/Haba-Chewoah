"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { createNotification } from "~/server/notifications";
import {
  type HabitLogMediaUploadGrant,
  VIDEO_MAX_DURATION_MS,
  deleteHabitLogMediaObject,
  isOwnedHabitLogMediaKey,
  ownedHabitLogMediaKeyFromPublicUrl,
  presignHabitLogMediaUpload,
  publicUrlForKey,
} from "~/server/r2";

import {
  MediaType,
  NotificationType,
  Prisma,
} from "../../../../generated/prisma";

// Same regex used by the comment renderer (`comment-section.tsx`); kept in
// sync with NOTES.md §4 (3–32 chars of [A-Za-z0-9_]). The `(?<=^|\s)`
// lookbehind + `\b` boundary make `bob@example.com` NOT match (the `@` in
// emails isn't preceded by start/whitespace) per §4's "should NOT match"
// rule, while still tolerating trailing punctuation like `@alice.`.
const MENTION_RE = /(?<=^|\s)@([A-Za-z0-9_]{3,32})\b/g;

function extractMentionUsernames(content: string): string[] {
  const found = new Set<string>();
  for (const match of content.matchAll(MENTION_RE)) {
    if (match[1]) found.add(match[1].toLowerCase());
  }
  return Array.from(found);
}

function summarizeForPush(text: string, max = 120): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

// ============================================================
// SHARED HELPERS
// ============================================================

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

// Habit logs are visible if (a) the habit is public OR the viewer owns it,
// AND (b) no block exists between the viewer and the log's author in
// either direction. Used by every read + write path so privacy doesn't
// drift between calls. NOTES.md §9 mandates app-layer block enforcement
// on likes + comments.
async function ensureLogVisible(habitLogId: string, viewerId: string) {
  const log = await db.habitLog.findUnique({
    where: { id: habitLogId },
    select: {
      id: true,
      userId: true,
      habit: { select: { id: true, isPublic: true, userId: true } },
    },
  });
  if (!log) return null;
  const isOwnerOfHabit = log.habit.userId === viewerId;
  if (!log.habit.isPublic && !isOwnerOfHabit) return null;

  // Self-likes/comments don't need a block check; for everyone else,
  // either direction of the block relationship hides the log.
  if (log.userId !== viewerId) {
    const block = await db.block.findFirst({
      where: {
        OR: [
          { blockerId: viewerId, blockedId: log.userId },
          { blockerId: log.userId, blockedId: viewerId },
        ],
      },
      select: { blockerId: true },
    });
    if (block) return null;
  }
  return log;
}

// ============================================================
// CREATE LOG
// ============================================================

const CreateLogSchema = z.object({
  habitId: z.string().regex(UUID_RE, "invalid habit id"),
  notes: z
    .string()
    .trim()
    .max(2000, "note is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  mediaObjectKey: z
    .string()
    .max(200)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  mediaType: z.enum([MediaType.photo, MediaType.video]).optional().nullable(),
  mediaDurationMs: z.coerce
    .number()
    .int()
    .positive()
    .max(VIDEO_MAX_DURATION_MS, "video too long")
    .optional()
    .nullable(),
});

export type CreateHabitLogResult =
  | { ok: true; habitLogId: string }
  | { ok: false; message: string };

function readCreateLogForm(formData: FormData) {
  const rawDuration = formData.get("mediaDurationMs");
  return {
    habitId: formData.get("habitId"),
    notes: formData.get("notes"),
    mediaObjectKey: formData.get("mediaObjectKey"),
    mediaType: formData.get("mediaType") || undefined,
    mediaDurationMs:
      rawDuration == null || rawDuration === "" ? undefined : rawDuration,
  };
}

export async function createHabitLogAction(
  formData: FormData,
): Promise<CreateHabitLogResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (!session.user.username) {
    return { ok: false, message: "finish creating your account first" };
  }

  const parsed = CreateLogSchema.safeParse(readCreateLogForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "invalid input",
    };
  }
  const { habitId, notes, mediaObjectKey, mediaType, mediaDurationMs } =
    parsed.data;

  // Ownership: a user can only log their own habits, and only when the
  // habit is still active. Mirrors the rule documented in NOTES.md §7.
  // Any reject after this point that originated a successful R2 upload
  // must clean it up — see `failWithCleanup` below.
  const habit = await db.habit.findUnique({
    where: { id: habitId },
    select: { id: true, userId: true, status: true },
  });

  // The reject helper deletes a successfully-uploaded R2 object whenever
  // the log row creation is rejected — without this, every "habit not
  // active" / "habit not found" response would leak the upload (NOTES.md
  // §17 cleanup contract). Only call after the ownership prefix check
  // passes, otherwise we'd be deleting another user's object.
  async function failWithCleanup(message: string): Promise<CreateHabitLogResult> {
    if (
      mediaObjectKey &&
      isOwnedHabitLogMediaKey(mediaObjectKey, session!.user.id)
    ) {
      await deleteHabitLogMediaObject(mediaObjectKey);
    }
    return { ok: false, message };
  }

  if (!habit || habit.userId !== session.user.id) {
    return failWithCleanup("habit not found");
  }
  if (habit.status !== "active") {
    return failWithCleanup("habit is no longer active");
  }

  // Media validation — server is the floor. Even though the client
  // enforces type/duration, the DB CHECK + this guard catch malice.
  let mediaUrl: string | null = null;
  let resolvedType: MediaType | null = null;
  let resolvedDuration: number | null = null;
  if (mediaObjectKey) {
    if (!isOwnedHabitLogMediaKey(mediaObjectKey, session.user.id)) {
      // Don't run cleanup here — the key isn't ours, deleting it would
      // wipe someone else's upload.
      return { ok: false, message: "media key does not belong to you" };
    }
    if (!mediaType) {
      return failWithCleanup("media type is required when uploading");
    }
    if (mediaType === MediaType.video) {
      if (!mediaDurationMs) {
        return failWithCleanup("video duration is required");
      }
      resolvedDuration = mediaDurationMs;
    }
    mediaUrl = publicUrlForKey(mediaObjectKey);
    resolvedType = mediaType;
  }

  let createdId: string;
  try {
    const created = await db.habitLog.create({
      data: {
        habitId: habit.id,
        userId: session.user.id,
        completedAt: new Date(),
        notes,
        mediaUrl,
        mediaType: resolvedType,
        mediaDurationMs: resolvedDuration,
      },
      select: { id: true },
    });
    createdId = created.id;
  } catch (err) {
    if (mediaObjectKey) await deleteHabitLogMediaObject(mediaObjectKey);
    throw err;
  }

  revalidatePath(`/habit/${habit.id}`);
  revalidatePath("/feed");
  revalidatePath(`/profile/${session.user.username}`);

  return { ok: true, habitLogId: createdId };
}

// ============================================================
// DELETE LOG
// ============================================================

export type DeleteHabitLogResult =
  | { ok: true; habitId: string }
  | { ok: false; message: string };

export async function deleteHabitLogAction(
  habitLogId: string,
): Promise<DeleteHabitLogResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (!isUuid(habitLogId)) return { ok: false, message: "invalid log id" };

  const log = await db.habitLog.findUnique({
    where: { id: habitLogId },
    select: { id: true, userId: true, habitId: true, mediaUrl: true },
  });
  if (!log || log.userId !== session.user.id) {
    return { ok: false, message: "log not found" };
  }

  await db.habitLog.delete({ where: { id: log.id } });

  // Best-effort R2 cleanup — same contract as avatar deletes. Per
  // NOTES.md §17 we never want a storage failure to mask the DB result.
  if (log.mediaUrl) {
    const key = ownedHabitLogMediaKeyFromPublicUrl(
      log.mediaUrl,
      session.user.id,
    );
    if (key) await deleteHabitLogMediaObject(key);
  }

  revalidatePath(`/habit/${log.habitId}`);
  revalidatePath("/feed");
  if (session.user.username) {
    revalidatePath(`/profile/${session.user.username}`);
  }

  return { ok: true, habitId: log.habitId };
}

// ============================================================
// PRESIGN MEDIA UPLOAD
// ============================================================

export async function getHabitLogMediaUploadUrl(input: {
  contentType: string;
  habitId: string;
}): Promise<
  | { ok: true; grant: HabitLogMediaUploadGrant }
  | { ok: false; message: string }
> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (!isUuid(input.habitId)) {
    return { ok: false, message: "invalid habit id" };
  }

  // Gate the presign on ownership + active state — without this an
  // attacker who knows the URL can burn presigned slots and the rejected
  // log create at submit time orphans every uploaded R2 object.
  const habit = await db.habit.findUnique({
    where: { id: input.habitId },
    select: { userId: true, status: true },
  });
  if (!habit || habit.userId !== session.user.id) {
    return { ok: false, message: "habit not found" };
  }
  if (habit.status !== "active") {
    return { ok: false, message: "habit is no longer active" };
  }

  try {
    const grant = await presignHabitLogMediaUpload({
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

// ============================================================
// LIKES
// ============================================================

export type ToggleLikeResult =
  | { ok: true; liked: boolean; likeCount: number }
  | { ok: false; message: string };

export async function toggleLikeAction(
  habitLogId: string,
): Promise<ToggleLikeResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (!isUuid(habitLogId)) return { ok: false, message: "invalid log id" };

  const log = await ensureLogVisible(habitLogId, session.user.id);
  if (!log) return { ok: false, message: "log not found" };

  const existing = await db.like.findUnique({
    where: {
      userId_habitLogId: { userId: session.user.id, habitLogId: log.id },
    },
    select: { userId: true },
  });

  let liked: boolean;
  if (existing) {
    // `deleteMany` instead of `delete` so a concurrent unlike (count=0)
    // is a no-op rather than P2025. Same pattern as `toggleFollowAction`.
    await db.like.deleteMany({
      where: { userId: session.user.id, habitLogId: log.id },
    });
    liked = false;
  } else {
    try {
      await db.like.create({
        data: { userId: session.user.id, habitLogId: log.id },
      });
    } catch (err) {
      // Concurrent double-tap: two requests both observe `existing=null`,
      // both try to create. The second hits the (userId, habitLogId)
      // unique. End state is "liked", so report success. Mirrors the
      // P2002 handling in `toggleFollowAction`.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        const likeCount = await db.like.count({ where: { habitLogId: log.id } });
        revalidatePath(`/habit-log/${log.id}`);
        return { ok: true, liked: true, likeCount };
      }
      throw err;
    }
    liked = true;

    // Notification creation is best-effort: a duplicate or transient
    // failure must not roll back the like itself. `createNotification`
    // also fans out to web push.
    if (log.userId !== session.user.id) {
      const actorHandle = session.user.username ?? "someone";
      await createNotification({
        recipientId: log.userId,
        actorId: session.user.id,
        type: NotificationType.like,
        habitLogId: log.id,
        pushTitle: `@${actorHandle} liked your log`,
        pushBody: "tap to see it",
        pushUrl: `/habit-log/${log.id}`,
      });
    }
  }

  const likeCount = await db.like.count({ where: { habitLogId: log.id } });

  revalidatePath(`/habit-log/${log.id}`);
  revalidatePath(`/habit/${log.habit.id}`);
  revalidatePath("/feed");

  return { ok: true, liked, likeCount };
}

// ============================================================
// COMMENTS
// ============================================================

const CommentSchema = z.object({
  habitLogId: z.string().regex(UUID_RE, "invalid log id"),
  content: z
    .string()
    .trim()
    .min(1, "say something")
    .max(2000, "comment is too long"),
});

export type CreateCommentResult =
  | { ok: true; commentId: string }
  | { ok: false; message: string };

export async function createCommentAction(
  formData: FormData,
): Promise<CreateCommentResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (!session.user.username) {
    return { ok: false, message: "finish creating your account first" };
  }

  const parsed = CommentSchema.safeParse({
    habitLogId: formData.get("habitLogId"),
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "invalid input",
    };
  }
  const { habitLogId, content } = parsed.data;

  const log = await ensureLogVisible(habitLogId, session.user.id);
  if (!log) return { ok: false, message: "log not found" };

  const comment = await db.comment.create({
    data: {
      habitLogId: log.id,
      userId: session.user.id,
      content,
    },
    select: { id: true },
  });

  const actorHandle = session.user.username ?? "someone";
  const preview = summarizeForPush(content);

  // Comment-on-own-log notification (skipped when the commenter is the OP).
  if (log.userId !== session.user.id) {
    await createNotification({
      recipientId: log.userId,
      actorId: session.user.id,
      type: NotificationType.comment,
      habitLogId: log.id,
      commentId: comment.id,
      pushTitle: `@${actorHandle} commented on your log`,
      pushBody: preview,
      pushUrl: `/habit-log/${log.id}`,
    });
  }

  // Mention notifications: one per @-tagged user, EXCLUDING the log owner
  // (they already got a `comment` notif above) and the commenter themself.
  // `createNotification` filters self/blocks; we still skip the owner here
  // so the dedup is explicit rather than relying on type-only uniqueness.
  const mentionedHandles = extractMentionUsernames(content);
  if (mentionedHandles.length > 0) {
    const mentioned = await db.user.findMany({
      where: { username: { in: mentionedHandles, mode: "insensitive" } },
      select: { id: true, username: true },
    });
    for (const u of mentioned) {
      if (u.id === log.userId) continue;
      if (u.id === session.user.id) continue;
      await createNotification({
        recipientId: u.id,
        actorId: session.user.id,
        type: NotificationType.mention,
        habitLogId: log.id,
        commentId: comment.id,
        pushTitle: `@${actorHandle} mentioned you`,
        pushBody: preview,
        pushUrl: `/habit-log/${log.id}`,
      });
    }
  }

  revalidatePath(`/habit-log/${log.id}`);
  revalidatePath(`/habit/${log.habit.id}`);
  revalidatePath("/feed");

  return { ok: true, commentId: comment.id };
}

export type DeleteCommentResult =
  | { ok: true }
  | { ok: false; message: string };

export async function deleteCommentAction(
  commentId: string,
): Promise<DeleteCommentResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (!isUuid(commentId)) return { ok: false, message: "invalid comment id" };

  const comment = await db.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      userId: true,
      habitLogId: true,
      habitLog: { select: { habitId: true } },
    },
  });
  if (!comment || comment.userId !== session.user.id) {
    return { ok: false, message: "comment not found" };
  }

  await db.comment.delete({ where: { id: comment.id } });

  revalidatePath(`/habit-log/${comment.habitLogId}`);
  revalidatePath(`/habit/${comment.habitLog.habitId}`);
  revalidatePath("/feed");

  return { ok: true };
}
