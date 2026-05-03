import { redirect } from "next/navigation";

import { auth, signOut } from "~/server/auth";

import {
  AppMobileTabBar,
  AppMobileTopBar,
  AppSidebar,
} from "./_components/app-nav";

/**
 * Authenticated app shell. Every route nested under `(app)` is gated here:
 *  1. No session  → /auth/signin
 *  2. Session but no `username` (onboarding incomplete) → /create-account
 *
 * Each page should *also* call `auth()` itself for defense-in-depth — never
 * rely on a single layer when the cost of a leak is showing private content.
 *
 * Layout chrome mirrors `.claude/ui/project/desktop.jsx` (left sidebar) and
 * `home-feed.jsx` (mobile top bar + bottom tab bar).
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const username = session.user.username;
  const displayName = session.user.name ?? username;

  return (
    <div className="flex min-h-dvh w-full bg-hc-bg">
      <AppSidebar
        username={username}
        displayName={displayName}
        signOutAction={handleSignOut}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppMobileTopBar />
        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
        <AppMobileTabBar signOutAction={handleSignOut} />
      </div>
    </div>
  );
}
