"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Avatar } from "~/components/avatar";
import { TwoFaceMascot } from "~/components/brand/two-face-mascot";

import { FollowToggleButton } from "../../profile/_components/follow-toggle-button";

export type ExploreUser = {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  image: string | null;
  habitCount: number;
  followerCount: number;
  isFollowing: boolean;
  /** ISO 8601 date — passed as a string so the cache-friendly props stay
   *  serializable when crossing the server/client boundary. */
  joinedAt: string;
};

export function ExploreList({ users }: { users: ExploreUser[] }) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().replace(/^@/, "").toLowerCase();

  const filtered = useMemo(() => {
    if (!trimmed) return users;
    return users.filter((u) => {
      const handle = u.username.toLowerCase();
      const name = u.displayName.toLowerCase();
      return handle.includes(trimmed) || name.includes(trimmed);
    });
  }, [users, trimmed]);

  return (
    <>
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="flex items-center gap-2.5 rounded-full border border-hc-line bg-hc-surface px-4 py-2.5 focus-within:border-hc-line-strong"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="shrink-0 text-hc-muted"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search by name or @handle"
          aria-label="filter users"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent font-sans text-sm text-hc-ink placeholder:text-hc-muted focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="font-sans text-xs font-semibold text-hc-muted hover:text-hc-ink"
          >
            clear
          </button>
        )}
      </form>

      {users.length === 0 ? (
        <EmptyAll />
      ) : filtered.length === 0 ? (
        <EmptyMatch query={trimmed} />
      ) : (
        <>
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-base font-extrabold text-hc-ink" style={{ letterSpacing: "-0.03em" }}>
              {trimmed ? "matches" : "newest members"}
            </h3>
            <span className="font-mono text-hc-tiny font-medium text-hc-muted">
              {filtered.length} {filtered.length === 1 ? "person" : "people"}
            </span>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((u) => (
              <li key={u.id}>
                <UserCard user={u} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function UserCard({ user }: { user: ExploreUser }) {
  return (
    <Link
      href={`/profile/${user.username}`}
      className="group flex h-full flex-col gap-3 rounded-hc-3 border border-hc-line bg-hc-surface p-4 transition-colors hover:bg-hc-surface-alt"
    >
      <div className="flex items-start gap-3">
        <Avatar
          imageUrl={user.image}
          name={user.displayName}
          fallbackName={user.username}
          size={52}
          alt={`${user.displayName} avatar`}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-sm font-bold text-hc-ink">
            {user.displayName}
          </p>
          <p className="truncate font-mono text-hc-meta font-medium text-hc-muted">
            @{user.username}
          </p>
        </div>
        <FollowToggleButton
          targetUserId={user.id}
          initialIsFollowing={user.isFollowing}
          size="sm"
        />
      </div>

      {user.bio && (
        <p className="line-clamp-3 text-sm leading-snug text-hc-ink/85">
          {user.bio}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2 border-t border-hc-line pt-3">
        <div className="flex items-baseline gap-4">
          <Stat value={user.habitCount} label={user.habitCount === 1 ? "habit" : "habits"} />
          <Stat
            value={user.followerCount}
            label={user.followerCount === 1 ? "follower" : "followers"}
          />
        </div>
        <div className="flex items-center gap-1.5 font-mono text-hc-tiny font-medium text-hc-muted">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          joined {formatJoined(user.joinedAt)}
        </div>
      </div>
    </Link>
  );
}

const JOINED_FMT = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatJoined(iso: string) {
  const date = new Date(iso);
  return JOINED_FMT.format(date).toLowerCase();
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="font-display text-base font-extrabold text-hc-ink tabular-nums" style={{ letterSpacing: "-0.03em" }}>
        {value}
      </span>
      <span className="font-mono text-hc-tiny font-medium uppercase tracking-hc-eyebrow text-hc-muted">
        {label}
      </span>
    </div>
  );
}

function EmptyAll() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-hc-3 border border-dashed border-hc-line-strong bg-hc-surface-alt px-6 py-14 text-center">
      <TwoFaceMascot size={64} mood="wink" bg="#1B1726" />
      <div className="flex flex-col items-center gap-1.5">
        <h2
          className="font-display text-lg font-extrabold text-hc-ink"
          style={{ letterSpacing: "-0.03em" }}
        >
          quiet around here
        </h2>
        <p className="max-w-sm text-sm text-hc-muted">
          no other humans yet. invite a friend so the feed has someone to cheer
          on.
        </p>
      </div>
    </div>
  );
}

function EmptyMatch({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-hc-3 border border-dashed border-hc-line-strong bg-hc-surface-alt px-6 py-12 text-center">
      <p className="font-display text-base font-extrabold text-hc-ink">
        no matches
      </p>
      <p className="max-w-sm text-sm text-hc-muted">
        nobody matching{" "}
        <span className="font-mono text-hc-ink">@{query}</span> in the recent
        crowd. try a different spelling.
      </p>
    </div>
  );
}
