"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
import { HabitIcon } from "~/components/habit-icon";

import { type AddSheetHabit, getMyHabitsForAddSheet } from "../_actions";

/**
 * Add-sheet trigger button. The same component drives:
 *
 *  - **Mobile bottom FAB** (variant `fab`) — large floating button.
 *  - **Desktop top-bar `+`** (variant `topbar`) — compact 36px button.
 *
 * Variant only swaps the trigger visuals; the sheet that opens is the same
 * (responsive: bottom sheet on mobile, centered modal on desktop).
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
      ? "-mt-9 grid size-14 cursor-pointer place-items-center rounded-full bg-hc-brand text-hc-brand-ink shadow-hc-lg ring-4 ring-hc-surface transition-transform hover:-translate-y-px"
      : "grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-hc-ink text-hc-bg transition-colors hover:bg-hc-ink-soft dark:bg-hc-brand dark:text-hc-brand-ink";

  const iconSize = variant === "fab" ? 26 : 18;

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
      className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center md:p-6"
    >
      <button
        type="button"
        aria-label="close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-hc-ink/40 backdrop-blur-sm"
      />

      <div
        className="relative max-h-[85dvh] w-full overflow-hidden rounded-t-hc-5 border border-b-0 border-hc-line bg-hc-bg shadow-hc-lg md:max-w-md md:rounded-hc-5 md:border md:shadow-hc-lg"
        style={{ animation: "hc-sheet-up 220ms cubic-bezier(.2,.9,.3,1)" }}
      >
        <div className="px-5 pt-3.5 md:pt-5">
          <div
            className="mx-auto mb-3.5 h-1.5 w-12 rounded-full bg-hc-line-strong md:hidden"
            aria-hidden
          />

          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <p className="font-mono text-hc-eyebrow font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
                log a habit
              </p>
              <h2
                className="mt-1 font-display text-2xl font-extrabold text-hc-ink"
                style={{ letterSpacing: "-0.03em" }}
              >
                what did you do today?
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="font-sans text-sm font-semibold text-hc-muted hover:text-hc-ink"
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
            <div className="mb-3 flex flex-col items-center gap-3 rounded-hc-3 border border-dashed border-hc-line-strong bg-hc-surface-alt px-5 py-8 text-center">
              <TwoFaceMascot size={48} mood="default" bg="#1B1726" />
              <div className="flex flex-col gap-1">
                <p className="font-display text-base font-extrabold text-hc-ink">
                  no active habits yet
                </p>
                <p className="text-sm text-hc-muted">
                  start one below and it&rsquo;ll show up here.
                </p>
              </div>
            </div>
          ) : (
            <ul className="mb-3 flex flex-col gap-1.5">
              {habits.map((h) => (
                <li key={h.id}>
                  <Link
                    href={`/habit/${h.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-hc-3 border border-hc-line bg-hc-surface p-3 transition-colors hover:bg-hc-surface-alt"
                  >
                    <HabitIcon value={h.icon} size={42} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-sans text-sm font-bold text-hc-ink">
                        {h.name}
                      </div>
                      <div className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
                        {h.isPublic ? "public" : "private"}
                      </div>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.85"
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

        <div className="border-t border-hc-line bg-hc-bg px-5 pb-7 pt-3.5">
          <Link
            href="/habit/new"
            onClick={onClose}
            className="flex w-full items-center gap-3.5 rounded-hc-3 bg-hc-ink px-4 py-3.5 text-left text-hc-bg transition-colors hover:bg-hc-ink-soft dark:bg-hc-brand dark:text-hc-brand-ink"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 font-display text-lg font-extrabold dark:bg-hc-brand-ink/15">
              +
            </span>
            <span className="flex-1">
              <span
                className="block font-display text-sm font-extrabold"
                style={{ letterSpacing: "-0.02em" }}
              >
                start a new habit
              </span>
              <span className="block font-sans text-xs opacity-75">
                set the rule, log day one
              </span>
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.85"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="opacity-80"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
