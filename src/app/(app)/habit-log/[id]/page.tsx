import { type Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { dayNumberForLog, localYmd } from "~/lib/habit-stats";

import {
  HabitLogDetailView,
  type HabitLogDetailData,
} from "../_components/habit-log-detail-view";

type Params = Promise<{ id: string }>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LIKERS_PREVIEW = 5;

// Same caveat as /habit/[id]: metadata runs *before* the page body's
// privacy check, so the `<title>` would leak the habit name to anyone who
// guesses the URL. Re-check visibility here.
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const fallback: Metadata = { title: "habit log", robots: { index: false } };
  const { id } = await params;
  if (!UUID_RE.test(id)) return fallback;

  const log = await db.habitLog.findUnique({
    where: { id },
    select: {
      habit: { select: { name: true, isPublic: true, userId: true } },
    },
  });
  if (!log) return fallback;

  if (!log.habit.isPublic) {
    const session = await auth();
    if (!session?.user || session.user.id !== log.habit.userId) return fallback;
  }
  return {
    title: `${log.habit.name} · log`,
    robots: log.habit.isPublic ? undefined : { index: false, follow: false },
  };
}

export default async function HabitLogPage({ params }: { params: Params }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const log = await db.habitLog.findUnique({
    where: { id },
    select: {
      id: true,
      completedAt: true,
      notes: true,
      mediaUrl: true,
      mediaType: true,
      mediaDurationMs: true,
      createdAt: true,
      userId: true,
      habit: {
        select: {
          id: true,
          name: true,
          icon: true,
          isPublic: true,
          userId: true,
        },
      },
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          timezone: true,
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });
  if (!log?.user.username) notFound();

  const isOwn = log.userId === session.user.id;
  if (!isOwn && !log.habit.isPublic) notFound();

  // Day-N is computed from the owner's logs (in their TZ), not the
  // viewer's — "day 47" is a fact about the streak, not the reader.
  const ownerLogs = await db.habitLog.findMany({
    where: { habitId: log.habit.id, userId: log.user.id },
    select: { completedAt: true },
  });
  const dayCounts = new Map<string, number>();
  for (const l of ownerLogs) {
    const ymd = localYmd(l.completedAt, log.user.timezone);
    dayCounts.set(ymd, (dayCounts.get(ymd) ?? 0) + 1);
  }
  const dayNumber = dayNumberForLog({
    logCompletedAt: log.completedAt,
    dayCounts,
    timezone: log.user.timezone,
  });

  // Block-aware filtering for the social slice (NOTES.md §9). Pull both
  // directions of the viewer's blocks first, then exclude those user ids
  // from likers + comments before the slice is fetched.
  const [blocksByMe, blocksOfMe] = await Promise.all([
    db.block.findMany({
      where: { blockerId: session.user.id },
      select: { blockedId: true },
    }),
    db.block.findMany({
      where: { blockedId: session.user.id },
      select: { blockerId: true },
    }),
  ]);
  const hiddenUserIds = [
    ...blocksByMe.map((b) => b.blockedId),
    ...blocksOfMe.map((b) => b.blockerId),
  ];

  const [likedRow, likers, comments] = await Promise.all([
    db.like.findUnique({
      where: {
        userId_habitLogId: { userId: session.user.id, habitLogId: log.id },
      },
      select: { userId: true },
    }),
    db.like.findMany({
      where: {
        habitLogId: log.id,
        ...(hiddenUserIds.length > 0
          ? { userId: { notIn: hiddenUserIds } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: LIKERS_PREVIEW,
      select: {
        user: {
          select: { id: true, username: true, name: true, image: true },
        },
      },
    }),
    db.comment.findMany({
      where: {
        habitLogId: log.id,
        ...(hiddenUserIds.length > 0
          ? { userId: { notIn: hiddenUserIds } }
          : {}),
      },
      orderBy: { createdAt: "asc" },
      // Cap to keep one viral log from dumping thousands of comments into
      // a single RSC payload. 200 covers every realistic case for v1; if
      // a log ever needs more, paginate via a "load older" affordance.
      take: 200,
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        user: {
          select: { id: true, username: true, name: true, image: true },
        },
      },
    }),
  ]);

  const data: HabitLogDetailData = {
    id: log.id,
    completedAt: log.completedAt,
    notes: log.notes,
    media:
      log.mediaUrl && log.mediaType
        ? {
            url: log.mediaUrl,
            type: log.mediaType,
            durationMs: log.mediaDurationMs,
          }
        : null,
    habit: {
      id: log.habit.id,
      name: log.habit.name,
      icon: log.habit.icon,
    },
    owner: {
      id: log.user.id,
      username: log.user.username,
      displayName: log.user.name ?? log.user.username,
      imageUrl: log.user.image,
      timezone: log.user.timezone,
    },
    likeCount: log._count.likes,
    commentCount: log._count.comments,
    likedByMe: !!likedRow,
    likers: likers
      .filter((l) => l.user.username)
      .map((l) => ({
        id: l.user.id,
        username: l.user.username!,
        displayName: l.user.name ?? l.user.username!,
        imageUrl: l.user.image,
      })),
    comments: comments
      .filter((c) => c.user.username)
      .map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        author: {
          id: c.user.id,
          username: c.user.username!,
          displayName: c.user.name ?? c.user.username!,
          imageUrl: c.user.image,
        },
        isMine: c.userId === session.user.id,
      })),
  };

  return (
    <HabitLogDetailView
      log={data}
      isOwn={isOwn}
      dayNumber={dayNumber}
      viewer={{
        id: session.user.id,
        username: session.user.username,
        displayName: session.user.name ?? session.user.username,
        imageUrl: session.user.image ?? null,
      }}
    />
  );
}
