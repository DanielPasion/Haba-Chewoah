import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoText } from "~/components/brand/logo-text";
import { StickerCard } from "~/components/brand/sticker-card";
import { safeCallbackUrl } from "~/lib/safe-redirect";
import { auth } from "~/server/auth";

import { DiscordSignIn } from "./_components/discord-sign-in";
import { ErrorBanner } from "./_components/error-banner";

export const metadata: Metadata = { title: "Sign in" };

type SearchParams = Promise<{ callbackUrl?: string; error?: string }>;

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);

  if (session?.user) redirect(callbackUrl);

  return (
    <main className="grid min-h-dvh w-full place-items-center bg-hc-bg px-6 py-10">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-8">
        <Link href="/">
          <LogoText size={20} />
        </Link>

        <StickerCard size={220} label="· welcome back ·" mascotSize={170} />

        <div className="flex flex-col items-center gap-2 text-center">
          <h1
            className="font-display text-4xl font-extrabold leading-none text-hc-ink"
            style={{ letterSpacing: "-0.04em" }}
          >
            log in <span className="text-hc-accent">→</span>
          </h1>
          <p className="max-w-[320px] text-sm text-hc-muted">
            We use Discord. No passwords, no email gymnastics — one click and
            you&apos;re in.
          </p>
        </div>

        {params.error && <ErrorBanner code={params.error} />}

        <DiscordSignIn callbackUrl={callbackUrl} />

        <Link
          href="/"
          className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-hc-muted hover:text-hc-ink"
        >
          ← back to landing
        </Link>
      </div>
    </main>
  );
}
