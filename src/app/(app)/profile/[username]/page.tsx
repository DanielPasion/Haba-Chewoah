import { type Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { computeHabitStats, dayNumberForLog, localYmd } from "~/lib/habit-stats";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { type HabitCardData } from "../../habit/_components/habit-card";
import { type ProfileLogRow } from "../_components/profile-log-row";
import { ProfileView } from "../_components/profile-view";

const PROFILE_LOG_LIMIT = 30;

type Params = Promise<{ username: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function UserProfilePage({ params }: { params: Params }) {
  // Re-check auth here even though the (app) layout already gated it — a leak
  // here would expose private content.
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  const { username } = await params;

  const user = await db.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: {
      id: true,
      username: true,
      bio: true,
      image: true,
      timezone: true,
      _count: { select: { followers: true, following: true } },
    },
  });

  if (!user?.username) notFound();

  const isOwn = user.id === session.user.id;

  // §9 split-direction enforcement:
  //  - `theyBlockedMe`  → 404 (don't reveal the account exists at all).
  //  - `iAmBlockingThem` → render a stripped-down profile so the viewer
  //    can unblock; we still hide the target's content below.
  let iAmBlockingThem = false;
  if (!isOwn) {
    const blocks = await db.block.findMany({
      where: {
        OR: [
          { blockerId: session.user.id, blockedId: user.id },
          { blockerId: user.id, blockedId: session.user.id },
        ],
      },
      select: { blockerId: true, blockedId: true },
    });
    const theyBlockedMe = blocks.some((b) => b.blockerId === user.id);
    if (theyBlockedMe) notFound();
    iAmBlockingThem = blocks.some((b) => b.blockerId === session.user.id);
  }

  // Habits: own profile shows everything (incl. private + archived); other
  // profiles show only public + active habits, mirroring the feed gate.
  // Private logs are filtered the same way — even if a public log row got
  // attached to a now-private habit, we drop it.
  const habitWhere = isOwn
    ? { userId: user.id }
    : { userId: user.id, isPublic: true, status: "active" as const };

  const [isFollowing, habits, logsRaw] = await Promise.all([
    isOwn
      ? Promise.resolve(false)
      : db.follow
          .findUnique({
            where: {
              followerId_followingId: {
                followerId: session.user.id,
                followingId: user.id,
              },
            },
            select: { followerId: true },
          })
          .then(Boolean),
    db.habit.findMany({
      where: habitWhere,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        icon: true,
        description: true,
        frequencyType: true,
        targetCount: true,
        periodDays: true,
        isPublic: true,
        logs: { select: { completedAt: true } },
      },
    }),
    db.habitLog.findMany({
      where: {
        userId: user.id,
        // Match the habit filter exactly so day-N computation can rely on
        // `habits[n].logs` (already fetched above) instead of issuing a
        // second unbounded query for the full log history.
        ...(isOwn
          ? {}
          : { habit: { isPublic: true, status: "active" as const } }),
      },
      orderBy: { completedAt: "desc" },
      take: PROFILE_LOG_LIMIT,
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
    }),
  ]);

  let topStreak = 0;
  let totalLogs = 0;
  const habitCards: HabitCardData[] = habits.map((h) => {
    const stats = computeHabitStats({
      logs: h.logs,
      timezone: user.timezone,
      startDate: null,
      frequencyType: h.frequencyType,
      targetCount: h.targetCount,
      periodDays: h.periodDays,
    });
    if (stats.longestStreak > topStreak) topStreak = stats.longestStreak;
    totalLogs += stats.totalLogs;
    const lastLogAt =
      h.logs.length === 0
        ? null
        : h.logs.reduce(
            (latest, l) => (l.completedAt > latest ? l.completedAt : latest),
            h.logs[0]!.completedAt,
          );
    return {
      id: h.id,
      name: h.name,
      icon: h.icon,
      description: h.description,
      frequencyType: h.frequencyType,
      targetCount: h.targetCount,
      periodDays: h.periodDays,
      isPublic: h.isPublic,
      currentStreak: stats.currentStreak,
      totalLogs: stats.totalLogs,
      completion: Math.round(stats.completion * 100),
      lastLogAt,
    };
  });

  // Day-N for each log row, derived from `habits[n].logs` already fetched
  // above. Avoids a second unbounded `findMany({ where: { userId } })`
  // that previously pulled every log the user had ever made just to bucket
  // them by day. The habit + log filters now match (public+active when not
  // own), so every log in `logsRaw` has its history available here.
  const dayCountsByHabit = new Map<string, Map<string, number>>();
  for (const h of habits) {
    const m = new Map<string, number>();
    for (const l of h.logs) {
      const ymd = localYmd(l.completedAt, user.timezone);
      m.set(ymd, (m.get(ymd) ?? 0) + 1);
    }
    dayCountsByHabit.set(h.id, m);
  }

  const logRows: ProfileLogRow[] = logsRaw.map((l) => ({
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
      timezone: user.timezone,
    }),
  }));

  return (
    <ProfileView
      isOwn={isOwn}
      isFollowing={isFollowing}
      isBlockingThem={iAmBlockingThem}
      user={{
        id: user.id,
        username: user.username,
        bio: user.bio,
        imageUrl: user.image,
        followers: user._count.followers,
        following: user._count.following,
      }}
      // While I'm blocking them, hide their habits + logs but keep the
      // identity row + unblock control reachable. §9 says existing
      // content "should be filtered from view" for the blocker.
      habits={iAmBlockingThem ? [] : habitCards}
      logs={iAmBlockingThem ? [] : logRows}
      topStreak={iAmBlockingThem ? 0 : topStreak}
      totalLogs={iAmBlockingThem ? 0 : totalLogs}
    />
  );
}
