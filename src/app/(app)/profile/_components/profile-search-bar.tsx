"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/**
 * Username search box. Submits the trimmed value to `/profile/[username]` —
 * the page itself does the (case-insensitive) exact-match lookup and renders
 * its own 404 when nothing matches, which is the desired "exact only" behavior.
 *
 * No autocomplete / suggestion list on purpose: per product, we don't want
 * fuzzy or substring hits competing with the typed handle.
 *
 * `useTransition` (instead of a manual `submitting` flag) means `isPending`
 * resets automatically when the navigation transition completes, so the input
 * doesn't stay disabled across browser back/forward or repeat searches.
 */
export function ProfileSearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = q.trim().replace(/^@/, "");
    if (!trimmed) return;
    startTransition(() => {
      router.push(`/profile/${encodeURIComponent(trimmed)}`);
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="flex items-center gap-2.5 rounded-hc-3 border-[1.5px] border-hc-line-strong bg-hc-surface px-3.5 py-2.5"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="text-hc-muted"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="search users…"
        aria-label="search users by exact username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        disabled={isPending}
        className="flex-1 bg-transparent font-sans text-sm text-hc-ink placeholder:text-hc-muted focus:outline-none disabled:opacity-60"
      />
    </form>
  );
}
