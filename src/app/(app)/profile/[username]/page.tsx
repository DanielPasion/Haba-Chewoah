import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

type Params = Promise<{ username: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function UserProfilePage({ params }: { params: Params }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  const { username } = await params;
  const isSelf = session.user.username === username;

  return (
    <main>
      <h1
        className="font-display text-4xl font-extrabold leading-none text-hc-ink"
        style={{ letterSpacing: "-0.04em" }}
      >
        profile
      </h1>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-hc-muted">
        @{username}
        {isSelf && " · this is you"}
      </p>
    </main>
  );
}
