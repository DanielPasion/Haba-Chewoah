import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

import { signOutAction } from "./_actions";
import {
  AppMobileTabBar,
  AppMobileTopBar,
  AppSidebar,
} from "./_components/app-nav";

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

  return (
    <div className="flex min-h-dvh w-full bg-hc-bg">
      <AppSidebar
        username={username}
        displayName={displayName}
        signOutAction={signOutAction}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppMobileTopBar />
        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
        <AppMobileTabBar />
      </div>
    </div>
  );
}
