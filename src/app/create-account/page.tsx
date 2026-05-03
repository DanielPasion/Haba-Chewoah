import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoText } from "~/components/brand/logo-text";
import { auth } from "~/server/auth";

import { ProfileForm } from "./_components/profile-form";

export const metadata: Metadata = { title: "Create account" };

export default async function CreateAccountPage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/signin");
  if (session.user.username) redirect("/feed");

  return (
    <main className="grid min-h-dvh w-full place-items-center bg-hc-bg px-6 py-10">
      <div className="flex w-full max-w-115 flex-col items-center gap-8">
        <Link href="/">
          <LogoText size={20} />
        </Link>

        <div className="flex flex-col items-center gap-2 text-center">
          <h1
            className="font-display text-4xl font-extrabold leading-none text-hc-ink"
            style={{ letterSpacing: "-0.04em" }}
          >
            claim your username <span className="text-hc-accent">→</span>
          </h1>
          <p className="max-w-85 text-sm text-hc-muted">
            Pick a handle, a vibe, and a timezone. You can change all of this
            later.
          </p>
        </div>

        <ProfileForm defaultTimezone="UTC" />
      </div>
    </main>
  );
}
