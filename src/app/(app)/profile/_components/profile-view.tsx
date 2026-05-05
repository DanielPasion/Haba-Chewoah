import { type HabitCardData } from "../../habit/_components/habit-card";
import { type ProfileLogsCursor } from "../_data";
import { ProfileActions } from "./profile-actions";
import { ProfileAvatar } from "./profile-avatar";
import { type ProfileLogRow } from "./profile-log-row";
import { ProfileStats } from "./profile-stats";
import { ProfileTabs } from "./profile-tabs";

export type ProfileViewUser = {
  id: string;
  username: string;
  /** May be empty; we fall back to the username when seeding initials. */
  displayName?: string;
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
  initialLogsCursor,
  topStreak,
  totalLogs,
}: {
  user: ProfileViewUser;
  isOwn: boolean;
  isFollowing: boolean;
  isBlockingThem?: boolean;
  habits: HabitCardData[];
  logs: ProfileLogRow[];
  initialLogsCursor: ProfileLogsCursor | null;
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
        initialLogsCursor={initialLogsCursor}
      />
      <DesktopProfile
        user={user}
        isOwn={isOwn}
        isFollowing={isFollowing}
        isBlockingThem={isBlockingThem}
        stats={stats}
        habits={habits}
        logs={logs}
        initialLogsCursor={initialLogsCursor}
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
  initialLogsCursor,
}: {
  user: ProfileViewUser;
  isOwn: boolean;
  isFollowing: boolean;
  isBlockingThem: boolean;
  stats: { label: string; value: number }[];
  habits: HabitCardData[];
  logs: ProfileLogRow[];
  initialLogsCursor: ProfileLogsCursor | null;
}) {
  const seedName = user.displayName?.trim() || user.username;
  return (
    <div className="md:hidden">
      <section className="flex flex-col gap-5 px-5 pt-6 pb-6">
        <div className="flex items-start gap-4">
          <ProfileAvatar
            imageUrl={user.imageUrl}
            name={seedName}
            fallbackName={user.username}
            alt={`@${user.username} avatar`}
            size={84}
          />
          <div className="min-w-0 flex-1 pt-2">
            {user.displayName && (
              <p
                className="font-display text-xl font-extrabold leading-tight text-hc-ink"
                style={{ letterSpacing: "-0.03em" }}
              >
                {user.displayName}
              </p>
            )}
            <p className="font-mono text-sm font-medium text-hc-muted">
              @{user.username}
            </p>
          </div>
        </div>

        {user.bio && (
          <p className="text-[15px] leading-relaxed text-hc-ink">{user.bio}</p>
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

      <ProfileTabs
        isOwn={isOwn}
        ownerUserId={user.id}
        habits={habits}
        logs={logs}
        initialLogsCursor={initialLogsCursor}
      />
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
  initialLogsCursor,
}: {
  user: ProfileViewUser;
  isOwn: boolean;
  isFollowing: boolean;
  isBlockingThem: boolean;
  stats: { label: string; value: number }[];
  habits: HabitCardData[];
  logs: ProfileLogRow[];
  initialLogsCursor: ProfileLogsCursor | null;
}) {
  const seedName = user.displayName?.trim() || user.username;
  return (
    <div className="hidden md:block">
      <div
        className="relative z-0 h-36 overflow-hidden border-b border-hc-line"
        style={{
          background:
            "linear-gradient(135deg, var(--color-hc-brand) 0%, var(--color-hc-brand) 55%, var(--color-hc-accent) 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "repeating-linear-gradient(45deg, rgb(31 27 46 / 0.05) 0 1px, transparent 1px 18px)",
          }}
          aria-hidden
        />
      </div>

      <div className="relative z-10 -mt-14 px-8">
        <div className="flex items-end gap-5">
          <div className="text-hc-bg">
            <ProfileAvatar
              imageUrl={user.imageUrl}
              name={seedName}
              fallbackName={user.username}
              alt={`@${user.username} avatar`}
              size={112}
              ringWidth={4}
            />
          </div>
          <div className="min-w-0 flex-1 pb-3.5">
            {user.displayName && (
              <h1
                className="font-display text-3xl font-extrabold leading-none text-hc-ink"
                style={{ letterSpacing: "-0.04em" }}
              >
                {user.displayName}
              </h1>
            )}
            <p className="mt-1 font-mono text-sm font-medium text-hc-muted">
              @{user.username}
            </p>
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
          <p className="mt-5 max-w-155 text-[15px] leading-relaxed text-hc-ink">
            {user.bio}
          </p>
        )}

        <div className="mt-6">
          <ProfileStats
            stats={stats}
            variant="desktop"
            userId={user.id}
            username={user.username}
          />
        </div>

        <div className="mt-6">
          <ProfileTabs
            isOwn={isOwn}
            ownerUserId={user.id}
            habits={habits}
            logs={logs}
            initialLogsCursor={initialLogsCursor}
          />
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}
