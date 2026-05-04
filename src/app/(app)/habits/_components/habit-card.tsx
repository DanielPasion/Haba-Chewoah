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
};

export function HabitCard({ habit }: { habit: HabitCardData }) {
  return (
    <Link
      href={`/habit/${habit.id}`}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-hc-3 border-hc border-hc-line bg-hc-surface p-4 shadow-hc-soft transition-transform hover:-translate-y-px hover:shadow-hc"
    >
      <span
        className="absolute inset-x-0 top-0 h-1 bg-hc-brand transition-all group-hover:h-1.5"
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-hc-2 border border-hc-line-strong bg-hc-bg text-xl">
            {habit.icon ?? "✨"}
          </span>
          <div className="min-w-0">
            <h3
              className="truncate font-display text-base font-extrabold leading-tight text-hc-ink"
              style={{ letterSpacing: "-0.02em" }}
            >
              {habit.name}
            </h3>
            <p className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
              {frequencyShort(habit)}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-hc-ink px-2 py-0.5 font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow text-hc-brand dark:bg-hc-brand dark:text-hc-brand-ink">
          {habit.isPublic ? "live" : "🔒"}
        </span>
      </div>

      {habit.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-hc-ink/85">
          {habit.description}
        </p>
      )}

      <div className="mt-auto flex items-baseline justify-between border-t border-hc-line pt-2.5">
        <span className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
          day 0 · no logs yet
        </span>
        <span className="font-mono text-hc-tiny font-bold text-hc-ink">
          open →
        </span>
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
