import Link from "next/link";

import { HabitIcon } from "~/components/habit-icon";

export type TodayStreak = {
  id: string;
  name: string;
  icon: string | null;
  day: number;
  done: boolean;
};

/**
 * Mobile-only "today" strip on the feed. Horizontal scroll of the viewer's
 * active habits with a quiet check-state — done habits get a thin ink ring;
 * undone stay neutral. The day number sits as a soft eyebrow under the name
 * so the row reads name-first, status-second.
 *
 * Desktop hides this (`md:hidden`) because the right rail surfaces the same
 * data; duplicating it would push real feed cards down.
 */
export function TodayStreaksStrip({
  items,
}: {
  items: TodayStreak[];
}) {
  if (items.length === 0) return null;

  const done = items.filter((i) => i.done).length;
  const total = items.length;

  return (
    <section className="md:hidden">
      <div className="mb-2.5 flex items-baseline justify-between gap-2 px-5">
        <h2
          className="font-display text-base font-extrabold text-hc-ink"
          style={{ letterSpacing: "-0.03em" }}
        >
          today
        </h2>
        <span className="font-mono text-hc-tiny font-semibold text-hc-muted">
          {done} of {total} done
        </span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {items.map((it) => (
          <Link
            key={it.id}
            href={`/habit/${it.id}`}
            className={`group flex w-30 shrink-0 flex-col items-center gap-2 rounded-hc-3 bg-hc-surface px-3 py-3.5 text-center transition-transform hover:-translate-y-px ${
              it.done
                ? "border-hc border-hc-ink"
                : "border border-hc-line"
            }`}
          >
            <HabitIcon value={it.icon} size={42} emphasis={it.done ? "strong" : "soft"} />
            <span className="line-clamp-1 self-stretch font-sans text-xs font-bold text-hc-ink">
              {it.name}
            </span>
            <span
              className={`font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow-narrow ${
                it.done ? "text-hc-ink" : "text-hc-muted"
              }`}
            >
              {it.done ? "done · " : ""}day {it.day}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
