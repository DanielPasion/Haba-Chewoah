"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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
 * Profile "logs" tab card. Mirrors `.claude/ui/project/profile-page.jsx`
 * `LogCard` — header with habit + day-N + relative time, optional media
 * preview, the note body, and a footer of like/comment counts plus a
 * delete affordance for own logs.
 *
 * Tapping the header / media / note opens the full log detail. Delete is
 * its own button outside the link so we don't nest interactive elements.
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
    <article className="overflow-hidden rounded-hc-3 border border-hc-line bg-hc-surface shadow-hc-soft">
      <Link
        href={`/habit-log/${log.id}`}
        className="block transition-colors hover:bg-hc-surface-alt"
      >
        <header className="flex items-center justify-between gap-3 px-3.5 pt-3 pb-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-hc-2 border border-hc-line-strong bg-hc-bg text-base">
              {log.habit.icon ?? "✨"}
            </span>
            <div className="min-w-0">
              <div className="truncate font-sans text-sm font-bold text-hc-ink">
                {log.habit.name}{" "}
                <span className="font-medium text-hc-muted">
                  · day {log.dayNumber}
                </span>
              </div>
              <div className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
                {formatRelative(log.completedAt)}
              </div>
            </div>
          </div>
          {log.isLocked && (
            <span className="shrink-0 font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow text-hc-muted">
              🔒 folder
            </span>
          )}
        </header>

        {hasMedia && (
          <div className="mx-3.5 overflow-hidden rounded-hc-2 border border-hc-line bg-hc-ink">
            {log.mediaType === "video" ? (
              <video
                src={log.mediaUrl!}
                className="aspect-[4/3] w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={log.mediaUrl!}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
            )}
          </div>
        )}

        {log.notes && (
          <p className="px-4 pb-2 pt-2.5 text-sm leading-relaxed text-hc-ink">
            {log.notes}
          </p>
        )}
        {!log.notes && !hasMedia && (
          <p className="px-4 pb-2 pt-2.5 font-mono text-hc-meta text-hc-muted">
            checked in.
          </p>
        )}
      </Link>

      <div className="flex items-center gap-4 px-4 pt-1 pb-3 font-mono text-hc-meta font-semibold text-hc-muted">
        <span className="flex items-center gap-1.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden
            className="text-hc-accent"
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
            strokeWidth="2"
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
            className="ml-auto font-mono text-hc-meta font-semibold uppercase tracking-hc-eyebrow text-hc-muted hover:text-hc-accent disabled:opacity-60"
          >
            {pending ? "deleting…" : "delete"}
          </button>
        )}
      </div>
    </article>
  );
}

const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function formatRelative(date: Date) {
  const now = Date.now();
  const diffSec = Math.round((date.getTime() - now) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return RTF.format(diffSec, "second");
  if (abs < 3600) return RTF.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return RTF.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 7) return RTF.format(Math.round(diffSec / 86400), "day");
  return date.toLocaleDateString();
}
