"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

/**
 * Mobile-only header search affordance. Renders an icon-only button by
 * default; tapping it drops down a username input below the header. Enter
 * navigates to `/profile/[username]` (same exact-match behavior as
 * `ProfileSearchBar` and `DesktopSearchBar`).
 *
 * Closes on Esc, on submit, or when the input loses focus while empty so
 * the bar doesn't sit open after a user taps away.
 */
export function MobileHeaderSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = q.trim().replace(/^@/, "");
    if (!trimmed) return;
    startTransition(() => {
      router.push(`/profile/${encodeURIComponent(trimmed)}`);
      setOpen(false);
      setQ("");
    });
  }

  return (
    <div className="contents">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="search users"
        aria-expanded={open}
        className={`grid size-9 place-items-center rounded-full transition-colors ${
          open
            ? "bg-hc-ink text-hc-brand dark:bg-hc-brand dark:text-hc-brand-ink"
            : "text-hc-ink hover:bg-hc-surface-alt"
        }`}
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
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </button>

      {open && (
        <form
          onSubmit={onSubmit}
          role="search"
          className="absolute inset-x-0 top-full flex items-center gap-2.5 border-b border-hc-line bg-hc-bg px-5 py-3"
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
            onBlur={() => {
              if (!q.trim()) setOpen(false);
            }}
            placeholder="search users by handle…"
            aria-label="search users by exact username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            disabled={isPending}
            className="min-w-0 flex-1 bg-transparent font-sans text-sm text-hc-ink placeholder:text-hc-muted focus:outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setQ("");
            }}
            className="font-mono text-hc-eyebrow font-semibold uppercase tracking-hc-eyebrow text-hc-muted"
          >
            cancel
          </button>
        </form>
      )}
    </div>
  );
}
