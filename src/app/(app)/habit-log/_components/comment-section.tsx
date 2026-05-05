"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
import { RelativeTime } from "~/components/relative-time";

import { createCommentAction, deleteCommentAction } from "../_actions";
import type { HabitLogDetailData, LogViewer } from "./habit-log-detail-view";

type CommentVM = HabitLogDetailData["comments"][number];

export function CommentSection({
  habitLogId,
  comments,
  viewer,
  ownerId,
}: {
  habitLogId: string;
  comments: CommentVM[];
  viewer: LogViewer;
  ownerId: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2
          className="font-display text-base font-bold text-hc-ink"
          style={{ letterSpacing: "-0.02em" }}
        >
          {comments.length === 1
            ? "1 comment"
            : `${comments.length} comments`}
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {comments.map((c) => (
          <CommentRow
            key={c.id}
            comment={c}
            isOwnerOfPost={c.author.id === ownerId}
          />
        ))}
      </div>

      <Composer habitLogId={habitLogId} viewer={viewer} />
    </div>
  );
}

function CommentRow({
  comment,
  isOwnerOfPost,
}: {
  comment: CommentVM;
  isOwnerOfPost: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm("delete this comment?")) return;
    startTransition(async () => {
      const result = await deleteCommentAction(comment.id);
      if (!result.ok) alert(result.message);
    });
  }

  return (
    <div className="flex items-start gap-2.5">
      <Link
        href={`/profile/${comment.author.username}`}
        className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-hc-line bg-hc-ink"
        aria-label={`@${comment.author.username}`}
      >
        {comment.author.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={comment.author.imageUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <TwoFaceMascot size={28} bg="#1B1726" />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <div
          className={`rounded-hc-2 border-hc px-3 py-2 ${
            comment.isMine
              ? "border-hc-ink bg-hc-brand text-hc-brand-ink dark:bg-hc-brand dark:text-hc-brand-ink"
              : "border-hc-line-strong bg-hc-surface text-hc-ink"
          }`}
        >
          <div className="mb-0.5 flex items-baseline gap-1.5">
            <Link
              href={`/profile/${comment.author.username}`}
              className="font-sans text-xs font-bold hover:underline"
            >
              @{comment.author.username}
            </Link>
            {isOwnerOfPost && (
              <span className="rounded-sm bg-hc-ink px-1.5 py-px font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow-narrow text-hc-brand">
                OP
              </span>
            )}
            <RelativeTime
              date={comment.createdAt}
              className="font-mono text-hc-tiny font-medium opacity-70"
            />
          </div>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {renderMentions(comment.content)}
          </p>
        </div>
        {comment.isMine && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="mt-1 px-1 font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted hover:text-hc-accent disabled:opacity-50"
          >
            {pending ? "deleting…" : "delete"}
          </button>
        )}
      </div>
    </div>
  );
}

function Composer({
  habitLogId,
  viewer,
}: {
  habitLogId: string;
  viewer: LogViewer;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createCommentAction(formData);
      if (result.ok) {
        setValue("");
        formRef.current?.reset();
      } else {
        setError(result.message);
      }
    });
  }

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !pending;

  return (
    <form
      ref={formRef}
      action={onSubmit}
      className="sticky bottom-0 -mx-5 flex items-center gap-2.5 border-t border-hc-line bg-hc-bg/95 px-5 py-2.5 backdrop-blur md:-mx-8 md:px-8"
    >
      <input type="hidden" name="habitLogId" value={habitLogId} />
      <div
        aria-hidden
        className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-hc-line bg-hc-ink"
      >
        {viewer.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={viewer.imageUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <TwoFaceMascot size={32} bg="#1B1726" />
        )}
      </div>
      <div className="flex flex-1 items-center gap-2 rounded-full border border-hc-line bg-hc-surface px-3.5 py-1">
        <input
          type="text"
          name="content"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="add a cheer or a roast…"
          maxLength={2000}
          disabled={pending}
          className="min-w-0 flex-1 bg-transparent py-1 text-sm text-hc-ink outline-none placeholder:text-hc-muted-soft"
        />
        <button
          type="submit"
          disabled={!canSend}
          className={`rounded-full px-3.5 py-1.5 font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow transition-colors ${
            canSend
              ? "bg-hc-accent text-hc-accent-ink"
              : "bg-hc-line-strong text-hc-muted"
          }`}
        >
          {pending ? "sending…" : "send"}
        </button>
      </div>
      {error && (
        <span className="font-mono text-hc-eyebrow text-hc-accent">{error}</span>
      )}
    </form>
  );
}


// `@username` runs in the comment text become profile links. Username
// rules per .claude/db/NOTES.md §4: 3-32 chars of [A-Za-z0-9_]. The
// `(?<=^|\s)` lookbehind + `\b` boundary keep email addresses like
// `bob@example.com` from rendering `@example` as a profile link, matching
// the same regex the server uses for mention-notification fanout.
const MENTION_RE = /(?<=^|\s)(@[A-Za-z0-9_]{3,32})\b/g;
function renderMentions(text: string) {
  return text.split(MENTION_RE).map((part, i) => {
    if (i % 2 === 1) {
      const handle = part.slice(1);
      return (
        <Link
          key={i}
          href={`/profile/${handle}`}
          className="font-bold text-hc-accent hover:underline"
        >
          {part}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
