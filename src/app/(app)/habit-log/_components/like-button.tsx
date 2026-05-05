"use client";

import { useEffect, useRef, useState } from "react";

import { toggleLikeAction } from "../_actions";

/**
 * Like button with snappy optimistic toggling and tap-coalescing.
 *
 * - Tapping flips state instantly (no round-trip wait).
 * - Rapid double/triple-taps don't get dropped: the latest desired state
 *   wins. We track `desired` in a ref and, after each in-flight call
 *   settles, fire another call if the user has since changed their mind.
 * - We don't `useOptimistic` because that hook resets on every parent
 *   re-render — and the parent re-renders when other server actions on
 *   the page revalidate, causing the heart to "flicker" back to the
 *   server's stale snapshot mid-tap. Local `useState` keeps the UI stable
 *   until the action's own response lands.
 */
export function LikeButton({
  habitLogId,
  initialLiked,
  initialCount,
}: {
  habitLogId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const inFlight = useRef(false);
  const desired = useRef(initialLiked);

  // If the parent re-renders with a different baseline (e.g. another
  // viewer's like came in via revalidate), accept it — but only when no
  // tap is mid-flight, so we don't clobber the user's own intent.
  useEffect(() => {
    if (inFlight.current) return;
    desired.current = initialLiked;
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  async function syncToServer() {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      // Loop until the server's `liked` matches what the user wants. One
      // call usually suffices; the loop handles "tapped twice while the
      // first was in flight" cases by sending a follow-up toggle.
      while (true) {
        let result;
        try {
          result = await toggleLikeAction(habitLogId);
        } catch (err) {
          // Network failure (offline, 500, timeout). Without this catch
          // the optimistic UI sticks at "liked" forever — the user thinks
          // the tap registered, the server has no record. Revert to the
          // last-known-good state (initial props) and stop the loop.
          console.warn("[like] toggle threw", err);
          desired.current = initialLiked;
          setLiked(initialLiked);
          setCount(initialCount);
          break;
        }
        if (!result.ok) {
          // Server replied but rejected (e.g. log was deleted). Same
          // revert + bail as the network case so the UI stops lying.
          console.warn("[like] toggle failed", result.message);
          desired.current = initialLiked;
          setLiked(initialLiked);
          setCount(initialCount);
          break;
        }
        // Trust the server's reported state for the count — it's the only
        // way to stay accurate when other viewers are liking concurrently.
        setCount(result.likeCount);
        if (result.liked === desired.current) {
          setLiked(result.liked);
          break;
        }
        // User flipped intent while this call was in flight; loop again
        // to send the follow-up toggle.
      }
    } finally {
      inFlight.current = false;
    }
  }

  function onClick() {
    desired.current = !desired.current;
    // Optimistic: flip the heart + count immediately so the user sees the
    // result of their tap regardless of network latency.
    setLiked(desired.current);
    setCount((c) => c + (desired.current ? 1 : -1));
    void syncToServer();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={liked}
      aria-label={liked ? "unlike" : "like"}
      className="flex items-center gap-1.5 rounded-full font-mono text-sm font-bold text-hc-ink transition-colors"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={liked ? "var(--color-hc-accent)" : "none"}
        stroke={liked ? "var(--color-hc-accent)" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={liked ? "scale-110 transition-transform" : "transition-transform"}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {count}
    </button>
  );
}
