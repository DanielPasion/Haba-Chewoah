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
        <SkeletonTabs />
        <SkeletonLogsList />
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
            <SkeletonTabs />
            <SkeletonLogsList />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonTabs() {
  return (
    <div className="flex gap-1 border-b border-hc-line px-1">
      {["logs", "habits"].map((label, i) => (
        <div
          key={label}
          className={`relative flex items-center gap-1.5 px-3.5 py-3 ${
            i === 0 ? "" : "opacity-60"
          }`}
        >
          <Bar className="h-4 w-12" />
          <Bar className="h-3.5 w-6 rounded-full" />
          {i === 0 && (
            <span className="absolute inset-x-2 -bottom-px h-hc-tabline rounded-sm bg-hc-line-strong" />
          )}
        </div>
      ))}
    </div>
  );
}

function SkeletonLogsList() {
  return (
    <div className="flex flex-col gap-3 px-1 py-5 md:px-0 md:py-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-hc-3 border-hc border-hc-line bg-hc-surface p-3.5"
        >
          <span className="size-12 shrink-0 animate-pulse rounded-hc-2 bg-hc-line-strong" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Bar className="h-4 w-24 rounded-full" />
              <Bar className="h-3 w-12" />
            </div>
            <Bar className="h-3 w-3/4" />
            <Bar className="h-3 w-1/2" />
          </div>
        </div>
      ))}
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

