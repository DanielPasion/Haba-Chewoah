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
        className="grid flex-1 cursor-pointer place-items-center gap-1 rounded-hc-3 border border-hc-line bg-hc-ink px-4 py-4 font-display text-base font-extrabold text-hc-brand shadow-hc-stamp transition-transform hover:-translate-y-px dark:bg-hc-brand dark:text-hc-brand-ink"
        style={{ letterSpacing: "-0.02em" }}
      >
        + log day {nextDayNumber}
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
