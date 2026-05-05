/**
 * Habit detail loading skeleton — hero / stats / heatmap / recent logs match
 * the real layout so there's no jolt when the page lands.
 */
export default function HabitDetailLoading() {
  return (
    <div className="-mx-5 -my-6 flex flex-col gap-5 pb-2 md:-mx-8 md:-my-8 md:gap-6">
      <header className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 flex items-center gap-3 border-b border-hc-line bg-hc-bg/90 px-5 py-3 backdrop-blur md:top-0 md:px-8 md:py-4">
        <span className="size-9 shrink-0 animate-pulse rounded-full bg-hc-line-strong" />
        <Bar className="h-4 w-40" />
      </header>

      <div className="mx-auto flex w-full max-w-180 flex-col gap-5 px-5 md:px-8 md:gap-6">
        <section className="relative overflow-hidden rounded-hc-4 border-hc border-hc-line bg-hc-surface p-6">
          <span className="absolute inset-x-0 top-0 h-1.5 bg-hc-brand" aria-hidden />
          <Bar className="h-3 w-24" />
          <Bar className="mt-4 h-9 w-2/3" />
          <Bar className="mt-5 h-20 w-40" />
          <Bar className="mt-2 h-3 w-1/2" />
        </section>

        <div className="grid grid-cols-4 overflow-hidden rounded-hc-3 border-hc border-hc-line bg-hc-surface">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-1.5 px-2 py-3 ${i < 3 ? "border-r border-hc-line-strong" : ""}`}
            >
              <Bar className="h-5 w-10" />
              <Bar className="h-2 w-12" />
            </div>
          ))}
        </div>

        <div className="rounded-hc-3 border-hc border-hc-line bg-hc-surface p-3.5">
          <div className="grid grid-cols-8 gap-1.5">
            {Array.from({ length: 56 }).map((_, i) => (
              <span
                key={i}
                aria-hidden
                className="aspect-square animate-pulse rounded-sm bg-hc-line"
              />
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-hc-3 border-hc border-hc-line bg-hc-surface p-4">
          <Bar className="h-3 w-20" />
          <Bar className="h-3 w-3/4" />
          <Bar className="h-3 w-1/2" />
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
