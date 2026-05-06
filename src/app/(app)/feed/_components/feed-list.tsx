"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { getMoreFeedAction } from "../_actions";
import { type FeedCursor } from "../_data";
import { FeedCard, type FeedItem } from "./feed-card";

/**
 * Client-side wrapper around the feed cards that handles cursor-based
 * pagination. The first page comes pre-rendered from the server; subsequent
 * pages stream in via `getMoreFeedAction` triggered by an intersection
 * observer near the bottom of the list.
 *
 * Why intersection observer + manual button: the observer covers the
 * common case (smooth infinite scroll), but the explicit button provides
 * a fallback when the observer fires while the action is already in
 * flight, and an affordance for users with reduced-motion preferences.
 *
 * Item de-duplication uses a Set of seen IDs because the cursor's
 * tiebreaker on `(completedAt, id)` is monotonically decreasing, but
 * a concurrent like that revalidates `/feed` could reset our local state
 * — keeping the dedup pass means we never render the same card twice.
 */
export function FeedList({
  initialItems,
  initialCursor,
}: {
  initialItems: FeedItem[];
  initialCursor: FeedCursor | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState<FeedCursor | null>(initialCursor);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Tracks whether the user has loaded at least one extra page. While
  // false, parent revalidates can safely overwrite our local state;
  // once true, we merge instead of replacing so a like-induced
  // revalidate doesn't snap a deeply-scrolled user back to page 1.
  const hasPaginatedRef = useRef(false);

  useEffect(() => {
    if (hasPaginatedRef.current) {
      // Merge the latest first page into the existing list by id —
      // newcomers prepend, existing rows pick up updated like/comment
      // counts. The cursor stays at whatever the user paginated to.
      setItems((prev) => {
        const byId = new Map(prev.map((p) => [p.id, p] as const));
        for (const item of initialItems) byId.set(item.id, item);
        return [...byId.values()].sort((a, b) =>
          a.completedAt > b.completedAt ? -1 : a.completedAt < b.completedAt ? 1 : 0,
        );
      });
      return;
    }
    setItems(initialItems);
    setCursor(initialCursor);
  }, [initialItems, initialCursor]);

  const loadMore = useCallback(() => {
    if (!cursor || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await getMoreFeedAction(cursor);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      hasPaginatedRef.current = true;
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const fresh = result.items.filter((i) => !seen.has(i.id));
        return [...prev, ...fresh];
      });
      setCursor(result.nextCursor);
    });
  }, [cursor, pending]);

  // Auto-load when sentinel scrolls into view. `rootMargin` triggers a bit
  // *before* the sentinel hits the viewport so the next page lands without
  // a visible scroll-stall.
  useEffect(() => {
    if (!cursor) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [cursor, loadMore]);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <FeedCard key={item.id} item={item} priority={index < 2} />
      ))}

      {cursor ? (
        <div
          ref={sentinelRef}
          className="flex flex-col items-center gap-2 py-6"
        >
          <button
            type="button"
            onClick={loadMore}
            disabled={pending}
            className="rounded-full border border-hc-line-strong bg-hc-surface px-4 py-2 font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-ink hover:bg-hc-surface-alt disabled:opacity-60"
          >
            {pending ? "loading…" : "load more"}
          </button>
          {error && (
            <span className="font-mono text-hc-eyebrow text-hc-accent">
              {error}
            </span>
          )}
        </div>
      ) : items.length > 0 ? (
        <p className="py-6 text-center font-mono text-hc-eyebrow font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
          you&rsquo;re all caught up · go log a habit
        </p>
      ) : null}
    </div>
  );
}
