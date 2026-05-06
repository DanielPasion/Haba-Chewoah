"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Header back affordance for habit-log detail.
 *
 * Uses `router.back()` when there's in-app history (typical: arrived from
 * feed, profile, notifications, or a habit page). Falls back to `fallbackHref`
 * for cold loads — e.g. a shared link opened directly — so the button never
 * dead-ends on the browser's previous origin.
 */
export function HabitLogBackButton({
  fallbackHref,
  ariaLabel = "back",
}: {
  fallbackHref: string;
  ariaLabel?: string;
}) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => {
        if (canGoBack) router.back();
        else router.push(fallbackHref);
      }}
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
    </button>
  );
}
