"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";

export function MobileAddButton() {
  const [open, setOpen] = useState(false);

  // Don't trap scroll inside the page when the sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc closes — keeps parity with native dialogs.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="log or create"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="-mt-6 grid size-14 cursor-pointer place-items-center rounded-full border border-hc-line bg-hc-brand text-hc-brand-ink shadow-hc transition-transform hover:-translate-y-px"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {open && <AddSheet onClose={() => setOpen(false)} />}
    </>
  );
}

function AddSheet({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="what now"
      className="fixed inset-0 z-50 flex flex-col justify-end md:hidden"
    >
      <button
        type="button"
        aria-label="close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-hc-ink/40 backdrop-blur-sm"
      />

      <div
        className="relative w-full rounded-t-hc-5 border border-b-0 border-hc-line bg-hc-bg px-5 pb-7 pt-3.5 shadow-hc-lg"
        style={{ animation: "hc-sheet-up 220ms cubic-bezier(.2,.9,.3,1)" }}
      >
        <div
          className="mx-auto mb-3.5 h-1.5 w-12 rounded-full bg-hc-line-strong"
          aria-hidden
        />

        <div className="mb-3.5 flex items-baseline justify-between">
          <h2
            className="font-display text-2xl font-extrabold text-hc-ink"
            style={{ letterSpacing: "-0.03em" }}
          >
            what now?
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-hc-eyebrow font-semibold uppercase tracking-hc-eyebrow text-hc-muted"
          >
            cancel
          </button>
        </div>

        <button
          type="button"
          disabled
          title="logging coming soon"
          className="mb-3 flex w-full cursor-not-allowed items-center gap-3.5 rounded-hc-3 border border-hc-line bg-hc-brand/70 px-4 py-4 text-left opacity-90"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-hc-2 bg-hc-ink">
            <TwoFaceMascot size={36} mood="celebrate" bg="#1B1726" />
          </span>
          <span className="flex-1">
            <span
              className="block font-display text-base font-extrabold text-hc-brand-ink"
              style={{ letterSpacing: "-0.02em" }}
            >
              log a habit
            </span>
            <span className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-brand-ink/70">
              coming soon
            </span>
          </span>
        </button>

        <Link
          href="/habit/new"
          onClick={onClose}
          className="mb-4 flex w-full items-center gap-3.5 rounded-hc-3 border border-hc-line bg-hc-surface px-4 py-4 text-left transition-transform hover:-translate-y-px"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-hc-2 border border-hc-line-strong bg-hc-bg font-display text-2xl font-extrabold text-hc-ink">
            +
          </span>
          <span className="flex-1">
            <span
              className="block font-display text-base font-extrabold text-hc-ink"
              style={{ letterSpacing: "-0.02em" }}
            >
              start a new habit
            </span>
            <span className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
              say &ldquo;i bet i won&rsquo;t…&rdquo; and prove yourself wrong
            </span>
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        <div className="flex items-center gap-2.5 rounded-hc-2 bg-hc-ink px-3.5 py-2.5">
          <TwoFaceMascot size={28} mood="wink" bg="#1B1726" />
          <p className="font-sans text-xs italic text-hc-bg">
            &ldquo;you said you&rsquo;d plunge today.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
