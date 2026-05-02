"use client";

import Link from "next/link";
import { useEffect } from "react";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-hc-bg px-6">
      <div className="flex w-full max-w-[440px] flex-col items-center gap-7 text-center">
        <TwoFaceMascot size={140} mood="sweat" />

        <div className="flex flex-col gap-2">
          <h1
            className="font-display text-5xl font-extrabold leading-[0.95] text-hc-ink"
            style={{ letterSpacing: "-0.04em" }}
          >
            you <span className="text-hc-accent">won</span>
            <br />
            this round.
          </h1>
          <p className="mt-2 text-sm text-hc-muted">
            Something blew up on our end. Our streak just broke.
          </p>
          {error.digest && (
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-hc-muted">
              ref · {error.digest}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-2.5">
          <button
            type="button"
            onClick={reset}
            className="cursor-pointer rounded-hc-2 bg-hc-ink px-6 py-3.5 font-sans text-base font-bold text-hc-brand"
          >
            try again
          </button>
          <Link
            href="/"
            className="rounded-hc-2 border-[1.5px] border-hc-ink px-6 py-3 text-center font-sans text-sm font-semibold text-hc-ink"
          >
            ← back to landing
          </Link>
        </div>
      </div>
    </main>
  );
}
