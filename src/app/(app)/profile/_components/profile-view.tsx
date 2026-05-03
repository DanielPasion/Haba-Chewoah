import { TwoFaceMascot } from "~/components/brand/two-face-mascot";

import { signOutAction } from "../../_actions";
import { ProfileActions } from "./profile-actions";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileStats } from "./profile-stats";
import { ProfileTabs } from "./profile-tabs";

export type ProfileViewUser = {
  username: string;
  bio: string | null;
  imageUrl: string | null;
};

export function ProfileView({
  user,
  isOwn,
}: {
  user: ProfileViewUser;
  isOwn: boolean;
}) {
  // Cancels the (app) layout's <main> padding so the desktop banner can go
  // edge-to-edge; per-section padding is added back below.
  return (
    <div className="-mx-5 -my-6 md:-mx-8 md:-my-8">
      <MobileProfile user={user} isOwn={isOwn} />
      <DesktopProfile user={user} isOwn={isOwn} />
    </div>
  );
}

function MobileProfile({
  user,
  isOwn,
}: {
  user: ProfileViewUser;
  isOwn: boolean;
}) {
  return (
    <div className="md:hidden">
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-hc-muted">
          /profile/{isOwn ? "me" : user.username}
        </span>
        {isOwn && (
          <form action={signOutAction}>
            <button
              type="submit"
              aria-label="sign out"
              title="sign out"
              className="grid size-8 place-items-center rounded-full text-hc-muted hover:bg-hc-surface hover:text-hc-ink"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </form>
        )}
      </header>

      <section className="flex flex-col gap-4 px-5 pb-5">
        <div className="flex items-start gap-4">
          <ProfileAvatar
            imageUrl={user.imageUrl}
            alt={`@${user.username} avatar`}
            size={88}
          />
          <div className="min-w-0 flex-1 pt-2">
            <h1
              className="font-display text-2xl font-extrabold leading-tight text-hc-ink"
              style={{ letterSpacing: "-0.03em" }}
            >
              @{user.username}
            </h1>
          </div>
        </div>

        {user.bio && (
          <p className="text-sm leading-relaxed text-hc-ink">{user.bio}</p>
        )}

        <ProfileStats stats={ZERO_STATS} variant="mobile" />

        <ProfileActions isOwn={isOwn} />
      </section>

      <ProfileTabs isOwn={isOwn} />
    </div>
  );
}

function DesktopProfile({
  user,
  isOwn,
}: {
  user: ProfileViewUser;
  isOwn: boolean;
}) {
  return (
    <div className="hidden md:block">
      <div
        className="relative z-0 h-40 overflow-hidden border-b border-hc-line"
        style={{
          background:
            "linear-gradient(135deg, var(--color-hc-brand) 0%, var(--color-hc-brand) 60%, var(--color-hc-accent) 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "repeating-linear-gradient(45deg, rgb(31 27 46 / 0.06) 0 1px, transparent 1px 18px)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-8 -bottom-2"
          aria-hidden
        >
          <TwoFaceMascot size={140} mood="celebrate" bg="#1B1726" />
        </div>
      </div>

      <div className="relative z-10 -mt-14 px-8">
        <div className="flex items-end gap-5">
          <ProfileAvatar
            imageUrl={user.imageUrl}
            alt={`@${user.username} avatar`}
            size={120}
            ringWidth={3}
          />
          <div className="min-w-0 flex-1 pb-3.5">
            <h1
              className="font-display text-3xl font-extrabold leading-none text-hc-ink"
              style={{ letterSpacing: "-0.03em" }}
            >
              @{user.username}
            </h1>
          </div>
          <div className="pb-3.5">
            <ProfileActions isOwn={isOwn} />
          </div>
        </div>

        {user.bio && (
          <p className="mt-4 max-w-155 text-sm leading-relaxed text-hc-ink">
            {user.bio}
          </p>
        )}

        <div className="mt-5">
          <ProfileStats stats={ZERO_STATS} variant="desktop" />
        </div>

        <div className="mt-5">
          <ProfileTabs isOwn={isOwn} />
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}

const ZERO_STATS = [
  { label: "followers", value: 0 },
  { label: "following", value: 0 },
  { label: "top streak", value: 0 },
  { label: "total logs", value: 0 },
];
