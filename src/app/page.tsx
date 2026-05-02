import Link from "next/link";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="font-sans bg-hc-bg-dark text-hc-ink-dark min-h-screen">
        <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-between overflow-hidden px-6 py-12 sm:px-12 sm:py-16">
          <header className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-hc-ink-dark/55">
              v1 · brand exploration · may 1, 2026
            </span>
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded-full bg-hc-brand px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-hc-brand-ink transition hover:scale-[1.03]"
            >
              {session ? "Sign out" : "Sign in"}
            </Link>
          </header>

          <div className="grid gap-12 py-16 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h1 className="font-display text-6xl font-extrabold leading-[0.95] tracking-[-0.06em] sm:text-8xl">
                haba<span className="text-hc-brand">-</span>chewoah
              </h1>
              <p className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-hc-ink-dark/55 sm:text-sm">
                habitual · i·bet·cha·won&apos;t
              </p>
              {session?.user && (
                <p className="mt-8 font-mono text-xs uppercase tracking-widest text-hc-brand">
                  · logged in as {session.user.name} ·
                </p>
              )}
            </div>
            <div className="justify-self-center sm:justify-self-end">
              <TwoFaceMascot size={240} />
            </div>
          </div>

          <div className="grid gap-8 border-t border-hc-ink-dark/15 pt-10 sm:grid-cols-3">
            <Pillar title="Brief">
              A habit-based, BeReal-style social app. Log streaks publicly (or
              keep them in a folder) and dare your friends to keep going. Gen
              Z, playful, cheeky.
            </Pillar>
            <Pillar title="Direction">
              Dare-energy first. The name&apos;s tongue-in-cheek; the brand
              should sound like it&apos;s elbowing you in the ribs.
            </Pillar>
            <Pillar title="Status">
              Currently in development. Two-Face × Dare Citrus is locked in.
              Building the PWA next.
            </Pillar>
          </div>
        </section>
      </main>
    </HydrateClient>
  );
}

function Pillar({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 font-display text-sm font-bold text-hc-brand">
        {title}
      </div>
      <p className="text-sm leading-relaxed text-hc-ink-dark/85">{children}</p>
    </div>
  );
}
