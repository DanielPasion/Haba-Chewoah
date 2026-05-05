"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

/**
 * Desktop top-bar search box, replicating `.claude/ui/project/desktop.jsx`
 * `DTopbar`'s search affordance (icon · input · ⌘K chip).
 *
 * Behavior matches the mobile `ProfileSearchBar`: exact-match navigation to
 * `/profile/[username]`. The destination page handles the case-insensitive
 * lookup and renders 404 when there's no match.
 *
 * `⌘K` / `Ctrl+K` focuses the input. Listener is bound to `keydown` on window
 * and respects `metaKey`/`ctrlKey` so both macOS and other platforms work.
 */
export function DesktopSearchBar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [q, setQ] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isK = e.key === "k" || e.key === "K";
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
      className="flex w-full max-w-115 items-center gap-2.5 rounded-full border border-hc-line-strong bg-hc-surface px-3.5 py-2"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="shrink-0 text-hc-muted"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="search users by handle…"
        aria-label="search users by exact username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        disabled={isPending}
        className="min-w-0 flex-1 bg-transparent font-sans text-sm text-hc-ink placeholder:text-hc-muted focus:outline-none disabled:opacity-60"
      />
      <span className="hidden shrink-0 rounded bg-hc-bg px-1.5 py-0.5 font-mono text-hc-tiny font-semibold text-hc-muted lg:inline">
        ⌘K
      </span>
    </form>
  );
}
