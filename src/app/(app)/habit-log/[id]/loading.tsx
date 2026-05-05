/**
 * Habit-log detail loading skeleton — author strip, media frame, caption
 * lines, reactions row, comments. Matches the new desktop max-width
 * (`max-w-130`) so the layout doesn't reflow when the real content lands.
 */
export default function HabitLogLoading() {
  return (
    <div className="-mx-5 -my-6 flex flex-col gap-4 pb-2 md:-mx-8 md:-my-8 md:gap-6">
      <header className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 flex items-center gap-3 border-b border-hc-line bg-hc-bg/90 px-5 py-3 backdrop-blur md:top-0 md:px-8 md:py-4">
        <span className="size-9 shrink-0 animate-pulse rounded-full bg-hc-line-strong" />
        <Bar className="h-4 flex-1 max-w-50" />
        <span className="size-9 shrink-0 animate-pulse rounded-full bg-hc-line-strong" />
      </header>

      <div className="mx-auto flex w-full max-w-130 flex-col gap-4 px-5 md:px-8 md:gap-5">
        <div className="flex items-center gap-3">
          <span className="size-11 shrink-0 animate-pulse rounded-full bg-hc-line-strong" />
          <div className="min-w-0 flex-1 space-y-2">
            <Bar className="h-3.5 w-32" />
            <Bar className="h-2.5 w-24" />
          </div>
          <Bar className="h-7 w-28 rounded-full" />
        </div>

        <div className="mx-auto aspect-[4/5] w-full max-w-100 animate-pulse rounded-hc-4 bg-hc-line" />

        <div className="space-y-2">
          <Bar className="h-3.5 w-5/6" />
          <Bar className="h-3.5 w-2/3" />
        </div>

        <div className="flex items-center gap-4">
          <Bar className="h-6 w-12 rounded-full" />
          <Bar className="h-6 w-12 rounded-full" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="size-8 shrink-0 animate-pulse rounded-full bg-hc-line-strong" />
              <div className="min-w-0 flex-1 space-y-1.5 rounded-hc-2 border-hc border-hc-line-strong bg-hc-surface px-3 py-2">
                <Bar className="h-3 w-24" />
                <Bar className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Bar({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse rounded-hc-2 bg-hc-line-strong ${className}`}
    />
  );
}
