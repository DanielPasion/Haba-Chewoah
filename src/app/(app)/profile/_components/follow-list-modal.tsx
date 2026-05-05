"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";

import { type FollowListUser, getFollowListAction } from "../_actions";

type Kind = "followers" | "following";

/**
 * Followers/Following modal. Opens lazily — the list is only fetched once
 * `open` flips true, so the page-load cost stays free for users who never
 * tap the stat. Re-fetches if the target user changes (e.g., user navigates
 * to a different profile while a stale modal sticks around).
 *
 * Click on a row → closes modal and navigates to that user's profile (Link
 * handles the navigation; we just clean up here).
 */
export function FollowListModal({
  open,
  onClose,
  userId,
  username,
  kind,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  kind: Kind;
}) {
  const [users, setUsers] = useState<FollowListUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setUsers(null);
    setError(null);
    getFollowListAction({ userId, kind }).then((result) => {
      if (cancelled) return;
      if (result.ok) setUsers(result.users);
      else setError(result.message);
    });
    return () => {
      cancelled = true;
    };
  }, [open, userId, kind]);

  if (!open) return null;

  const heading = kind === "followers" ? "followers" : "following";
  const eyebrow =
    kind === "followers"
      ? `who follows @${username}`
      : `who @${username} follows`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={heading}
    >
      <button
        type="button"
        aria-label="close"
        onClick={onClose}
        className="absolute inset-0 bg-hc-ink/40 backdrop-blur-sm"
      />
      <div className="relative m-3 flex max-h-[85vh] w-full max-w-115 flex-col overflow-hidden rounded-hc-4 border-hc border-hc-ink bg-hc-surface shadow-hc-stamp">
        <div className="flex items-start justify-between gap-3 border-b border-hc-line p-5">
          <div>
            <div className="font-mono text-hc-eyebrow font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
              {eyebrow}
            </div>
            <h2
              className="mt-1 font-display text-hc-display-md font-extrabold leading-tight text-hc-ink"
              style={{ letterSpacing: "-0.03em" }}
            >
              {heading}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-hc border-hc-ink bg-hc-bg text-hc-ink transition-transform hover:-translate-y-[1px]"
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
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {error ? (
            <div className="px-4 py-10 text-center font-mono text-hc-meta text-hc-accent">
              {error}
            </div>
          ) : users === null ? (
            <div className="flex flex-col gap-2 px-2 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-hc-2 px-3 py-2.5"
                >
                  <div className="size-10 shrink-0 animate-pulse rounded-full bg-hc-line-strong" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 animate-pulse rounded bg-hc-line-strong" />
                    <div className="h-2.5 w-20 animate-pulse rounded bg-hc-line" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <TwoFaceMascot size={64} mood="default" bg="#1B1726" />
              <p className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-muted">
                {kind === "followers" ? "no followers yet" : "not following anyone yet"}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {users.map((u) => (
                <li key={u.id}>
                  <Link
                    href={`/profile/${u.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-hc-2 px-3 py-2.5 transition-colors hover:bg-hc-surface-alt"
                  >
                    <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-hc-line bg-hc-ink">
                      {u.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.imageUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <TwoFaceMascot size={36} bg="#1B1726" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-sans text-sm font-bold text-hc-ink">
                        {u.displayName}
                      </div>
                      <div className="truncate font-mono text-hc-eyebrow font-medium text-hc-muted">
                        @{u.username}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
