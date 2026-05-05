import Link from "next/link";

import { Avatar } from "~/components/avatar";
import { HabitIcon } from "~/components/habit-icon";
import { RelativeTime } from "~/components/relative-time";

import type { MediaType } from "../../../../../generated/prisma";
import { LikeButton } from "../../habit-log/_components/like-button";

export type FeedItem = {
  id: string;
  completedAt: Date;
  notes: string | null;
  mediaUrl: string | null;
  mediaType: MediaType | null;
  mediaDurationMs: number | null;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  isOwn: boolean;
  habit: { id: string; name: string; icon: string | null };
  author: {
    id: string;
    username: string;
    displayName: string;
    imageUrl: string | null;
  };
  dayNumber: number;
};

export function FeedCard({ item }: { item: FeedItem }) {
  const hasMedia = item.mediaUrl !== null && item.mediaType !== null;

  return (
    <article className="overflow-hidden rounded-hc-3 border border-hc-line bg-hc-surface">
      <header className="flex items-center gap-3 px-4 pt-4">
        <Link
          href={`/profile/${item.author.username}`}
          aria-label={`@${item.author.username}`}
          className="shrink-0"
        >
          <Avatar
            imageUrl={item.author.imageUrl}
            name={item.author.displayName}
            fallbackName={item.author.username}
            size={40}
            alt={`${item.author.displayName} avatar`}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/profile/${item.author.username}`}
            className="block truncate font-sans text-sm font-bold text-hc-ink hover:underline"
          >
            {item.author.displayName}
          </Link>
          <p className="truncate font-mono text-hc-tiny font-medium text-hc-muted">
            @{item.author.username} · <RelativeTime date={item.completedAt} />
          </p>
        </div>
        <Link
          href={`/habit/${item.habit.id}`}
          className="flex shrink-0 items-center gap-2 rounded-full bg-hc-surface-alt px-2.5 py-1.5 transition-colors hover:bg-hc-line"
          title={item.habit.name}
        >
          <HabitIcon value={item.habit.icon} size={20} />
          <span className="max-w-32 truncate font-sans text-xs font-bold text-hc-ink">
            {item.habit.name}
          </span>
          <span className="font-mono text-hc-tiny font-bold text-hc-muted">
            d{item.dayNumber}
          </span>
        </Link>
      </header>

      {item.notes && (
        <Link href={`/habit-log/${item.id}`} className="block">
          <p className="px-4 pb-3 pt-2 text-[15px] leading-relaxed text-hc-ink">
            {item.notes}
          </p>
        </Link>
      )}

      {hasMedia && (
        <Link
          href={`/habit-log/${item.id}`}
          className="block"
          aria-label="open log"
        >
          <div className="relative overflow-hidden border-y border-hc-line bg-hc-ink">
            {item.mediaType === "video" ? (
              <video
                src={item.mediaUrl!}
                className="aspect-[4/5] w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.mediaUrl!}
                alt=""
                className="aspect-[4/5] w-full object-cover"
              />
            )}
            {item.mediaType === "video" && (
              <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-hc-ink/70 px-2.5 py-1 font-mono text-hc-tiny font-bold text-hc-bg backdrop-blur">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
                {formatDuration(item.mediaDurationMs ?? 0)}
              </div>
            )}
          </div>
        </Link>
      )}

      <footer className="flex items-center gap-5 px-4 py-3">
        <LikeButton
          habitLogId={item.id}
          initialLiked={item.likedByMe}
          initialCount={item.likeCount}
        />
        <Link
          href={`/habit-log/${item.id}#comments`}
          className="flex items-center gap-1.5 text-sm font-semibold text-hc-ink"
          aria-label={`${item.commentCount} comments`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {item.commentCount}
        </Link>
        <Link
          href={`/habit-log/${item.id}`}
          className="ml-auto font-sans text-xs font-semibold text-hc-muted hover:text-hc-ink"
        >
          view log
        </Link>
      </footer>
    </article>
  );
}

function formatDuration(ms: number) {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
