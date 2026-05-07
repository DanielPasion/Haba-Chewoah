import Link from "next/link";

import { Avatar } from "~/components/avatar";
import { HabitIcon } from "~/components/habit-icon";
import { RelativeTime } from "~/components/relative-time";

import type { MediaType } from "../../../../../generated/prisma";

import { HabitLogBackButton } from "./back-button";
import { CommentSection } from "./comment-section";
import { LikeButton } from "./like-button";
import { LogActions } from "./log-actions";

export type HabitLogDetailData = {
  id: string;
  completedAt: Date;
  notes: string | null;
  media: {
    url: string;
    type: MediaType;
    durationMs: number | null;
  } | null;
  habit: { id: string; name: string; icon: string | null };
  owner: {
    id: string;
    username: string;
    displayName: string;
    imageUrl: string | null;
    timezone: string;
  };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  likers: Array<{
    id: string;
    username: string;
    displayName: string;
    imageUrl: string | null;
  }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      username: string;
      displayName: string;
      imageUrl: string | null;
    };
    isMine: boolean;
  }>;
};

export type LogViewer = {
  id: string;
  username: string;
  displayName: string;
  imageUrl: string | null;
};

export function HabitLogDetailView({
  log,
  isOwn,
  dayNumber,
  viewer,
}: {
  log: HabitLogDetailData;
  isOwn: boolean;
  dayNumber: number;
  viewer: LogViewer;
}) {
  return (
    <div className="-mx-5 -my-6 flex flex-col gap-5 pb-2 md:-mx-8 md:-my-8 md:gap-6">
      <Header
        logId={log.id}
        isOwn={isOwn}
        habitId={log.habit.id}
        ownerUsername={log.owner.username}
        habitName={log.habit.name}
        completedAt={log.completedAt}
        notes={log.notes}
      />

      <div className="mx-auto flex w-full max-w-130 flex-col gap-4 px-5 md:px-8 md:gap-5">
        <AuthorStrip log={log} dayNumber={dayNumber} isOwn={isOwn} />
        {log.media && <MediaHero log={log} />}
        {log.notes && <Caption notes={log.notes} />}

        <Reactions
          logId={log.id}
          likeCount={log.likeCount}
          likedByMe={log.likedByMe}
          commentCount={log.commentCount}
          likers={log.likers}
        />

        <CommentSection
          habitLogId={log.id}
          comments={log.comments}
          viewer={viewer}
          ownerId={log.owner.id}
        />
      </div>
    </div>
  );
}

function Header({
  logId,
  isOwn,
  habitId,
  ownerUsername,
  habitName,
  completedAt,
  notes,
}: {
  logId: string;
  isOwn: boolean;
  habitId: string;
  ownerUsername: string;
  habitName: string;
  completedAt: Date;
  notes: string | null;
}) {
  return (
    <header className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 flex items-center gap-3 border-b border-hc-line bg-hc-bg/85 px-5 py-3 backdrop-blur md:top-0 md:px-8 md:py-4">
      <HabitLogBackButton
        fallbackHref={isOwn ? `/habit/${habitId}` : `/profile/${ownerUsername}`}
      />
      <h1
        className="min-w-0 flex-1 truncate font-display text-base font-extrabold text-hc-ink"
        style={{ letterSpacing: "-0.03em" }}
      >
        {habitName}
      </h1>
      <LogActions
        logId={logId}
        habitId={habitId}
        isOwn={isOwn}
        completedAt={completedAt}
        notes={notes}
      />
    </header>
  );
}

function AuthorStrip({
  log,
  dayNumber,
  isOwn,
}: {
  log: HabitLogDetailData;
  dayNumber: number;
  isOwn: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/profile/${log.owner.username}`}
        className="shrink-0"
        aria-label={`@${log.owner.username}`}
      >
        <Avatar
          imageUrl={log.owner.imageUrl}
          name={log.owner.displayName}
          fallbackName={log.owner.username}
          size={44}
          alt={`${log.owner.displayName} avatar`}
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <Link
            href={`/profile/${log.owner.username}`}
            className="truncate font-sans text-sm font-bold text-hc-ink hover:underline"
          >
            {log.owner.displayName}
          </Link>
          {isOwn && (
            <span className="font-mono text-hc-tiny font-medium text-hc-muted">
              (you)
            </span>
          )}
        </div>
        <p className="truncate font-mono text-hc-meta font-medium text-hc-muted">
          @{log.owner.username} · <RelativeTime date={log.completedAt} />
        </p>
      </div>
      <Link
        href={`/habit/${log.habit.id}`}
        className="flex shrink-0 items-center gap-2 rounded-full bg-hc-surface-alt px-2.5 py-1.5 transition-colors hover:bg-hc-line"
        title={`${log.habit.name} · day ${dayNumber}`}
      >
        <HabitIcon value={log.habit.icon} size={20} />
        <span className="max-w-32 truncate font-sans text-xs font-bold text-hc-ink">
          {log.habit.name}
        </span>
        <span className="font-mono text-hc-tiny font-bold text-hc-muted">
          d{dayNumber}
        </span>
      </Link>
    </div>
  );
}

function MediaHero({ log }: { log: HabitLogDetailData }) {
  if (!log.media) return null;
  return (
    <div className="relative mx-auto w-full overflow-hidden rounded-hc-4 border border-hc-line bg-hc-ink">
      {log.media.type === "video" ? (
        <video
          src={log.media.url}
          controls
          playsInline
          className="aspect-[4/5] w-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={log.media.url}
          alt="habit log photo"
          className="aspect-[4/5] w-full object-cover"
        />
      )}
      {log.media.type === "video" && (
        <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-hc-ink/70 px-2.5 py-1 font-mono text-hc-tiny font-bold text-hc-bg backdrop-blur">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
          {log.media.durationMs ? formatDuration(log.media.durationMs) : "video"}
        </div>
      )}
    </div>
  );
}

function Caption({ notes }: { notes: string }) {
  return (
    <p className="whitespace-pre-wrap break-words text-[16px] leading-relaxed text-hc-ink">
      {notes}
    </p>
  );
}

function Reactions({
  logId,
  likeCount,
  likedByMe,
  commentCount,
  likers,
}: {
  logId: string;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  likers: HabitLogDetailData["likers"];
}) {
  return (
    <div className="flex items-center gap-5 border-y border-hc-line py-3">
      <LikeButton
        habitLogId={logId}
        initialLiked={likedByMe}
        initialCount={likeCount}
      />
      <span className="flex items-center gap-1.5 text-sm font-semibold text-hc-ink">
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
        {commentCount}
      </span>
      {likers.length > 0 && (
        <div className="ml-auto flex items-center gap-2">
          <div className="flex">
            {likers.map((u, i) => (
              <Link
                key={u.id}
                href={`/profile/${u.username}`}
                aria-label={`@${u.username}`}
                title={`@${u.username}`}
                style={{ marginLeft: i === 0 ? 0 : -8 }}
                className="block"
              >
                <Avatar
                  imageUrl={u.imageUrl}
                  name={u.displayName}
                  fallbackName={u.username}
                  size={24}
                  ringWidth={2}
                  ringClassName="text-hc-bg"
                  alt={`${u.displayName} avatar`}
                />
              </Link>
            ))}
          </div>
          {likeCount > likers.length && (
            <span className="font-mono text-hc-tiny font-medium text-hc-muted">
              +{likeCount - likers.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function formatDuration(ms: number) {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
