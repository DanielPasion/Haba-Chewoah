"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { HabitIcon } from "~/components/habit-icon";
import { RelativeTime } from "~/components/relative-time";

import { deleteHabitLogAction } from "../../habit-log/_actions";

import type { MediaType } from "../../../../../generated/prisma";

export type ProfileLogRow = {
  id: string;
  completedAt: Date;
  notes: string | null;
  mediaUrl: string | null;
  mediaType: MediaType | null;
  habit: { id: string; name: string; icon: string | null };
  isLocked: boolean;
  likeCount: number;
  commentCount: number;
  dayNumber: number;
};

/**
 * Profile "logs" tab row. Editorial layout: media-as-thumbnail when present,
 * inline icon when not. The header reads habit · day · time as text, no
 * coloured chips. Action footer (likes/comments/delete) sits on a quiet
 * divider line.
 */
export function ProfileLogRow({
  log,
  isOwn,
}: {
  log: ProfileLogRow;
  isOwn: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [hidden, setHidden] = useState(false);

  function onDelete() {
    if (!confirm("delete this log? this cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteHabitLogAction(log.id);
      if (result.ok) {
        setHidden(true);
        router.refresh();
      } else {
        alert(result.message);
      }
    });
  }

  if (hidden) return null;

  const hasMedia = log.mediaUrl !== null && log.mediaType !== null;

  return (
    <article className="overflow-hidden rounded-hc-3 border border-hc-line bg-hc-surface">
      <Link
        href={`/habit-log/${log.id}`}
        className="flex flex-col transition-colors hover:bg-hc-surface-alt md:flex-row md:items-stretch"
      >
        {hasMedia && (
          <div className="overflow-hidden border-b border-hc-line bg-hc-ink md:order-1 md:w-32 md:shrink-0 md:border-b-0 md:border-l md:border-hc-line">
            {log.mediaType === "video" ? (
              <video
                src={log.mediaUrl!}
                className="aspect-[4/3] w-full object-cover md:aspect-square md:h-full"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={log.mediaUrl!}
                alt=""
                className="aspect-[4/3] w-full object-cover md:aspect-square md:h-full"
              />
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between gap-3 px-4 pb-1.5 pt-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <HabitIcon value={log.habit.icon} size={32} />
              <div className="min-w-0">
                <div className="truncate font-sans text-sm font-bold text-hc-ink">
                  {log.habit.name}
                </div>
                <div className="font-mono text-hc-tiny font-medium text-hc-muted">
                  day {log.dayNumber} ·{" "}
                  <RelativeTime
                    date={log.completedAt}
                    className="font-mono text-hc-tiny font-medium text-hc-muted"
                  />
                </div>
              </div>
            </div>
            {log.isLocked && (
              <span className="shrink-0 font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
                private
              </span>
            )}
          </header>

          {log.notes && (
            <p className="line-clamp-3 px-4 pb-3 pt-1 text-sm leading-relaxed text-hc-ink">
              {log.notes}
            </p>
          )}
          {!log.notes && !hasMedia && (
            <p className="px-4 pb-3 pt-1 font-sans text-sm italic text-hc-muted">
              checked in.
            </p>
          )}
        </div>
      </Link>

      <div className="flex items-center gap-4 border-t border-hc-line px-4 py-2.5 text-sm font-medium text-hc-muted">
        <span className="flex items-center gap-1.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {log.likeCount}
        </span>
        <span className="flex items-center gap-1.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {log.commentCount}
        </span>
        {isOwn && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="ml-auto font-sans text-xs font-semibold text-hc-muted hover:text-hc-accent disabled:opacity-60"
          >
            {pending ? "deleting…" : "delete"}
          </button>
        )}
      </div>
    </article>
  );
}
