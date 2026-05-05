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

  // Pull viewer-scoped chrome data once at the layout level — both pieces
  // (notif unread dot, right rail timezone) are shared by every (app) page,
  // and batching them here means every page render only sees one auth+user
  // round-trip rather than each page re-fetching the same fields.
  const [me, unreadCount] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { timezone: true },
    }),
    db.notification.count({
      where: { userId: session.user.id, isRead: false },
    }),
  ]);
  const timezone = me?.timezone ?? "UTC";

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
        <AppMobileTabBar />
      </div>
      <DesktopRightRail userId={session.user.id} timezone={timezone} />
    </div>
  );
}
