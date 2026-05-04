import { type Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { HabitDetailView } from "../_components/habit-detail-view";

type Params = Promise<{ id: string }>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Metadata runs before the page body's auth/visibility check, so it must
// repeat them here — otherwise the <title> tag leaks the name of a private
// habit to anyone who guesses the URL (and `robots: noindex` only deters
// crawlers, not browser tabs or raw HTML viewers).
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const fallback: Metadata = { title: "habit", robots: { index: false } };
  const { id } = await params;
  if (!UUID_RE.test(id)) return fallback;

  const habit = await db.habit.findUnique({
    where: { id },
    select: { name: true, isPublic: true, userId: true },
  });
  if (!habit) return fallback;

  if (!habit.isPublic) {
    const session = await auth();
    if (!session?.user || session.user.id !== habit.userId) return fallback;
  }
  return {
    title: habit.name,
    robots: habit.isPublic ? undefined : { index: false, follow: false },
  };
}

export default async function HabitDetailPage({ params }: { params: Params }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  const { id } = await params;
  // Prisma's UUID column would 500 on a malformed param — guard with a
  // cheap regex first so bad URLs render the 404 page instead.
  if (!UUID_RE.test(id)) notFound();

  const habit = await db.habit.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      icon: true,
      frequencyType: true,
      targetCount: true,
      periodDays: true,
      isPublic: true,
      startDate: true,
      createdAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!habit?.user.username) notFound();

  const isOwn = habit.userId === session.user.id;
  if (!isOwn && !habit.isPublic) notFound();

  return (
    <HabitDetailView
      isOwn={isOwn}
      habit={{
        id: habit.id,
        name: habit.name,
        description: habit.description,
        icon: habit.icon,
        frequencyType: habit.frequencyType,
        targetCount: habit.targetCount,
        periodDays: habit.periodDays,
        isPublic: habit.isPublic,
        startDate: habit.startDate,
        createdAt: habit.createdAt,
        owner: {
          id: habit.user.id,
          username: habit.user.username,
          displayName: habit.user.name ?? habit.user.username,
          imageUrl: habit.user.image,
        },
      }}
    />
  );
}
