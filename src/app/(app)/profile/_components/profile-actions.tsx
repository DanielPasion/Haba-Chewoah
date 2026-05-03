"use client";

import Link from "next/link";

import { buttonClass } from "~/components/ui";

const ICON_BASE_CLASS =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-hc-2 border-[1.5px] border-hc-ink bg-transparent px-3 py-2 font-sans text-[13px] font-bold leading-none text-hc-ink transition-transform hover:bg-hc-ink hover:text-hc-brand";

/**
 * Action row under the identity block. "edit profile" is the only fully
 * functional button right now; "share" is intentionally inert — the rest of
 * the social graph (follow, nudge, etc.) hasn't been wired up yet.
 */
export function ProfileActions({ isOwn }: { isOwn: boolean }) {
  if (isOwn) {
    return (
      <div className="flex flex-wrap items-stretch gap-2">
        <Link
          href="/profile/edit"
          className={`${buttonClass({ variant: "secondary", size: "md" })} flex-1 md:flex-none`}
        >
          edit profile
        </Link>
        <ShareButton />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-stretch gap-2">
      <button
        type="button"
        disabled
        title="follow — coming soon"
        className={`${buttonClass({ variant: "primary", size: "md" })} flex-1 cursor-not-allowed opacity-60 md:flex-none`}
      >
        + follow
      </button>
      <ShareButton />
    </div>
  );
}

/**
 * Visually present, non-functional share button. We render it because it's in
 * the mockup, but no share-sheet plumbing exists yet — clicks are no-ops.
 */
function ShareButton() {
  return (
    <button
      type="button"
      aria-label="share profile"
      title="share — coming soon"
      disabled
      className={`${ICON_BASE_CLASS} cursor-not-allowed opacity-60`}
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
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
      </svg>
      <span className="sr-only">share</span>
    </button>
  );
}
