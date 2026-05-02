import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoText } from "~/components/brand/logo-text";
import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
import { auth, signIn } from "~/server/auth";

export const metadata: Metadata = {
  title: "Sign in",
};

type SearchParams = Promise<{ callbackUrl?: string; error?: string }>;

const ERROR_COPY: Record<string, string> = {
  OAuthSignin: "Couldn't kick off Discord sign-in. Try again?",
  OAuthCallback: "Discord sent us back something we couldn't read.",
  OAuthAccountNotLinked: "That Discord account isn't linked to this user yet.",
  AccessDenied: "Discord said no. (You denied access.)",
  Default: "Something went sideways. One more shot?",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/";

  if (session?.user) redirect(callbackUrl);

  const errorMsg = params.error
    ? (ERROR_COPY[params.error] ?? ERROR_COPY.Default)
    : null;

  return (
    <main className="grid min-h-screen w-full place-items-center bg-hc-bg px-6 py-10">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-8">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoText size={20} />
        </Link>

        <div
          className="relative grid place-items-center rounded-hc-5 bg-hc-brand"
          style={{
            width: 220,
            height: 220,
            border: "2px solid var(--color-hc-ink)",
            boxShadow: "6px 6px 0 var(--color-hc-ink)",
            transform: "rotate(-2deg)",
          }}
        >
          <TwoFaceMascot size={170} />
          <div
            className="absolute font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-hc-accent-ink"
            style={{
              top: -12,
              right: -16,
              background: "var(--color-hc-accent)",
              padding: "5px 10px",
              borderRadius: 99,
              border: "2px solid var(--color-hc-ink)",
              transform: "rotate(8deg)",
            }}
          >
            · welcome back ·
          </div>
        </div>

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

        {errorMsg && (
          <div
            className="w-full rounded-hc-2 bg-hc-accent px-4 py-3 text-sm font-medium text-hc-accent-ink"
            role="alert"
          >
            {errorMsg}
          </div>
        )}

        <form
          action={async () => {
            "use server";
            await signIn("discord", { redirectTo: callbackUrl });
          }}
          className="w-full"
        >
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-hc-2 bg-hc-ink px-6 py-4 font-sans text-base font-bold text-hc-brand transition-transform hover:-translate-y-[1px]"
          >
            <DiscordLogo />
            continue with discord
          </button>
        </form>

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

function DiscordLogo() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.07.07 0 0 0-.073.035c-.21.376-.444.866-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.07.07 0 0 0-.073-.035A19.74 19.74 0 0 0 3.683 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.08.08 0 0 0 .031.055 19.9 19.9 0 0 0 5.993 3.03.07.07 0 0 0 .076-.026 14.26 14.26 0 0 0 1.226-1.994.07.07 0 0 0-.038-.097 13.1 13.1 0 0 1-1.872-.892.07.07 0 0 1-.007-.117c.126-.094.252-.192.371-.291a.07.07 0 0 1 .074-.01c3.927 1.793 8.18 1.793 12.061 0a.07.07 0 0 1 .075.01c.12.099.245.197.372.291a.07.07 0 0 1-.006.117 12.3 12.3 0 0 1-1.873.891.07.07 0 0 0-.038.098c.36.698.772 1.362 1.225 1.993a.07.07 0 0 0 .076.027 19.84 19.84 0 0 0 6.002-3.03.08.08 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.028zM8.02 15.331c-1.183 0-2.158-1.085-2.158-2.419 0-1.333.956-2.418 2.158-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.955 2.42-2.157 2.42zm7.974 0c-1.183 0-2.158-1.085-2.158-2.419 0-1.333.956-2.418 2.158-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.42-2.157 2.42z" />
    </svg>
  );
}
