import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  return (
    <main>
      <h1
        className="font-display text-4xl font-extrabold leading-none text-hc-ink"
        style={{ letterSpacing: "-0.04em" }}
      >
        profile
      </h1>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-hc-muted">
        @{session.user.username}
      </p>
    </main>
  );
}
