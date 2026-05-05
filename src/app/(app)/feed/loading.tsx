/**
 * Feed loading skeleton — mirrors the FeedCard layout so the page doesn't
 * jolt when real data arrives.
 */
export default function FeedLoading() {
  return (
    <div className="-mx-5 -my-6 flex flex-col gap-4 pb-2 md:-mx-8 md:-my-8 md:gap-6">
      <header className="sticky top-0 z-10 hidden items-center border-b border-hc-line bg-hc-bg/85 px-5 py-3 backdrop-blur md:flex md:px-8 md:py-4">
        <Bar className="h-7 w-20" />
      </header>

      <section className="md:hidden">
        <div className="mb-2.5 flex items-baseline justify-between gap-2 px-5">
          <Bar className="h-4 w-20" />
          <Bar className="h-3 w-24" />
        </div>
        <div className="flex gap-2.5 px-5 pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex w-30 shrink-0 flex-col items-center gap-2 rounded-hc-3 border border-hc-line bg-hc-surface px-3 py-3.5"
            >
              <span className="size-10 animate-pulse rounded-full bg-hc-line-strong" />
              <Bar className="h-3 w-20" />
              <Bar className="h-2.5 w-12" />
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-180 flex-col gap-3 px-3 md:px-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} hasMedia={i % 2 === 0} />
        ))}
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

function CardSkeleton({ hasMedia }: { hasMedia: boolean }) {
  return (
    <article className="overflow-hidden rounded-hc-3 border border-hc-line bg-hc-surface">
      <div className="flex items-center gap-3 px-4 pt-4">
        <span className="size-10 shrink-0 animate-pulse rounded-full bg-hc-line-strong" />
        <div className="flex-1 space-y-2">
          <Bar className="h-3 w-40" />
          <Bar className="h-2.5 w-28" />
        </div>
        <Bar className="h-7 w-24 rounded-full" />
      </div>
      <div className="space-y-2 px-4 pb-3 pt-3">
        <Bar className="h-3 w-3/4" />
        <Bar className="h-3 w-1/2" />
      </div>
      {hasMedia && (
        <div className="aspect-[4/5] animate-pulse border-y border-hc-line bg-hc-line" />
      )}
      <div className="flex items-center gap-5 px-4 py-3">
        <Bar className="h-5 w-10" />
        <Bar className="h-5 w-10" />
      </div>
    </article>
  );
}
