import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { ExploreList, type ExploreUser } from "./_components/explore-list";

export const metadata: Metadata = { title: "explore" };

const PAGE_SIZE = 200;

export default async function ExplorePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  // §9 block-aware listing — hide users blocked in either direction so the
  // viewer never lands on a profile that's going to 404 on them.
  const [blocksByMe, blocksOfMe, follows] = await Promise.all([
    db.block.findMany({
      where: { blockerId: session.user.id },
      select: { blockedId: true },
    }),
    db.block.findMany({
      where: { blockedId: session.user.id },
      select: { blockerId: true },
    }),
    db.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    }),
  ]);
  const hidden = new Set([
    ...blocksByMe.map((b) => b.blockedId),
    ...blocksOfMe.map((b) => b.blockerId),
  ]);
  const followingSet = new Set(follows.map((f) => f.followingId));

  const users = await db.user.findMany({
    where: {
      username: { not: null },
      id: { notIn: Array.from(hidden) },
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      image: true,
      _count: {
        select: { habits: true, followers: true },
      },
    },
  });

  const items: ExploreUser[] = users
    .filter((u) => u.id !== session.user.id && u.username)
    .map((u) => ({
      id: u.id,
      username: u.username!,
      displayName: u.name ?? u.username!,
      bio: u.bio,
      image: u.image,
      habitCount: u._count.habits,
      followerCount: u._count.followers,
      isFollowing: followingSet.has(u.id),
    }));

  return (
    <div className="-mx-5 -my-6 flex flex-col gap-4 pb-2 md:-mx-8 md:-my-8 md:gap-6">
      <header className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 flex items-center gap-3 border-b border-hc-line bg-hc-bg/90 px-5 py-3 backdrop-blur md:top-0 md:px-8 md:py-4">
        <h1
          className="font-display text-2xl font-extrabold leading-none text-hc-ink"
          style={{ letterSpacing: "-0.04em" }}
        >
          explore
        </h1>
        <span className="font-mono text-hc-eyebrow font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
          · find your people
        </span>
      </header>

      <div className="mx-auto flex w-full max-w-180 flex-col gap-4 px-5 md:px-8">
        <ExploreList users={items} />
      </div>
    </div>
  );
}
