"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";

/**
 * Header back affordance for habit-log detail.
 *
 * Renders as a real `<Link>` (preserves middle-click "open in new tab",
 * right-click menu, and link semantics for assistive tech), but on a plain
 * left-click it short-circuits to `router.back()` when the user reached this
 * page from somewhere on our origin. Cold loads — e.g. a permalink opened
 * from Slack/Twitter — fall through to standard navigation toward
 * `fallbackHref`, never to the previous off-origin page.
 *
 * Why `document.referrer` instead of `window.history.length`: history.length
 * is ≥1 for any tab that has ever navigated, including the very first
 * pageview in iOS Safari opened from a push notification. Using it as a
 * "in-app history exists" signal sends the user back to the *external*
 * referrer (Slack, Twitter, the share source). The same-origin referrer
 * check is the reliable signal that `router.back()` will land in-app.
 */
export function HabitLogBackButton({
  fallbackHref,
  ariaLabel = "back",
}: {
  fallbackHref: string;
  ariaLabel?: string;
}) {
  const router = useRouter();
  const [hasInAppHistory, setHasInAppHistory] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ref = document.referrer;
    setHasInAppHistory(!!ref && ref.startsWith(window.location.origin));
  }, []);

  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    // Let modifier-clicks (cmd/ctrl/shift/middle-click) follow the href so
    // "open in new tab" still works.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    if (!hasInAppHistory) return;
    e.preventDefault();
    router.back();
  }

  return (
    <Link
      href={fallbackHref}
      aria-label={ariaLabel}
      onClick={onClick}
      className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-hc-ink hover:bg-hc-surface"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </Link>
  );
}
