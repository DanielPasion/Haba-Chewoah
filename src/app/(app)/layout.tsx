import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { signOutAction } from "./_actions";
import {
  AppDesktopTopBar,
  AppMobileTabBar,
  AppMobileTopBar,
  AppSidebar,
} from "./_components/app-nav";
import { DesktopRightRail } from "./_components/desktop-right-rail";

// Pages nested under (app) should still call auth() themselves — layout gating
// alone isn't enough when the cost of a leak is private content.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  const username = session.user.username;
  const displayName = session.user.name ?? username;

  // Pull viewer-scoped chrome data once at the layout level — every (app)
  // page reads timezone + the unread badge, so batching here keeps each
  // page render to one round-trip. Block-aware: §9 says blocked actors'
  // notifications are filtered from view, so the unread count must match
  // what /notifications and the right rail actually show.
  const [me, blocksByMe, blocksOfMe] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { timezone: true },
    }),
    db.block.findMany({
      where: { blockerId: session.user.id },
      select: { blockedId: true },
    }),
    db.block.findMany({
      where: { blockedId: session.user.id },
      select: { blockerId: true },
    }),
  ]);
  const timezone = me?.timezone ?? "UTC";
  const hiddenActorIds = [
    ...blocksByMe.map((b) => b.blockedId),
    ...blocksOfMe.map((b) => b.blockerId),
  ];
  const unreadCount = await db.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
      ...(hiddenActorIds.length > 0
        ? { OR: [{ actorId: null }, { actorId: { notIn: hiddenActorIds } }] }
        : {}),
    },
  });

  return (
    <div className="flex min-h-dvh w-full bg-hc-bg">
      <AppSidebar
        username={username}
        displayName={displayName}
        signOutAction={signOutAction}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppMobileTopBar hasUnreadNotifications={unreadCount > 0} />
        <AppDesktopTopBar hasUnreadNotifications={unreadCount > 0} />
        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
        <AppMobileTabBar username={username} />
      </div>
      <DesktopRightRail userId={session.user.id} timezone={timezone} />
    </div>
  );
}
