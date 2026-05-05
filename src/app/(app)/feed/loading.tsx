/**
 * Feed loading skeleton — mirrors the FeedCard layout so the page doesn't
 * jolt when real data arrives.
 */
export default function FeedLoading() {
  return (
    <div className="-mx-5 -my-6 flex flex-col gap-4 pb-2 md:-mx-8 md:-my-8 md:gap-6">
      <header className="sticky top-14 z-10 flex items-center justify-between border-b border-hc-line bg-hc-bg/90 px-5 py-3 backdrop-blur md:top-0 md:px-8 md:py-4">
        <Bar className="h-7 w-20" />
        <Bar className="h-8 w-28 rounded-hc-2" />
      </header>
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
    <article className="overflow-hidden rounded-hc-3 border-hc border-hc-line bg-hc-surface">
      <div className="flex items-start gap-3 p-3.5">
        <span className="size-10 shrink-0 animate-pulse rounded-full bg-hc-line-strong" />
        <div className="flex-1 space-y-2">
          <Bar className="h-3 w-40" />
          <Bar className="h-2.5 w-24" />
        </div>
      </div>
      {hasMedia && (
        <div className="mx-3.5 aspect-[4/3] animate-pulse rounded-hc-2 bg-hc-line" />
      )}
      <div className="space-y-2 px-4 pt-3 pb-1">
        <Bar className="h-3 w-3/4" />
        <Bar className="h-3 w-1/2" />
      </div>
      <div className="flex items-center gap-4 px-4 pt-3 pb-3">
        <Bar className="h-4 w-10" />
        <Bar className="h-4 w-10" />
      </div>
    </article>
  );
}
