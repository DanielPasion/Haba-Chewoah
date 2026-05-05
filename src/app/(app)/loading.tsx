/**
 * Default in-app loading state. Scoped at the (app) segment so the persistent
 * layout chrome (sidebar, top bars, right rail) stays put — without this,
 * navigations between (app) pages fall through to `src/app/loading.tsx`
 * which replaces the entire viewport and produces a full-page flash.
 *
 * Specific pages can still override this with their own `loading.tsx`.
 */
export default function AppLoading() {
  return (
    <div className="-mx-5 -my-6 flex flex-col gap-4 md:-mx-8 md:-my-8 md:gap-6">
      <div className="flex items-center justify-between border-b border-hc-line px-5 py-3 md:px-8 md:py-4">
        <Bar className="h-6 w-32" />
        <Bar className="h-7 w-24 rounded-full" />
      </div>
      <div className="mx-auto flex w-full max-w-180 flex-col gap-3 px-3 md:px-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
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

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-hc-3 border-hc border-hc-line bg-hc-surface">
      <div className="flex items-start gap-3 p-3.5">
        <span className="size-10 shrink-0 animate-pulse rounded-full bg-hc-line-strong" />
        <div className="flex-1 space-y-2">
          <Bar className="h-3 w-32" />
          <Bar className="h-2.5 w-20" />
        </div>
      </div>
      <div className="mx-3.5 aspect-[4/3] animate-pulse rounded-hc-2 bg-hc-line" />
      <div className="space-y-2 p-4">
        <Bar className="h-3 w-3/4" />
        <Bar className="h-3 w-1/2" />
      </div>
    </div>
  );
}
