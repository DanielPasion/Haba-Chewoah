/**
 * Explore loading skeleton — search bar + a grid of user-card placeholders.
 */
export default function ExploreLoading() {
  return (
    <div className="-mx-5 -my-6 flex flex-col gap-5 pb-2 md:-mx-8 md:-my-8 md:gap-7">
      <header className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 flex items-center gap-3 border-b border-hc-line bg-hc-bg/85 px-5 py-3 backdrop-blur md:top-0 md:px-8 md:py-4">
        <Bar className="h-7 w-24" />
      </header>

      <div className="mx-auto flex w-full max-w-260 flex-col gap-6 px-5 md:px-8">
        <section className="hidden md:block space-y-3">
          <Bar className="h-3 w-20" />
          <Bar className="h-9 w-72" />
          <Bar className="h-3 w-96" />
        </section>

        <Bar className="h-10 w-full rounded-full" />

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <li
              key={i}
              className="flex flex-col gap-3 rounded-hc-3 border border-hc-line bg-hc-surface p-4"
            >
              <div className="flex items-start gap-3">
                <span className="size-13 shrink-0 animate-pulse rounded-full bg-hc-line-strong" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Bar className="h-3.5 w-32" />
                  <Bar className="h-2.5 w-20" />
                </div>
              </div>
              <Bar className="h-3 w-full" />
              <Bar className="h-3 w-2/3" />
              <div className="mt-1 flex gap-4 border-t border-hc-line pt-3">
                <Bar className="h-3 w-16" />
                <Bar className="h-3 w-20" />
              </div>
            </li>
          ))}
        </ul>
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
