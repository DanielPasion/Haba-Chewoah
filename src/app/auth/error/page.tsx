import { type Metadata } from "next";
import Link from "next/link";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";

export const metadata: Metadata = { title: "Sign-in error" };

const COPY: Record<string, { title: string; sub: string }> = {
  Configuration: {
    title: "auth misconfigured",
    sub: "The server's auth setup is borked. Check Discord credentials and the redirect URL.",
  },
  AccessDenied: {
    title: "access denied",
    sub: "Discord said no. (Probably you clicked Cancel.)",
  },
  Verification: {
    title: "link expired",
    sub: "The sign-in link is stale. Try again from the top.",
  },
  Default: {
    title: "something broke",
    sub: "Couldn't finish sign-in. Take another swing at it.",
  },
};

type SearchParams = Promise<{ error?: string }>;

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const code = params.error ?? "Default";
  const { title, sub } = COPY[code] ?? COPY.Default!;

  return (
    <main className="grid min-h-screen place-items-center bg-hc-bg px-6">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-7 text-center">
        <TwoFaceMascot size={140} mood="dead" />
        <div className="flex flex-col gap-2">
          <h1
            className="font-display text-4xl font-extrabold leading-none text-hc-ink"
            style={{ letterSpacing: "-0.04em" }}
          >
            {title}
          </h1>
          <p className="text-sm text-hc-muted">{sub}</p>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-hc-muted">
            code · {code}
          </p>
        </div>
        <Link
          href="/auth/signin"
          className="rounded-hc-2 bg-hc-ink px-6 py-3 font-sans text-sm font-bold text-hc-brand"
        >
          try again
        </Link>
      </div>
    </main>
  );
}
