import "server-only";

import { dayNumberForLog, localYmd } from "~/lib/habit-stats";
import { db } from "~/server/db";

import type { ProfileLogRow } from "./_components/profile-log-row";

// Lives outside `_actions.ts` because Next's "use server" file constraint
// only allows async-function exports — constants and types belong in a
// regular module.
export const PROFILE_LOG_PAGE_SIZE = 30;

export type ProfileLogsCursor = {
  completedAt: string;
  id: string;
};

export type LoadMoreProfileLogsResult =
  | { ok: true; items: ProfileLogRow[]; nextCursor: ProfileLogsCursor | null }
  | { ok: false; message: string };

export async function loadProfileLogsSlice({
  viewerId,
  targetUserId,
  before,
}: {
  viewerId: string;
  targetUserId: string;
  before: ProfileLogsCursor;
}): Promise<LoadMoreProfileLogsResult> {
  if (
    typeof before?.completedAt !== "string" ||
    typeof before?.id !== "string"
  ) {
    return { ok: false, message: "invalid cursor" };
  }
  const parsedDate = new Date(before.completedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return { ok: false, message: "invalid cursor" };
  }

  const target = await db.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, username: true, timezone: true },
  });
  if (!target?.username) return { ok: false, message: "user not found" };

  const isOwn = target.id === viewerId;

  // §9 + visibility: replicate the same filter the page uses on initial
  // load so cursor pages don't suddenly include private/archived rows.
  if (!isOwn) {
    const block = await db.block.findFirst({
      where: {
        OR: [
          { blockerId: viewerId, blockedId: target.id },
          { blockerId: target.id, blockedId: viewerId },
        ],
      },
      select: { blockerId: true },
    });
    if (block) return { ok: false, message: "user not found" };
  }

  const visibilityFilter = isOwn
    ? {}
    : { habit: { isPublic: true, status: "active" as const } };

  const logs = await db.habitLog.findMany({
    where: {
      userId: target.id,
      ...visibilityFilter,
      OR: [
        { completedAt: { lt: parsedDate } },
        { completedAt: parsedDate, id: { lt: before.id } },
      ],
    },
    orderBy: [{ completedAt: "desc" }, { id: "desc" }],
    take: PROFILE_LOG_PAGE_SIZE,
    select: {
      id: true,
      completedAt: true,
      notes: true,
      mediaUrl: true,
      mediaType: true,
      habitId: true,
      habit: {
        select: { id: true, name: true, icon: true, isPublic: true },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });
  if (logs.length === 0) {
    return { ok: true, items: [], nextCursor: null };
  }

  // Day-N needs the full owner timeline per habit that appears in this
  // batch. One bulk query keeps it to a single round-trip.
  const habitIds = [...new Set(logs.map((l) => l.habitId))];
  const ownerLogs = await db.habitLog.findMany({
    where: { userId: target.id, habitId: { in: habitIds } },
    select: { habitId: true, completedAt: true },
  });
  const dayCountsByHabit = new Map<string, Map<string, number>>();
  for (const id of habitIds) dayCountsByHabit.set(id, new Map());
  for (const l of ownerLogs) {
    const m = dayCountsByHabit.get(l.habitId)!;
    const ymd = localYmd(l.completedAt, target.timezone);
    m.set(ymd, (m.get(ymd) ?? 0) + 1);
  }

  const items: ProfileLogRow[] = logs.map((l) => ({
    id: l.id,
    completedAt: l.completedAt,
    notes: l.notes,
    mediaUrl: l.mediaUrl,
    mediaType: l.mediaType,
    habit: { id: l.habit.id, name: l.habit.name, icon: l.habit.icon },
    isLocked: !l.habit.isPublic,
    likeCount: l._count.likes,
    commentCount: l._count.comments,
    dayNumber: dayNumberForLog({
      logCompletedAt: l.completedAt,
      dayCounts: dayCountsByHabit.get(l.habitId) ?? new Map(),
      timezone: target.timezone,
    }),
  }));

  const last = logs[logs.length - 1]!;
  const nextCursor: ProfileLogsCursor | null =
    logs.length === PROFILE_LOG_PAGE_SIZE
      ? { completedAt: last.completedAt.toISOString(), id: last.id }
      : null;

  return { ok: true, items, nextCursor };
}
