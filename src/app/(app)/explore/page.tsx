import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { getViewerContext } from "~/server/viewer";

import { ExploreList, type ExploreUser } from "./_components/explore-list";

export const metadata: Metadata = { title: "explore" };

const PAGE_SIZE = 200;

export default async function ExplorePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  // §9 block-aware listing — hide users blocked in either direction so the
  // viewer never lands on a profile that's going to 404 on them. Block +
  // follow sets come from the shared per-request viewer context.
  const viewer = await getViewerContext(session.user.id);
  const followingSet = viewer.followingSet;

  const users = await db.user.findMany({
    where: {
      username: { not: null },
      id: { notIn: viewer.hiddenActorIds },
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      image: true,
      createdAt: true,
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
      joinedAt: u.createdAt.toISOString(),
    }));

  return (
    <div className="-mx-5 -my-6 flex flex-col gap-5 pb-2 md:-mx-8 md:-my-8 md:gap-7">
      <header className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 flex items-center gap-3 border-b border-hc-line bg-hc-bg/85 px-5 py-3 backdrop-blur md:top-0 md:px-8 md:py-4">
        <h1
          className="font-display text-xl font-extrabold text-hc-ink md:text-2xl"
          style={{ letterSpacing: "-0.04em" }}
        >
          explore
        </h1>
      </header>

      <div className="mx-auto flex w-full max-w-260 flex-col gap-6 px-5 md:px-8">
        <section className="hidden md:block">
          <p className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
            discover
          </p>
          <h2
            className="mt-1 font-display text-3xl font-extrabold text-hc-ink"
            style={{ letterSpacing: "-0.05em" }}
          >
            Find your people.
          </h2>
          <p className="mt-1.5 max-w-lg text-[15px] leading-relaxed text-hc-muted">
            people building habits together. follow a few to fill your feed
          </p>
        </section>

        <ExploreList users={items} />
      </div>
    </div>
  );
}
