"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { buttonClass } from "~/components/ui";

import { HabitCard, type HabitCardData } from "../../habit/_components/habit-card";
import { getMoreProfileLogsAction } from "../_actions";
import { type ProfileLogsCursor } from "../_data";
import { ProfileEmptyTab } from "./profile-empty-tab";
import { ProfileLogRow } from "./profile-log-row";

type TabId = "habits" | "logs";

/**
 * Profile tabs — habits + recent logs for the user being viewed. The page
 * loader hands us the first page; we paginate the logs list client-side
 * via `getMoreProfileLogsAction` (intersection-observer driven). The page
 * is responsible for filtering to public-only when `isOwn` is false, so
 * the loader and the action both honor the same visibility rules.
 */
export function ProfileTabs({
  isOwn,
  ownerUserId,
  habits,
  logs,
  initialLogsCursor,
}: {
  isOwn: boolean;
  ownerUserId: string;
  habits: HabitCardData[];
  logs: ProfileLogRow[];
  initialLogsCursor: ProfileLogsCursor | null;
}) {
  const [tab, setTab] = useState<TabId>("logs");

  const tabs: {
    id: TabId;
    label: string;
    count: number;
    emptyHint: string;
  }[] = [
    {
      id: "logs",
      label: "logs",
      count: logs.length,
      emptyHint: isOwn
        ? "no logs yet — every check-in you post shows up here."
        : "no public logs yet — they appear once they're shared.",
    },
    {
      id: "habits",
      label: "habits",
      count: habits.length,
      emptyHint: isOwn
        ? "no habits yet — start one and it'll live here."
        : "no public habits yet — they only appear once they go live.",
    },
  ];

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-hc-line px-1">
        {tabs.map((t) => {
          const sel = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={sel}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-1.5 px-3.5 py-3 font-sans text-sm font-bold transition-colors ${
                sel ? "text-hc-ink" : "text-hc-muted hover:text-hc-ink"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-px font-mono text-hc-eyebrow font-bold ${
                  sel
                    ? "bg-hc-brand text-hc-brand-ink"
                    : "bg-hc-line-strong text-hc-muted"
                }`}
              >
                {t.count}
              </span>
              {sel && (
                <span className="absolute inset-x-2 -bottom-px h-hc-tabline rounded-sm bg-hc-ink" />
              )}
            </button>
          );
        })}
      </div>

      {tab === "logs" ? (
        logs.length === 0 ? (
          <ProfileEmptyTab
            kind="logs"
            hint={tabs[0]!.emptyHint}
            isOwn={isOwn}
          />
        ) : (
          <PaginatedLogsList
            ownerUserId={ownerUserId}
            isOwn={isOwn}
            initialItems={logs}
            initialCursor={initialLogsCursor}
          />
        )
      ) : habits.length === 0 ? (
        <ProfileEmptyTab
          kind="habits"
          hint={tabs[1]!.emptyHint}
          isOwn={isOwn}
          cta={
            isOwn ? (
              <Link
                href="/habit/new"
                className={buttonClass({ variant: "primary", size: "md" })}
              >
                start a new habit
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 px-1 py-5 md:px-0 md:py-6 lg:grid-cols-3">
          {habits.map((h) => (
            <HabitCard key={h.id} habit={h} />
          ))}
        </div>
      )}
    </div>
  );
}

function PaginatedLogsList({
  ownerUserId,
  isOwn,
  initialItems,
  initialCursor,
}: {
  ownerUserId: string;
  isOwn: boolean;
  initialItems: ProfileLogRow[];
  initialCursor: ProfileLogsCursor | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState<ProfileLogsCursor | null>(initialCursor);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // See FeedList: once the user has paginated past page 1, parent
  // revalidates merge into local state instead of replacing it, so a
  // like / comment / log-create doesn't truncate the loaded list.
  const hasPaginatedRef = useRef(false);

  useEffect(() => {
    if (hasPaginatedRef.current) {
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
      const result = await getMoreProfileLogsAction({
        userId: ownerUserId,
        cursor,
      });
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
  }, [cursor, ownerUserId, pending]);

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
    <div className="flex flex-col gap-3 px-1 py-5 md:px-0 md:py-6">
      {items.map((l) => (
        <ProfileLogRow key={l.id} log={l} isOwn={isOwn} />
      ))}
      {cursor && (
        <div ref={sentinelRef} className="flex flex-col items-center gap-2 py-3">
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
      )}
    </div>
  );
}
