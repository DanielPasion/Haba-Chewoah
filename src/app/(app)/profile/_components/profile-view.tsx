import { TwoFaceMascot } from "~/components/brand/two-face-mascot";

import { type HabitCardData } from "../../habit/_components/habit-card";
import { ProfileActions } from "./profile-actions";
import { ProfileAvatar } from "./profile-avatar";
import { type ProfileLogRow } from "./profile-log-row";
import { ProfileStats } from "./profile-stats";
import { ProfileTabs } from "./profile-tabs";

export type ProfileViewUser = {
  id: string;
  username: string;
  bio: string | null;
  imageUrl: string | null;
  followers: number;
  following: number;
};

/**
 * Composed profile page (header + identity + tabs). Renders two layouts:
 *
 * - **mobile** (`md:hidden`): vertical, avatar+name in a row, stats below.
 * - **desktop** (`hidden md:flex`): full-bleed banner with avatar overlapping
 *   it; mirrors `.claude/ui/project/desktop.jsx` (`DProfile`).
 *
 * Streak / total-log stats stay zero — habits aren't tracked yet — but
 * follower/following counts come from live queries via the page loader.
 */
export function ProfileView({
  user,
  isOwn,
  isFollowing,
  isBlockingThem = false,
  habits,
  logs,
  topStreak,
  totalLogs,
}: {
  user: ProfileViewUser;
  isOwn: boolean;
  isFollowing: boolean;
  isBlockingThem?: boolean;
  habits: HabitCardData[];
  logs: ProfileLogRow[];
  topStreak: number;
  totalLogs: number;
}) {
  const stats = [
    { label: "followers", value: user.followers },
    { label: "following", value: user.following },
    { label: "top streak", value: topStreak },
    { label: "total logs", value: totalLogs },
  ];

  // Cancels the (app) layout's <main> padding so the desktop banner can go
  // edge-to-edge; per-section padding is added back below.
  return (
    <div className="-mx-5 -my-6 md:-mx-8 md:-my-8">
      <MobileProfile
        user={user}
        isOwn={isOwn}
        isFollowing={isFollowing}
        isBlockingThem={isBlockingThem}
        stats={stats}
        habits={habits}
        logs={logs}
      />
      <DesktopProfile
        user={user}
        isOwn={isOwn}
        isFollowing={isFollowing}
        isBlockingThem={isBlockingThem}
        stats={stats}
        habits={habits}
        logs={logs}
      />
    </div>
  );
}

function MobileProfile({
  user,
  isOwn,
  isFollowing,
  isBlockingThem,
  stats,
  habits,
  logs,
}: {
  user: ProfileViewUser;
  isOwn: boolean;
  isFollowing: boolean;
  isBlockingThem: boolean;
  stats: { label: string; value: number }[];
  habits: HabitCardData[];
  logs: ProfileLogRow[];
}) {
  return (
    <div className="md:hidden">
      <section className="flex flex-col gap-4 px-5 pt-5 pb-5">
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

        <ProfileStats
          stats={stats}
          variant="mobile"
          userId={user.id}
          username={user.username}
        />

        <ProfileActions
          isOwn={isOwn}
          isFollowing={isFollowing}
          isBlockingThem={isBlockingThem}
          targetUserId={user.id}
          username={user.username}
        />
      </section>

      <ProfileTabs isOwn={isOwn} habits={habits} logs={logs} />
    </div>
  );
}

function DesktopProfile({
  user,
  isOwn,
  isFollowing,
  isBlockingThem,
  stats,
  habits,
  logs,
}: {
  user: ProfileViewUser;
  isOwn: boolean;
  isFollowing: boolean;
  isBlockingThem: boolean;
  stats: { label: string; value: number }[];
  habits: HabitCardData[];
  logs: ProfileLogRow[];
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
            <ProfileActions
              isOwn={isOwn}
              isFollowing={isFollowing}
              isBlockingThem={isBlockingThem}
              targetUserId={user.id}
              username={user.username}
            />
          </div>
        </div>

        {user.bio && (
          <p className="mt-4 max-w-155 text-sm leading-relaxed text-hc-ink">
            {user.bio}
          </p>
        )}

        <div className="mt-5">
          <ProfileStats
            stats={stats}
            variant="desktop"
            userId={user.id}
            username={user.username}
          />
        </div>

        <div className="mt-5">
          <ProfileTabs isOwn={isOwn} habits={habits} logs={logs} />
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}
