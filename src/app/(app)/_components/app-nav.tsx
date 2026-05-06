"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { Avatar } from "~/components/avatar";
import { LogoText } from "~/components/brand/logo-text";
import { SettingsButton } from "~/components/settings-button";

import { MobileAddButton } from "./add-sheet";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  iconActive?: React.ReactNode;
};

// Filled glyphs render on the active tab so the bottom bar reads like a
// modern social app — Threads/Instagram pattern. Inactive uses the outline
// version (lower visual weight).
const HOME_OUTLINE = (
  <path d="M3 9.5l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" />
);
const HOME_FILLED = (
  <path
    d="M3 9.5l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"
    fill="currentColor"
  />
);
const PROFILE_OUTLINE = (
  <>
    <circle cx="12" cy="8" r="4.2" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </>
);
const PROFILE_FILLED = (
  <>
    <circle cx="12" cy="8" r="4.2" fill="currentColor" />
    <path d="M4 21a8 8 0 0 1 16 0" fill="currentColor" />
  </>
);
const EXPLORE_OUTLINE = (
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </>
);

// Profile links route directly to `/profile/<username>` (the canonical URL)
// instead of bouncing through `/profile`'s server-side redirect — otherwise
// the closest matching loading.tsx during the redirect transition is the
// generic (app) feed skeleton, which flashes a skeleton that doesn't look
// like a profile page at all.
function buildNavItems(username: string): NavItem[] {
  return [
    {
      href: "/feed",
      label: "home",
      icon: HOME_OUTLINE,
      iconActive: HOME_FILLED,
    },
    { href: "/explore", label: "explore", icon: EXPLORE_OUTLINE },
    {
      href: `/profile/${username}`,
      label: "profile",
      icon: PROFILE_OUTLINE,
      iconActive: PROFILE_FILLED,
    },
  ];
}

function isActive(pathname: string, href: string) {
  if (href.startsWith("/profile/")) {
    // Only highlight the profile tab on *your own* profile (and its
    // sub-routes like /profile/edit). Treating any /profile/* as active
    // makes the tab claim aria-current="page" while viewing strangers,
    // and turns the active-tap branch (preventDefault + refresh) into a
    // dead-end — re-tapping while on @bob's profile should navigate you
    // home, not refresh @bob.
    return pathname === href || pathname.startsWith(`${href}/`) || pathname === "/profile";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Re-tapping the already-active tab scrolls back to the top *and* refreshes
// the route — same affordance as Twitter/Instagram. `behavior: "smooth"` only
// when the user isn't scrolled too far; for very long feeds an instant jump
// reads as more responsive than a 2-second smooth scroll.
function scrollPageToTop() {
  if (typeof window === "undefined") return;
  const behavior: ScrollBehavior =
    window.scrollY > 1800 || window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
  window.scrollTo({ top: 0, behavior });
}

function NavIcon({
  children,
  size = 22,
  strokeWidth = 1.75,
}: {
  children: React.ReactNode;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function AppSidebar({
  username,
  displayName,
  signOutAction,
}: {
  username: string;
  displayName: string;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const navItems = buildNavItems(username);
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-1 overflow-y-auto border-r border-hc-line bg-hc-bg px-4 pb-4 pt-6 md:flex">
      <Link href="/feed" className="px-3 pb-6 pt-1">
        <LogoText size={18} />
      </Link>

      <ul className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <NavSidebarLink item={item} active={active} />
            </li>
          );
        })}
      </ul>

      <div className="flex-1" />

      <div className="flex items-center gap-3 rounded-hc-2 border border-hc-line bg-hc-surface p-2.5">
        <Link
          href={`/profile/${username}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-hc-1 transition-colors"
        >
          <Avatar
            imageUrl={null}
            name={displayName}
            fallbackName={username}
            size={36}
            alt={`${displayName} avatar`}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate font-sans text-hc-button font-bold text-hc-ink">
              {displayName}
            </div>
            <div className="truncate font-mono text-hc-eyebrow font-medium text-hc-muted">
              @{username}
            </div>
          </div>
        </Link>
        <SettingsButton signOutAction={signOutAction} variant="sidebar" />
      </div>
    </aside>
  );
}

function NavSidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Link
      href={item.href}
      onClick={(e) => {
        if (!active) return;
        e.preventDefault();
        scrollPageToTop();
        startTransition(() => router.refresh());
      }}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-hc-2 px-3 py-2.5 font-sans text-sm transition-colors ${
        active
          ? "bg-hc-surface font-bold text-hc-ink"
          : "font-medium text-hc-ink/75 hover:bg-hc-surface hover:text-hc-ink"
      }`}
    >
      <NavIcon strokeWidth={active ? 2.1 : 1.75}>
        {active && item.iconActive ? item.iconActive : item.icon}
      </NavIcon>
      <span className="flex-1 capitalize">{item.label}</span>
      {active && pending && (
        <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-hc-accent" />
      )}
    </Link>
  );
}

