/**
 * Profile route skeleton — mirrors the real layout (banner / avatar / stats /
 * tabs) so the page doesn't reflow when the data lands.
 */
export default function ProfileLoading() {
  return (
    <div className="-mx-5 -my-6 md:-mx-8 md:-my-8">
      {/* Mobile */}
      <div className="md:hidden">
        <section className="flex flex-col gap-4 px-5 pt-5 pb-5">
          <div className="flex items-start gap-4">
            <span className="size-22 shrink-0 animate-pulse rounded-full bg-hc-line-strong" />
            <div className="flex-1 space-y-2 pt-3">
              <Bar className="h-6 w-40" />
              <Bar className="h-3 w-24" />
            </div>
          </div>
          <Bar className="h-3 w-3/4" />
          <div className="flex gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Bar className="h-5 w-10" />
                <Bar className="h-2 w-12" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Bar className="h-10 flex-1 rounded-hc-2" />
            <Bar className="h-10 w-10 rounded-hc-2" />
          </div>
        </section>
        <div className="border-b border-hc-line" />
        <SkeletonGrid />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="h-40 animate-pulse bg-hc-line-strong" />
        <div className="-mt-14 px-8">
          <div className="flex items-end gap-5">
            <span className="size-30 shrink-0 animate-pulse rounded-full border-2 border-hc-bg bg-hc-line-strong" />
            <div className="flex-1 space-y-2 pb-3.5">
              <Bar className="h-8 w-48" />
            </div>
            <div className="pb-3.5">
              <Bar className="h-10 w-32 rounded-hc-2" />
            </div>
          </div>
          <Bar className="mt-4 h-3 w-1/2" />
          <div className="mt-5 flex gap-7">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Bar className="h-6 w-12" />
                <Bar className="h-2 w-16" />
              </div>
            ))}
          </div>
          <div className="mt-5">
            <SkeletonGrid />
          </div>
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

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 px-1 py-5 md:px-0 md:py-6 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2.5 rounded-hc-3 border border-hc-line bg-hc-surface p-3.5"
        >
          <div className="flex items-start justify-between">
            <span className="size-9 animate-pulse rounded-hc-2 bg-hc-line" />
            <Bar className="h-4 w-12" />
          </div>
          <Bar className="h-4 w-2/3" />
          <Bar className="h-9 w-16 rounded-sm" />
          <Bar className="h-2 w-3/4" />
        </div>
      ))}
    </div>
  );
}
