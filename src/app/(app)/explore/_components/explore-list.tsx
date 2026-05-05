"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";

export type ExploreUser = {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  image: string | null;
  habitCount: number;
  followerCount: number;
  isFollowing: boolean;
};

export function ExploreList({ users }: { users: ExploreUser[] }) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().replace(/^@/, "").toLowerCase();

  // Client-side filter across the loaded slice — username + display name.
  // The page already paginates the snapshot down to a manageable count, so
  // the in-memory filter stays cheap and avoids a round-trip per keystroke.
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
        className="flex items-center gap-2.5 rounded-full border-hc border-hc-line-strong bg-hc-surface px-4 py-2.5"
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
          className="shrink-0 text-hc-muted"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search humans by name or @handle…"
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
            className="font-mono text-hc-eyebrow font-semibold uppercase tracking-hc-eyebrow text-hc-muted hover:text-hc-ink"
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
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((u) => (
            <li key={u.id}>
              <UserCard user={u} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function UserCard({ user }: { user: ExploreUser }) {
  return (
    <Link
      href={`/profile/${user.username}`}
      className="flex items-start gap-3 rounded-hc-3 border-hc border-hc-line bg-hc-surface p-4 transition-transform hover:-translate-y-px hover:shadow-hc"
    >
      <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border border-hc-line bg-hc-ink">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <TwoFaceMascot size={40} bg="#1B1726" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-sans text-sm font-bold text-hc-ink">
            {user.displayName}
          </p>
          {user.isFollowing && (
            <span className="shrink-0 rounded-full bg-hc-accent/15 px-1.5 py-px font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow text-hc-accent">
              following
            </span>
          )}
        </div>
        <p className="truncate font-mono text-hc-meta font-semibold text-hc-muted">
          @{user.username}
        </p>
        {user.bio && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-hc-ink/80">
            {user.bio}
          </p>
        )}
        <p className="mt-1.5 font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
          {user.habitCount} habit{user.habitCount === 1 ? "" : "s"} ·{" "}
          {user.followerCount} follower
          {user.followerCount === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}

function EmptyAll() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-hc-3 border-hc border-dashed border-hc-line-strong bg-hc-surface-alt px-6 py-12 text-center">
      <TwoFaceMascot size={84} mood="wink" bg="#1B1726" />
      <div className="flex flex-col items-center gap-1">
        <p className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-muted">
          empty room
        </p>
        <p className="max-w-sm text-sm text-hc-ink">
          no other humans yet. invite a friend so the feed has someone
          to roast.
        </p>
      </div>
    </div>
  );
}

function EmptyMatch({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-hc-3 border-hc border-dashed border-hc-line-strong bg-hc-surface-alt px-6 py-10 text-center">
      <TwoFaceMascot size={64} mood="dead" bg="#1B1726" />
      <p className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-muted">
        no matches
      </p>
      <p className="max-w-sm text-sm text-hc-ink">
        nobody named like{" "}
        <span className="font-mono text-hc-accent">@{query}</span> in the
        recent crowd. try a different spelling.
      </p>
    </div>
  );
}
