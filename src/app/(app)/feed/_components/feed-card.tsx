import Link from "next/link";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
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
  return (
    <article className="overflow-hidden rounded-hc-3 border-hc border-hc-line bg-hc-surface shadow-hc-soft">
      <div className="flex items-start gap-3 p-3.5">
        <Link
          href={`/profile/${item.author.username}`}
          aria-label={`@${item.author.username}`}
          className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-hc-line bg-hc-ink"
        >
          {item.author.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.author.imageUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <TwoFaceMascot size={36} bg="#1B1726" />
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <Link
              href={`/profile/${item.author.username}`}
              className="truncate font-sans text-sm font-bold text-hc-ink hover:underline"
            >
              {item.author.displayName}
            </Link>
            <span className="font-mono text-hc-tiny font-medium text-hc-muted">
              · <RelativeTime date={item.completedAt} />
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Link
              href={`/habit/${item.habit.id}`}
              className="max-w-full truncate rounded-full bg-hc-brand px-2 py-0.5 font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow text-hc-brand-ink"
              title={item.habit.name}
            >
              {item.habit.icon ?? "✨"} {item.habit.name}
            </Link>
            <span className="font-mono text-hc-tiny font-bold text-hc-accent">
              day {item.dayNumber}
            </span>
          </div>
        </div>
      </div>

      {item.mediaUrl && item.mediaType && (
        <Link
          href={`/habit-log/${item.id}`}
          className="block"
          aria-label="open log"
        >
          <div className="relative mx-3.5 overflow-hidden rounded-hc-2 border border-hc-line bg-hc-ink">
            {item.mediaType === "video" ? (
              <video
                src={item.mediaUrl}
                className="aspect-[4/3] w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.mediaUrl}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
            )}
            <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-hc-ink/75 px-2 py-0.5 font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow text-hc-bg backdrop-blur">
              {item.mediaType === "video"
                ? `▶ ${formatDuration(item.mediaDurationMs ?? 0)}`
                : "📷 photo"}
            </div>
          </div>
        </Link>
      )}

      {item.notes && (
        <Link href={`/habit-log/${item.id}`} className="block">
          <p className="px-4 pb-1 pt-3 text-sm leading-relaxed text-hc-ink">
            {item.notes}
          </p>
        </Link>
      )}

      <div className="flex items-center gap-4 px-4 pb-3 pt-2">
        <LikeButton
          habitLogId={item.id}
          initialLiked={item.likedByMe}
          initialCount={item.likeCount}
        />
        <Link
          href={`/habit-log/${item.id}#comments`}
          className="flex items-center gap-1.5 font-mono text-sm font-bold text-hc-ink"
        >
          <svg
            width="20"
            height="20"
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
          {item.commentCount}
        </Link>
        <Link
          href={`/habit-log/${item.id}`}
          className="ml-auto font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow text-hc-ink"
        >
          open →
        </Link>
      </div>
    </article>
  );
}

function formatDuration(ms: number) {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

