"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";

import { type AddSheetHabit, getMyHabitsForAddSheet } from "../_actions";

/**
 * Add-sheet trigger button. Used twice on mobile:
 *
 *  - **Top bar `+`** (compact 36px button, matches the bell/search styling).
 *  - **Bottom FAB** (legacy slot, currently retired — see `app-nav.tsx`).
 *
 * `variant` swaps the visual treatment but the underlying open/close logic
 * stays in one place so both entry points show the same sheet.
 */
export function MobileAddButton({
  variant = "topbar",
}: {
  variant?: "topbar" | "fab";
}) {
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

  const triggerClass =
    variant === "fab"
      ? "-mt-6 grid size-14 cursor-pointer place-items-center rounded-full border border-hc-line bg-hc-brand text-hc-brand-ink shadow-hc transition-transform hover:-translate-y-px"
      : "grid size-9 cursor-pointer place-items-center rounded-full border border-hc-line bg-hc-brand text-hc-brand-ink transition-transform hover:-translate-y-px";

  const iconSize = variant === "fab" ? 24 : 18;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="log or create"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={triggerClass}
      >
        <svg
          width={iconSize}
          height={iconSize}
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
  const [habits, setHabits] = useState<AddSheetHabit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lazy-load habits the first time the sheet opens. Cancellation is
  // belt-and-suspenders: this component unmounts on close so the closure is
  // already gated, but using the ref keeps it explicit.
  useEffect(() => {
    let cancelled = false;
    getMyHabitsForAddSheet().then((res) => {
      if (cancelled) return;
      if (res.ok) setHabits(res.habits);
      else setError(res.message);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
        className="relative max-h-[85dvh] w-full overflow-hidden rounded-t-hc-5 border border-b-0 border-hc-line bg-hc-bg shadow-hc-lg"
        style={{ animation: "hc-sheet-up 220ms cubic-bezier(.2,.9,.3,1)" }}
      >
        <div className="px-5 pt-3.5">
          <div
            className="mx-auto mb-3.5 h-1.5 w-12 rounded-full bg-hc-line-strong"
            aria-hidden
          />

          <div className="mb-3 flex items-baseline justify-between">
            <div>
              <p className="font-mono text-hc-eyebrow font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
                log a habit
              </p>
              <h2
                className="mt-0.5 font-display text-2xl font-extrabold text-hc-ink"
                style={{ letterSpacing: "-0.03em" }}
              >
                what'd you do?
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-hc-eyebrow font-semibold uppercase tracking-hc-eyebrow text-hc-muted"
            >
              cancel
            </button>
          </div>
        </div>

        <div
          className="overflow-y-auto px-5"
          style={{ maxHeight: "calc(85dvh - 180px)" }}
        >
          {error ? (
            <p className="mb-3 rounded-hc-2 border-hc border-hc-line-strong bg-hc-surface px-4 py-3 font-mono text-hc-meta text-hc-accent">
              {error}
            </p>
          ) : habits === null ? (
            <div className="mb-3 flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-hc-3 border border-hc-line bg-hc-surface p-3"
                >
                  <span className="size-11 shrink-0 animate-pulse rounded-hc-2 bg-hc-line-strong" />
                  <div className="flex-1 space-y-1.5">
                    <span className="block h-3 w-32 animate-pulse rounded bg-hc-line-strong" />
                    <span className="block h-2.5 w-20 animate-pulse rounded bg-hc-line" />
                  </div>
                </div>
              ))}
            </div>
          ) : habits.length === 0 ? (
            <div className="mb-3 flex flex-col items-center gap-2 rounded-hc-3 border-hc border-dashed border-hc-line-strong bg-hc-surface-alt px-5 py-6 text-center">
              <TwoFaceMascot size={56} mood="default" bg="#1B1726" />
              <p className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-muted">
                no active habits
              </p>
              <p className="text-sm text-hc-ink">
                start one below and you'll be able to log it here.
              </p>
            </div>
          ) : (
            <ul className="mb-3 flex flex-col gap-2">
              {habits.map((h) => (
                <li key={h.id}>
                  <Link
                    href={`/habit/${h.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-hc-3 border border-hc-line bg-hc-surface p-3 transition-transform hover:-translate-y-px hover:bg-hc-surface-alt"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-hc-2 border border-hc-line-strong bg-hc-bg text-2xl">
                      {h.icon ?? "✨"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-sans text-sm font-bold text-hc-ink">
                        {h.name}
                      </div>
                      <div className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
                        {h.isPublic ? "· public" : "🔒 folder"} · tap to log
                      </div>
                    </div>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                      className="shrink-0 text-hc-muted"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-hc-line bg-hc-bg px-5 pb-7 pt-3">
          <Link
            href="/habit/new"
            onClick={onClose}
            className="flex w-full items-center gap-3.5 rounded-hc-3 border border-hc-line bg-hc-surface px-4 py-3.5 text-left transition-transform hover:-translate-y-px"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-hc-2 border border-hc-line-strong bg-hc-bg font-display text-xl font-extrabold text-hc-ink">
              +
            </span>
            <span className="flex-1">
              <span
                className="block font-display text-sm font-extrabold text-hc-ink"
                style={{ letterSpacing: "-0.02em" }}
              >
                start a new habit
              </span>
              <span className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
                say &ldquo;i bet i won&rsquo;t…&rdquo; and prove yourself wrong
              </span>
            </span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="text-hc-muted"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
