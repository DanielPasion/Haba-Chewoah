"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

const TRIGGER_PX = 70;
const MAX_DRAG_PX = 110;

// Touch-driven pull-to-refresh. The wrapper renders its children unchanged
// — its only DOM contribution is the indicator strip that slides down from
// the top while the user drags, and an aria-live message during the actual
// refresh so screen-readers announce the refetch.
//
// Why DIY instead of pulling in a library: the only state we ever need is
// "how far has the user dragged" + "are we currently refreshing." The full
// gesture (touchstart → touchmove → touchend) is ~60 lines and lets us
// piggy-back on Next's `router.refresh()` rather than fight a hook that
// expects an explicit fetcher. Mouse drags are intentionally NOT bound —
// desktop has the explicit refresh button in the top bar already.
export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [refreshing, startRefresh] = useTransition();
  const startY = useRef<number | null>(null);
  const armed = useRef(false);

  useEffect(() => {
    function onStart(e: TouchEvent) {
      // Only start a pull-to-refresh gesture from the very top of the page.
      // If the user is mid-feed and swipes down, the page just scrolls and
      // we leave their position alone.
      if (window.scrollY > 0) {
        armed.current = false;
        return;
      }
      const t = e.touches[0];
      if (!t) return;
      armed.current = true;
      startY.current = t.clientY;
    }
    function onMove(e: TouchEvent) {
      if (!armed.current || startY.current == null) return;
      const t = e.touches[0];
      if (!t) return;
      const delta = t.clientY - startY.current;
      if (delta <= 0) {
        setPull(0);
        return;
      }
      // Rubber-band the drag past the trigger so it feels resistive instead
      // of running off-screen. After MAX_DRAG_PX, additional movement only
      // adds a fraction.
      const eased = delta < MAX_DRAG_PX ? delta : MAX_DRAG_PX + (delta - MAX_DRAG_PX) * 0.2;
      setPull(eased);
    }
    function onEnd() {
      if (!armed.current) return;
      armed.current = false;
      startY.current = null;
      const pulled = pull;
      setPull(0);
      if (pulled >= TRIGGER_PX && !refreshing) {
        startRefresh(() => {
          router.refresh();
        });
      }
    }
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [pull, refreshing, router]);

  const visibleOffset = refreshing ? TRIGGER_PX : pull;
  const ready = pull >= TRIGGER_PX;

  return (
    <>
      <div
        aria-hidden={!refreshing}
        className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-center"
        style={{
          transform: `translateY(${Math.max(0, visibleOffset - 36)}px)`,
          opacity: visibleOffset > 4 ? 1 : 0,
          transition: refreshing || pull === 0 ? "transform 200ms ease, opacity 200ms ease" : "none",
        }}
      >
        <div className="mt-2 flex items-center gap-2 rounded-full border border-hc-line bg-hc-surface px-3 py-1.5 shadow-hc-lg">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={refreshing ? "animate-spin text-hc-ink" : ready ? "text-hc-ink" : "text-hc-muted"}
            style={{
              transform: refreshing ? undefined : `rotate(${Math.min(360, pull * 3)}deg)`,
            }}
          >
            <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          <span
            role={refreshing ? "status" : undefined}
            className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-ink"
          >
            {refreshing ? "refreshing" : ready ? "release to refresh" : "pull to refresh"}
          </span>
        </div>
      </div>
      <div
        // Only set the transform while a pull is active or while we're
        // refreshing — a permanent transform on the wrapper would create
        // a containing block that breaks `position: sticky` descendants
        // (e.g. each page's sticky header).
        style={
          visibleOffset > 0
            ? {
                transform: `translateY(${visibleOffset}px)`,
                transition:
                  refreshing || pull === 0 ? "transform 200ms ease" : "none",
              }
            : undefined
        }
      >
        {children}
      </div>
    </>
  );
}
