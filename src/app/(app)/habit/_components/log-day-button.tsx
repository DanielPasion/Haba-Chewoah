"use client";

import { useState } from "react";

import { QuickLogSheet } from "../../habit-log/_components/quick-log-sheet";

export function LogDayButton({
  habitId,
  habitName,
  habitIcon,
  nextDayNumber,
}: {
  habitId: string;
  habitName: string;
  habitIcon: string | null;
  nextDayNumber: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-hc-3 bg-hc-ink px-4 py-4 font-display text-base font-extrabold text-hc-bg transition-colors hover:bg-hc-ink-soft dark:bg-hc-brand dark:text-hc-brand-ink"
        style={{ letterSpacing: "-0.02em" }}
      >
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
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        log day {nextDayNumber}
      </button>
      {open && (
        <QuickLogSheet
          habitId={habitId}
          habitName={habitName}
          habitIcon={habitIcon}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
