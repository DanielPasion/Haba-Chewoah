"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toggleFollowAction } from "../_actions";

type Size = "sm" | "md";

/**
 * Small inline follow/unfollow control used in list rows (explore cards,
 * follow-list modal). Optimistic toggle with rollback on failure.
 *
 * Important: when this lives inside a parent `<Link>` (explore card), the
 * click MUST `preventDefault` + `stopPropagation` so tapping the button
 * doesn't navigate away from the page.
 */
export function FollowToggleButton({
  targetUserId,
  initialIsFollowing,
  size = "sm",
  refreshOnChange = false,
}: {
  targetUserId: string;
  initialIsFollowing: boolean;
  size?: Size;
  /** When true, calls router.refresh() after a successful toggle so server
   *  components (follower counts, etc.) re-render. Used by the modal where
   *  the viewer's stats might be visible behind it. */
  refreshOnChange?: boolean;
}) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(initialIsFollowing);
  const [pending, startTransition] = useTransition();

  function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    // List rows are wrapped in <Link>s — without this the tap navigates.
    e.preventDefault();
    e.stopPropagation();

    const previous = optimistic;
    const next = !previous;
    setOptimistic(next);
    startTransition(async () => {
      const result = await toggleFollowAction({ targetUserId });
      if (!result.ok) {
        setOptimistic(previous);
        return;
      }
      setOptimistic(result.isFollowing);
      if (refreshOnChange) router.refresh();
    });
  }

  const padding = size === "sm" ? "px-3 py-1.5" : "px-4 py-2";
  const text = size === "sm" ? "text-xs" : "text-sm";

  const className = optimistic
    ? `${padding} ${text} rounded-full border border-hc-line bg-transparent font-sans font-bold text-hc-ink hover:bg-hc-surface-alt`
    : `${padding} ${text} rounded-full bg-hc-ink font-sans font-bold text-hc-bg hover:bg-hc-ink-soft dark:bg-hc-brand dark:text-hc-brand-ink`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={optimistic}
      className={`${className} shrink-0 transition-colors disabled:opacity-60`}
    >
      {optimistic ? "following" : "follow"}
    </button>
  );
}
