import Link from "next/link";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";

import type { MediaType } from "../../../../../generated/prisma";

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
    <div className="-mx-5 -my-6 flex flex-col gap-4 pb-2 md:-mx-8 md:-my-8 md:gap-6">
      <Header
        logId={log.id}
        isOwn={isOwn}
        habitId={log.habit.id}
        ownerUsername={log.owner.username}
        habitName={log.habit.name}
      />

      <div className="mx-auto flex w-full max-w-180 flex-col gap-4 px-5 md:px-8 md:gap-5">
        <AuthorStrip log={log} dayNumber={dayNumber} isOwn={isOwn} />
        {log.media && <MediaHero log={log} dayNumber={dayNumber} />}
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
}: {
  logId: string;
  isOwn: boolean;
  habitId: string;
  ownerUsername: string;
  habitName: string;
}) {
  return (
    <header className="sticky top-14 z-10 flex items-center gap-3 border-b border-hc-line bg-hc-bg/90 px-5 py-3 backdrop-blur md:top-0 md:px-8 md:py-4">
      <Link
        href={isOwn ? `/habit/${habitId}` : `/profile/${ownerUsername}`}
        aria-label="back"
        className="grid size-9 shrink-0 place-items-center rounded-full border border-hc-line bg-hc-surface text-hc-ink shadow-hc-soft hover:bg-hc-surface-alt"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </Link>
      <h1
        className="min-w-0 flex-1 truncate font-display text-base font-extrabold leading-none text-hc-ink"
        style={{ letterSpacing: "-0.02em" }}
      >
        {habitName} · log
      </h1>
      <LogActions logId={logId} habitId={habitId} isOwn={isOwn} />
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
        className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-hc-line bg-hc-ink"
      >
        {log.owner.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={log.owner.imageUrl}
            alt={`@${log.owner.username}`}
            className="size-full object-cover"
          />
        ) : (
          <TwoFaceMascot size={36} bg="#1B1726" />
        )}
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
            <span className="font-mono text-hc-tiny font-semibold text-hc-muted">
              (you)
            </span>
          )}
        </div>
        <p className="truncate font-mono text-hc-meta font-semibold text-hc-muted">
          @{log.owner.username} · {formatRelative(log.completedAt)}
        </p>
      </div>
      <Link
        href={`/habit/${log.habit.id}`}
        className="shrink-0 rounded-full border border-hc-line bg-hc-brand px-3 py-1.5 font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-brand-ink"
      >
        {log.habit.icon ?? "✨"} {log.habit.name} · day {dayNumber}
      </Link>
    </div>
  );
}

function MediaHero({
  log,
  dayNumber,
}: {
  log: HabitLogDetailData;
  dayNumber: number;
}) {
  if (!log.media) return null;
  return (
    <div className="relative overflow-hidden rounded-hc-4 border-hc border-hc-line bg-hc-ink shadow-hc">
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
      <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-hc-line bg-hc-brand px-3 py-1 font-display text-sm font-extrabold text-hc-brand-ink">
        day {dayNumber}
      </div>
      <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-hc-ink/70 px-2.5 py-1 font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow text-hc-bg backdrop-blur">
        {log.media.type === "video"
          ? `▶ video${log.media.durationMs ? ` · ${formatDuration(log.media.durationMs)}` : ""}`
          : "📷 photo"}
      </div>
    </div>
  );
}

function Caption({ notes }: { notes: string }) {
  return (
    <p className="whitespace-pre-wrap text-base leading-relaxed text-hc-ink">
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
    <div className="flex items-center gap-4">
      <LikeButton
        habitLogId={logId}
        initialLiked={likedByMe}
        initialCount={likeCount}
      />
      <span className="flex items-center gap-1.5 font-mono text-sm font-bold text-hc-ink">
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
        {commentCount}
      </span>
      {likers.length > 0 && (
        <div className="ml-auto flex items-center gap-1">
          <div className="flex">
            {likers.map((u, i) => (
              <Link
                key={u.id}
                href={`/profile/${u.username}`}
                aria-label={`@${u.username}`}
                title={`@${u.username}`}
                className="grid size-6 place-items-center overflow-hidden rounded-full border border-hc-bg bg-hc-ink"
                style={{ marginLeft: i === 0 ? 0 : -8 }}
              >
                {u.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.imageUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <TwoFaceMascot size={20} bg="#1B1726" />
                )}
              </Link>
            ))}
          </div>
          {likeCount > likers.length && (
            <span className="font-mono text-hc-tiny font-semibold text-hc-muted">
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

const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function formatRelative(date: Date) {
  const now = Date.now();
  const diffSec = Math.round((date.getTime() - now) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return RTF.format(diffSec, "second");
  if (abs < 3600) return RTF.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return RTF.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 7) return RTF.format(Math.round(diffSec / 86400), "day");
  if (abs < 86400 * 30) return RTF.format(Math.round(diffSec / (86400 * 7)), "week");
  return date.toLocaleDateString();
}
