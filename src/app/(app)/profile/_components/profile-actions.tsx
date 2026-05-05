"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { SettingsButton } from "~/components/settings-button";
import { buttonClass } from "~/components/ui";

import { signOutAction } from "../../_actions";
import { chewOutOnProfileAction } from "../../habit/_actions";
import {
  blockUserAction,
  toggleFollowAction,
  unblockUserAction,
} from "../_actions";

const ICON_BASE_CLASS =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-hc-2 border-hc border-hc-ink bg-transparent px-3 py-2 font-sans text-hc-button font-bold leading-none text-hc-ink transition-transform hover:bg-hc-ink hover:text-hc-brand dark:hover:bg-hc-brand dark:hover:text-hc-brand-ink";

/**
 * Action row under the identity block. Renders edit/share for own profile,
 * follow/share for others.
 */
export function ProfileActions({
  isOwn,
  isFollowing,
  isBlockingThem = false,
  targetUserId,
  username,
}: {
  isOwn: boolean;
  isFollowing: boolean;
  isBlockingThem?: boolean;
  targetUserId: string;
  username: string;
}) {
  if (isOwn) {
    return (
      <div className="flex flex-wrap items-stretch gap-2">
        <Link
          href="/profile/edit"
          className={`${buttonClass({ variant: "secondary", size: "md" })} flex-1 md:flex-none`}
        >
          edit profile
        </Link>
        <ShareButton username={username} />
        <SettingsButton signOutAction={signOutAction} variant="action" />
      </div>
    );
  }

  // When viewing a profile you've blocked, the only sensible action is
  // to unblock — hide follow + chew-out so they're not invitations to
  // re-engage with someone the viewer chose to mute.
  if (isBlockingThem) {
    return (
      <div className="flex flex-wrap items-stretch gap-2">
        <BlockButton
          targetUserId={targetUserId}
          initialIsBlocking={true}
          variant="primary"
        />
        <ShareButton username={username} />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-stretch gap-2">
      <FollowButton
        targetUserId={targetUserId}
        initialIsFollowing={isFollowing}
      />
      <ChewOutButton targetUserId={targetUserId} username={username} />
      <ShareButton username={username} />
      <BlockButton
        targetUserId={targetUserId}
        initialIsBlocking={false}
        variant="icon"
      />
    </div>
  );
}

function FollowButton({
  targetUserId,
  initialIsFollowing,
}: {
  targetUserId: string;
  initialIsFollowing: boolean;
}) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  function onClick() {
    // Snapshot the value *before* this click so a failed toggle rolls back to
    // the user's last-known good state, not the mount-time prop. Otherwise a
    // success-then-failure sequence flips the UI back to the original prop
    // value (often wrong) until `router.refresh()` lands.
    const previous = optimistic;
    const next = !previous;
    setOptimistic(next);
    startTransition(async () => {
      const result = await toggleFollowAction({ targetUserId });
      if (!result.ok) {
        setOptimistic(previous);
      } else {
        setOptimistic(result.isFollowing);
      }
      // Refresh the RSC tree so follower counts on this page (and the viewer's
      // own /profile, if it's cached) reflect the new state.
      router.refresh();
    });
  }

  const variant = optimistic ? "secondary" : "primary";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-pressed={optimistic}
      className={`${buttonClass({ variant, size: "md" })} flex-1 md:flex-none ${
        isPending ? "opacity-70" : ""
      }`}
    >
      {optimistic ? "✓ following" : "+ follow"}
    </button>
  );
}

function ShareButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/profile/${username}`;

    // Native share-sheet on capable mobile browsers; fall back to clipboard so
    // desktop and unsupported environments still get a working share.
    const navAny = navigator as Navigator & {
      share?: (data: { title: string; url: string }) => Promise<void>;
    };
    if (typeof navAny.share === "function") {
      try {
        await navAny.share({ title: `@${username} on Haba-Chewoah`, url });
        return;
      } catch {
        // User dismissed the sheet or it failed; fall through to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (insecure context, denied perm) — last resort.
      window.prompt("copy this link", url);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="share profile"
      title={copied ? "link copied" : "share profile"}
      className={ICON_BASE_CLASS}
    >
      {copied ? (
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
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
        </svg>
      )}
      <span className="sr-only">{copied ? "link copied" : "share"}</span>
    </button>
  );
}

/**
 * Profile-level chew-out — picks the recipient's first eligible active
 * public habit (one they haven't logged today) and fires a chew-out about
 * it. Mirrors the per-habit `ChewOutButton` in `habit/_components/`, but
 * lets users buzz a friend straight from their profile without first
 * navigating to a specific habit.
 *
 * Empty state ("they're already done for today") is communicated with an
 * inline message + disabled state — no error toast, since "no eligible
 * habit" is a normal outcome, not a failure.
 */
function ChewOutButton({
  targetUserId,
  username,
}: {
  targetUserId: string;
  username: string;
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<
    "idle" | "sent" | "cooldown" | "ineligible"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  function onClick() {
    if (pending || status === "sent" || status === "cooldown") return;
    startTransition(async () => {
      const result = await chewOutOnProfileAction({ targetUserId });
      if (result.ok) {
        setStatus("sent");
        setMessage(`buzzed about "${result.habitName}"`);
      } else if (result.cooldown) {
        setStatus("cooldown");
        setMessage(result.message);
      } else if (result.noEligibleHabit) {
        setStatus("ineligible");
        setMessage(result.message);
      } else {
        setMessage(result.message);
      }
    });
  }

  const disabled =
    pending || status === "sent" || status === "cooldown" || status === "ineligible";
  const label =
    status === "sent"
      ? "chewed ⚡"
      : status === "cooldown"
        ? "buzzed today"
        : status === "ineligible"
          ? "they're done for today"
          : pending
            ? "chewing…"
            : "chew out";

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={`chew out @${username}`}
        className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-hc-2 border-hc border-hc-line px-3 py-2 font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow leading-none transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${
          status === "sent"
            ? "bg-hc-brand text-hc-brand-ink"
            : "bg-hc-accent text-hc-accent-ink"
        }`}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9z" />
        </svg>
        {label}
      </button>
      {message && (
        <p className="px-1 font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
          {message}
        </p>
      )}
    </div>
  );
}

/**
 * Block / unblock toggle. Confirms before blocking — blocking removes
 * follows in both directions (per NOTES.md §9), so this isn't a reversible
 * "untap to undo" operation. `variant="icon"` is the discreet entry on a
 * non-blocked profile; `variant="primary"` is the prominent unblock CTA
 * shown when the viewer is currently blocking the target.
 */
function BlockButton({
  targetUserId,
  initialIsBlocking,
  variant,
}: {
  targetUserId: string;
  initialIsBlocking: boolean;
  variant: "icon" | "primary";
}) {
  const router = useRouter();
  const [isBlocking, setIsBlocking] = useState(initialIsBlocking);
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (pending) return;
    if (!isBlocking) {
      const ok = window.confirm(
        "block this user? they won't appear in your feed, comments, or activity, and any follows between you will be removed.",
      );
      if (!ok) return;
    }
    startTransition(async () => {
      const result = isBlocking
        ? await unblockUserAction({ targetUserId })
        : await blockUserAction({ targetUserId });
      if (result.ok) {
        setIsBlocking(result.isBlocking);
        router.refresh();
      } else {
        alert(result.message);
      }
    });
  }

  if (variant === "primary") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={`${buttonClass({ variant: "primary", size: "md" })} flex-1 md:flex-none ${
          pending ? "opacity-70" : ""
        }`}
      >
        {pending ? "…" : "unblock"}
      </button>
    );
  }

  // Icon variant — the silhouette-with-slash glyph reads "block" without
  // copy, keeping the action row narrow on mobile.
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label="block user"
      title="block user"
      className={ICON_BASE_CLASS}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M4.93 4.93l14.14 14.14" />
      </svg>
      <span className="sr-only">block</span>
    </button>
  );
}
