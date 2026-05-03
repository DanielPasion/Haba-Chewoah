"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { buttonClass } from "~/components/ui";

import { toggleFollowAction } from "../_actions";

const ICON_BASE_CLASS =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-hc-2 border-[1.5px] border-hc-ink bg-transparent px-3 py-2 font-sans text-[13px] font-bold leading-none text-hc-ink transition-transform hover:bg-hc-ink hover:text-hc-brand";

/**
 * Action row under the identity block. Renders edit/share for own profile,
 * follow/share for others.
 */
export function ProfileActions({
  isOwn,
  isFollowing,
  targetUserId,
  username,
}: {
  isOwn: boolean;
  isFollowing: boolean;
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
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-stretch gap-2">
      <FollowButton
        targetUserId={targetUserId}
        initialIsFollowing={isFollowing}
      />
      <ShareButton username={username} />
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
