"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";

import { Avatar } from "~/components/avatar";
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
          className="font-display text-base font-extrabold text-hc-ink"
          style={{ letterSpacing: "-0.03em" }}
        >
          {comments.length === 1 ? "1 comment" : `${comments.length} comments`}
        </h2>
      </div>

      {comments.length === 0 ? (
        <p className="rounded-hc-2 border border-dashed border-hc-line-strong bg-hc-surface-alt px-4 py-5 text-center text-sm text-hc-muted">
          be the first to say something nice.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {comments.map((c) => (
            <li key={c.id}>
              <CommentRow
                comment={c}
                isOwnerOfPost={c.author.id === ownerId}
              />
            </li>
          ))}
        </ul>
      )}

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
    <div className="flex items-start gap-3">
      <Link
        href={`/profile/${comment.author.username}`}
        className="shrink-0"
        aria-label={`@${comment.author.username}`}
      >
        <Avatar
          imageUrl={comment.author.imageUrl}
          name={comment.author.displayName}
          fallbackName={comment.author.username}
          size={36}
          alt={`${comment.author.displayName} avatar`}
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline gap-1.5">
          <Link
            href={`/profile/${comment.author.username}`}
            className="font-sans text-sm font-bold text-hc-ink hover:underline"
          >
            {comment.author.displayName}
          </Link>
          {isOwnerOfPost && (
            <span className="rounded-full bg-hc-surface-alt px-1.5 py-px font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow-narrow text-hc-muted">
              author
            </span>
          )}
          <RelativeTime
            date={comment.createdAt}
            className="font-mono text-hc-tiny font-medium text-hc-muted"
          />
        </div>
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-hc-ink">
          {renderMentions(comment.content)}
        </p>
        {comment.isMine && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="mt-1 font-sans text-xs font-semibold text-hc-muted hover:text-hc-accent disabled:opacity-50"
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
      className="sticky bottom-0 -mx-5 flex items-center gap-2.5 border-t border-hc-line bg-hc-bg/95 px-5 py-3 backdrop-blur md:-mx-8 md:px-8"
    >
      <input type="hidden" name="habitLogId" value={habitLogId} />
      <Avatar
        imageUrl={viewer.imageUrl}
        name={viewer.displayName}
        fallbackName={viewer.username}
        size={36}
        alt=""
      />
      <div className="flex flex-1 items-center gap-2 rounded-full border border-hc-line bg-hc-surface px-4 py-1">
        <input
          type="text"
          name="content"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="add a comment…"
          maxLength={2000}
          disabled={pending}
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-hc-ink outline-none placeholder:text-hc-muted-soft"
        />
        <button
          type="submit"
          disabled={!canSend}
          className={`rounded-full px-4 py-1.5 font-sans text-xs font-bold transition-colors ${
            canSend
              ? "bg-hc-ink text-hc-bg hover:bg-hc-ink-soft dark:bg-hc-brand dark:text-hc-brand-ink"
              : "text-hc-muted"
          }`}
        >
          {pending ? "sending…" : "post"}
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
