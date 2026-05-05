import Link from "next/link";

export type TodayStreak = {
  id: string;
  name: string;
  icon: string | null;
  day: number;
  done: boolean;
};

/**
 * Mobile-only "today" strip on the feed — mirrors `.claude/ui/project/home-feed.jsx`
 * `MyStreaks`. Horizontal scroll list of the viewer's active habits with a
 * brand surface when logged today, neutral when due.
 *
 * Desktop hides this (`md:hidden`) because the right rail already surfaces
 * the same data; duplicating it would just push real feed cards down.
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
          className="font-display text-sm font-extrabold leading-none text-hc-ink"
          style={{ letterSpacing: "-0.02em" }}
        >
          today · {done} of {total}
        </h2>
      </div>

      <div className="flex gap-2.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {items.map((it) => (
          <Link
            key={it.id}
            href={`/habit/${it.id}`}
            className={`grid w-25 shrink-0 grid-rows-[auto_1fr_auto] place-items-center gap-1.5 rounded-hc-3 border-hc px-2 py-3 text-center transition-transform hover:-translate-y-px ${
              it.done
                ? "border-hc-ink bg-hc-brand"
                : "border-hc-line-strong bg-hc-surface"
            }`}
          >
            <span
              className={`grid size-9 place-items-center rounded-hc-2 text-xl ${
                it.done
                  ? "border border-hc-brand-ink/15 bg-hc-brand-ink/10 text-hc-brand-ink"
                  : "border border-hc-line-strong bg-hc-bg text-hc-ink"
              }`}
              aria-hidden
            >
              {it.icon ?? "✨"}
            </span>
            <div
              className={`self-start font-sans text-hc-meta font-bold leading-tight ${
                it.done ? "text-hc-brand-ink" : "text-hc-ink"
              }`}
            >
              {it.name}
            </div>
            <div
              className={`whitespace-nowrap font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow ${
                it.done ? "text-hc-brand-ink" : "text-hc-muted"
              }`}
            >
              {it.done ? `✓ day ${it.day}` : `day ${it.day}`}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
