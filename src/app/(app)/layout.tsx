import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { getMyActiveHabitIds, getViewerContext } from "~/server/viewer";

import { signOutAction } from "./_actions";
import {
  AppDesktopTopBar,
  AppMobileTabBar,
  AppMobileTopBar,
  AppSidebar,
} from "./_components/app-nav";
import { DesktopRightRail } from "./_components/desktop-right-rail";
import { PrefetchRoutes } from "./_components/prefetch-routes";
import { PullToRefresh } from "./_components/pull-to-refresh";
import { TimezoneSync } from "./_components/timezone-sync";

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
  // page reads timezone + block/follow sets, so batching here keeps each
  // page render to one round-trip. Block-aware: §9 says blocked actors'
  // notifications are filtered from view, so the unread count must match
  // what /notifications and the right rail actually show.
  //
  // `getViewerContext` is wrapped in React.cache, so the layout, the page,
  // and the right rail share a single DB round-trip per request.
  const [viewer, habitIds] = await Promise.all([
    getViewerContext(session.user.id),
    getMyActiveHabitIds(session.user.id),
  ]);
  const timezone = viewer.timezone;
  const unreadCount = await db.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
      ...(viewer.hiddenActorIds.length > 0
        ? {
            OR: [
              { actorId: null },
              { actorId: { notIn: viewer.hiddenActorIds } },
            ],
          }
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
        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">
          <PullToRefresh>{children}</PullToRefresh>
        </main>
        <AppMobileTabBar username={username} />
      </div>
      <DesktopRightRail userId={session.user.id} timezone={timezone} />
      <TimezoneSync serverTimezone={timezone} />
      <PrefetchRoutes username={username} habitIds={habitIds} />
    </div>
  );
}
