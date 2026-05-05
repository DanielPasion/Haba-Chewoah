import Link from "next/link";

import { HabitIcon } from "~/components/habit-icon";

import type { FrequencyType } from "../../../../../generated/prisma";

export type HabitCardData = {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  frequencyType: FrequencyType;
  targetCount: number;
  periodDays: number | null;
  isPublic: boolean;
  currentStreak: number;
  totalLogs: number;
  /** Completion percentage 0..100 for the habit's current period. */
  completion: number;
  /** Most recent log timestamp; null if there are no logs. */
  lastLogAt: Date | null;
};

/**
 * Habit tile shown in the profile "habits" tab. Editorial restraint:
 *
 *  - hairline border, no fill change between public/private;
 *  - the streak number is the focal point but rendered in restrained ink;
 *  - the public/private state is a subtle eyebrow label rather than a
 *    sticker-style background swap.
 */
export function HabitCard({ habit }: { habit: HabitCardData }) {
  const hasStreak = habit.currentStreak > 0;
  return (
    <Link
      href={`/habit/${habit.id}`}
      className="group flex flex-col gap-3 rounded-hc-3 border border-hc-line bg-hc-surface p-4 transition-colors hover:bg-hc-surface-alt"
    >
      <div className="flex items-start justify-between gap-2">
        <HabitIcon value={habit.icon} size={40} />
        <span className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
          {habit.isPublic ? "public" : "private"}
        </span>
      </div>

      <h3
        className="font-display text-base font-extrabold leading-tight text-hc-ink"
        style={{ letterSpacing: "-0.03em" }}
      >
        {habit.name}
      </h3>

      <div className="mt-auto flex items-end justify-between gap-2 pt-1">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1">
            <span
              className={`font-display font-extrabold leading-none tabular-nums ${
                hasStreak ? "text-hc-ink" : "text-hc-ink/40"
              }`}
              style={{ fontSize: 32, letterSpacing: "-0.04em" }}
            >
              {habit.currentStreak}
            </span>
            <span className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
              day{habit.currentStreak === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-1 truncate font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
            {frequencyShort(habit)} · {habit.completion}%
          </div>
        </div>
        <div className="shrink-0 text-right font-mono text-hc-tiny font-medium text-hc-muted">
          {formatLastLog(habit.lastLogAt)}
        </div>
      </div>
    </Link>
  );
}

function frequencyShort(habit: HabitCardData) {
  if (habit.frequencyType === "daily") return "daily";
  if (habit.frequencyType === "weekly") {
    return `${habit.targetCount}× / week`;
  }
  return `${habit.targetCount}× / ${habit.periodDays ?? 7}d`;
}

const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function formatLastLog(date: Date | null) {
  if (!date) return "no logs";
  const now = Date.now();
  const diffSec = Math.round((date.getTime() - now) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return RTF.format(diffSec, "second");
  if (abs < 3600) return RTF.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return RTF.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 7) return RTF.format(Math.round(diffSec / 86400), "day");
  return date.toLocaleDateString();
}
