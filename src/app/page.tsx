import { redirect } from "next/navigation";

import { Landing } from "~/app/_components/landing";
import { auth } from "~/server/auth";

export default async function Home() {
  const session = await auth();
  // Already-authenticated users hitting "/" get sent straight into the app —
  // otherwise the marketing landing flashes for a beat (especially in the PWA
  // shortcut, where StandaloneRedirect's client-side detection lands a frame
  // late). Mid-onboarding users (no username yet) finish account creation
  // first.
  if (session?.user) {
    if (!session.user.username) redirect("/create-account");
    redirect("/feed");
  }
  return <Landing signedIn={false} />;
}
