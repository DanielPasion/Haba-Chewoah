import Link from "next/link";

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
 * Habit tile shown in the profile "habits" tab. Mirrors
 * `.claude/ui/project/profile-page.jsx` (`HabitCard`) — public habits get the
 * brand-yellow surface, private get the neutral surface, and the streak day
 * is the dominant focal element.
 */
export function HabitCard({ habit }: { habit: HabitCardData }) {
  const isPublic = habit.isPublic;
  const surfaceClass = isPublic
    ? "bg-hc-brand text-hc-brand-ink"
    : "bg-hc-surface text-hc-ink";
  const subtleTextClass = isPublic ? "text-hc-brand-ink/70" : "text-hc-muted";

  return (
    <Link
      href={`/habit/${habit.id}`}
      className={`group relative flex flex-col gap-2.5 rounded-hc-3 border border-hc-line p-3.5 shadow-hc-soft transition-transform hover:-translate-y-px hover:shadow-hc ${surfaceClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-hc-2 text-xl ${
            isPublic
              ? "border border-hc-brand-ink/15 bg-hc-brand-ink/10"
              : "border border-hc-line-strong bg-hc-bg"
          }`}
        >
          {habit.icon ?? "✨"}
        </span>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow ${
            isPublic
              ? "bg-hc-brand-ink text-hc-brand"
              : "bg-hc-bg text-hc-muted"
          }`}
        >
          {isPublic ? "· public" : "🔒 folder"}
        </span>
      </div>

      <h3
        className={`font-display text-sm font-extrabold leading-tight ${
          isPublic ? "text-hc-brand-ink" : "text-hc-ink"
        }`}
        style={{ letterSpacing: "-0.02em" }}
      >
        {habit.name}
      </h3>

      <div className="mt-auto flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1">
            <span
              className={`font-display text-3xl font-extrabold leading-none ${
                isPublic ? "text-hc-brand-ink" : "text-hc-ink"
              }`}
              style={{ letterSpacing: "-0.04em" }}
            >
              {habit.currentStreak}
            </span>
            <span
              className={`font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow ${subtleTextClass}`}
            >
              days
            </span>
          </div>
          <div
            className={`mt-1 truncate font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow ${subtleTextClass}`}
          >
            {frequencyShort(habit)} · {habit.completion}% rate
          </div>
        </div>
        <div
          className={`shrink-0 text-right font-mono text-hc-tiny font-semibold ${subtleTextClass}`}
        >
          <div className="opacity-70">last log</div>
          <div>{formatLastLog(habit.lastLogAt)}</div>
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
  if (!date) return "—";
  const now = Date.now();
  const diffSec = Math.round((date.getTime() - now) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return RTF.format(diffSec, "second");
  if (abs < 3600) return RTF.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return RTF.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 7) return RTF.format(Math.round(diffSec / 86400), "day");
  return date.toLocaleDateString();
}
