import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

export const metadata: Metadata = { title: "Feed" };

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  return (
    <main>
      <h1
        className="font-display text-4xl font-extrabold leading-none text-hc-ink"
        style={{ letterSpacing: "-0.04em" }}
      >
        feed
      </h1>
    </main>
  );
}
