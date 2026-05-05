"use client";

import { useOptimistic, useTransition } from "react";

import { toggleLikeAction } from "../_actions";

type State = { liked: boolean; count: number };

export function LikeButton({
  habitLogId,
  initialLiked,
  initialCount,
}: {
  habitLogId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [pending, startTransition] = useTransition();
  // useOptimistic: the heart needs to flip the moment the user taps it,
  // not after the round-trip. The reducer derives the next count from the
  // proposed liked-state so a double-tap before the server settles still
  // shows the right number.
  const [state, applyOptimistic] = useOptimistic<State, boolean>(
    { liked: initialLiked, count: initialCount },
    (prev, nextLiked) => ({
      liked: nextLiked,
      count: prev.count + (nextLiked ? 1 : -1),
    }),
  );

  function onClick() {
    if (pending) return;
    startTransition(async () => {
      applyOptimistic(!state.liked);
      const result = await toggleLikeAction(habitLogId);
      if (!result.ok) {
        // Server revalidation will reconcile to the truth on next render;
        // we don't roll back manually because that races with the form
        // server action's revalidatePath.
        console.warn("[like] toggle failed", result.message);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={state.liked}
      aria-label={state.liked ? "unlike" : "like"}
      className="flex items-center gap-1.5 rounded-full font-mono text-sm font-bold text-hc-ink transition-colors disabled:opacity-60"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={state.liked ? "var(--color-hc-accent)" : "none"}
        stroke={state.liked ? "var(--color-hc-accent)" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {state.count}
    </button>
  );
}