export function AppDesktopTopBar({
  hasUnreadNotifications = false,
}: {
  hasUnreadNotifications?: boolean;
}) {
  return (
    <header className="hidden items-center justify-end gap-2 border-b border-hc-line bg-hc-bg px-8 py-3 md:flex">
      <RefreshButton />
      <MobileAddButton variant="topbar" />
      <NotificationBell hasUnread={hasUnreadNotifications} />
    </header>
  );
}

function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      aria-label={pending ? "refreshing" : "refresh"}
      title="refresh"
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-hc-ink hover:bg-hc-surface disabled:opacity-60"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={pending ? "animate-spin" : ""}
      >
        <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
        <path d="M21 3v5h-5" />
      </svg>
    </button>
  );
}

export function AppMobileTopBar({
  hasUnreadNotifications = false,
}: {
  hasUnreadNotifications?: boolean;
}) {
  return (
    <header
      className="sticky top-0 z-20 border-b border-hc-line bg-hc-bg/85 backdrop-blur md:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="relative flex items-center justify-between gap-2 px-5 py-3">
        <Link href="/feed" className="shrink-0">
          <LogoText size={16} />
        </Link>
        <div className="flex items-center gap-1">
          <ExploreIconLink />
          <NotificationBell hasUnread={hasUnreadNotifications} />
        </div>
      </div>
    </header>
  );
}

function ExploreIconLink() {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const active = isActive(pathname, "/explore");
  return (
    <Link
      href="/explore"
      aria-label="explore"
      title="explore"
      onClick={(e) => {
        if (!active) return;
        e.preventDefault();
        scrollPageToTop();
        startTransition(() => router.refresh());
      }}
      aria-current={active ? "page" : undefined}
      className={`grid size-9 shrink-0 place-items-center rounded-full transition-colors ${
        active
          ? "bg-hc-ink text-hc-bg dark:bg-hc-brand dark:text-hc-brand-ink"
          : "text-hc-ink hover:bg-hc-surface"
      }`}
    >
      <NavIcon size={19}>{EXPLORE_OUTLINE}</NavIcon>
    </Link>
  );
}

function NotificationBell({ hasUnread }: { hasUnread: boolean }) {
  return (
    <Link
      href="/notifications"
      aria-label={hasUnread ? "notifications · unread" : "notifications"}
      className="relative grid size-9 place-items-center rounded-full text-hc-ink hover:bg-hc-surface"
    >
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {hasUnread && (
        <span
          aria-hidden
          className="absolute right-2 top-2 size-2 rounded-full bg-hc-accent ring-2 ring-hc-bg"
        />
      )}
    </Link>
  );
}

export function AppMobileTabBar({ username }: { username: string }) {
  const pathname = usePathname();
  const navItems = buildNavItems(username);
  // Three equal-width grid slots so the center FAB sits at the geometric
  // centre regardless of label widths. The `before:` extends the surface
  // upward so the elevated FAB sits over an opaque backdrop instead of
  // letting feed photos peek through the corners of its silhouette.
  return (
    <nav
      className="sticky bottom-0 z-20 grid grid-cols-3 items-center border-t border-hc-line bg-hc-surface px-3 pt-1.5 md:hidden"
      style={{ paddingBottom: "max(0.4rem, env(safe-area-inset-bottom))" }}
    >
      <div className="relative z-10 flex justify-center">
        <MobileTabLink item={navItems[0]!} pathname={pathname} />
      </div>
      <div className="relative z-10 flex justify-center">
        <MobileAddButton variant="fab" />
      </div>
      <div className="relative z-10 flex justify-center">
        <MobileTabLink item={navItems[2]!} pathname={pathname} />
      </div>
    </nav>
  );
}

function MobileTabLink({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={(e) => {
        if (!active) return;
        e.preventDefault();
        scrollPageToTop();
        startTransition(() => router.refresh());
      }}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      className={`flex items-center justify-center px-4 py-1.5 ${
        active ? "text-hc-ink" : "text-hc-muted"
      }`}
    >
      <NavIcon size={26} strokeWidth={active ? 2 : 1.75}>
        {active && item.iconActive ? item.iconActive : item.icon}
      </NavIcon>
    </Link>
  );
}
