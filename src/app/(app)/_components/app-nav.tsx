"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { LogoText } from "~/components/brand/logo-text";
import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
import { SettingsButton } from "~/components/settings-button";

import { MobileAddButton } from "./add-sheet";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const HOME_ICON = (
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" />
);
const PROFILE_ICON = (
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
);
const EXPLORE_ICON = (
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </>
);

const NAV_ITEMS: NavItem[] = [
  { href: "/feed", label: "home", icon: HOME_ICON },
  { href: "/explore", label: "explore", icon: EXPLORE_ICON },
  { href: "/profile", label: "profile", icon: PROFILE_ICON },
];

// Mobile bottom tab bar — three slots: home · center plus · profile.
// Mirrors `.claude/ui/project/profile-page.jsx` (`ProfileTabBar`). The
// center plus is the BeReal-style FAB that opens the AddSheet. Explore +
// refresh live in the mobile top header (`AppMobileTopBar`) instead so
// the bottom bar stays a thumb-friendly three-target shelf.
const MOBILE_TAB_ITEMS: NavItem[] = [
  { href: "/feed", label: "home", icon: HOME_ICON },
  { href: "/profile", label: "profile", icon: PROFILE_ICON },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({
  children,
  size = 20,
  strokeWidth = 2,
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
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r border-hc-line bg-hc-bg px-4 pb-4 pt-5 md:flex">
      <Link href="/feed" className="px-2 pb-5 pt-1">
        <LogoText size={18} />
      </Link>

      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <NavSidebarLink item={item} active={active} />
            </li>
          );
        })}
      </ul>

      <div className="flex-1" />

      <div className="flex items-center gap-2.5 rounded-hc-2 border-hc border-hc-line-strong bg-hc-surface p-2.5">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-hc-ink">
          <TwoFaceMascot size={32} bg="#1B1726" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-sans text-hc-button font-bold text-hc-ink">
            {displayName}
          </div>
          <div className="truncate font-mono text-hc-eyebrow font-medium text-hc-muted">
            @{username}
          </div>
        </div>
        <SettingsButton signOutAction={signOutAction} variant="sidebar" />
      </div>
    </aside>
  );
}

// Click on the active nav route triggers `router.refresh()` instead of a
// no-op navigation. Other clicks behave like a normal `<Link>`. Keeps the
// "I'm already here" tap useful (pull-to-refresh equivalent) without
// re-fetching the same RSC payload twice.
function NavSidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Link
      href={item.href}
      onClick={(e) => {
        if (!active) return;
        e.preventDefault();
        startTransition(() => router.refresh());
      }}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-hc-2 border-hc px-3 py-2.5 font-sans text-sm transition-colors ${
        active
          ? "border-hc-ink bg-hc-surface font-bold text-hc-ink"
          : "border-transparent font-semibold text-hc-ink hover:bg-hc-surface-alt"
      }`}
    >
      <NavIcon>{item.icon}</NavIcon>
      <span className="flex-1">{item.label}</span>
      {active && (
        <span
          aria-hidden
          className={`size-2 rounded-full bg-hc-accent ${pending ? "animate-pulse" : ""}`}
        />
      )}
    </Link>
  );
}

// Desktop-only top bar carrying the right-side actions: refresh, add,
// notifications. The username search lives on /explore as a list filter,
// so the bar stays uncluttered.
//
// The shared `MobileAddButton` (despite its name) is the desktop's add
// entry point too — same trigger logic, same sheet, just rendered as a
// centered modal instead of a bottom sheet via responsive classes.
export function AppDesktopTopBar({
  hasUnreadNotifications = false,
}: {
  hasUnreadNotifications?: boolean;
}) {
  return (
    <header className="hidden items-center justify-end gap-3 border-b border-hc-line bg-hc-bg px-8 py-3 md:flex">
      <RefreshButton />
      <MobileAddButton variant="topbar" />
      <NotificationBell hasUnread={hasUnreadNotifications} />
    </header>
  );
}

// Forces a fresh RSC fetch for the current route. Distinct from clicking
// an active nav link (which also refreshes) — the dedicated button gives
// users an unambiguous "reload" affordance without leaving the page.
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
      className="grid size-9 shrink-0 place-items-center rounded-full border border-hc-line bg-hc-surface text-hc-ink hover:bg-hc-surface-alt disabled:opacity-60"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
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
  // `viewport-fit=cover` lets the page render behind the iOS status bar /
  // dynamic island. Pad by `env(safe-area-inset-top)` so the row's contents
  // sit below the notch instead of being clipped by it. The header itself
  // keeps `top-0` because the safe-area padding is part of its own height.
  return (
    <header
      className="sticky top-0 z-20 border-b border-hc-line bg-hc-bg/90 backdrop-blur md:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="relative flex items-center justify-between gap-2 px-5 py-3">
        <Link href="/feed" className="shrink-0">
          <LogoText size={16} />
        </Link>
        <div className="flex items-center gap-2">
          <ExploreIconLink />
          <RefreshButton />
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
        startTransition(() => router.refresh());
      }}
      aria-current={active ? "page" : undefined}
      className={`grid size-9 shrink-0 place-items-center rounded-full border border-hc-line ${
        active
          ? "bg-hc-ink text-hc-brand"
          : "bg-hc-surface text-hc-ink hover:bg-hc-surface-alt"
      }`}
    >
      <NavIcon size={18}>{EXPLORE_ICON}</NavIcon>
    </Link>
  );
}

function NotificationBell({ hasUnread }: { hasUnread: boolean }) {
  return (
    <Link
      href="/notifications"
      aria-label={
        hasUnread ? "notifications · unread" : "notifications"
      }
      className="relative grid size-9 place-items-center rounded-full border border-hc-line bg-hc-surface text-hc-ink hover:bg-hc-surface-alt"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {hasUnread && (
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 size-2.5 rounded-full border border-hc-bg bg-hc-accent"
        />
      )}
    </Link>
  );
}

export function AppMobileTabBar() {
  const pathname = usePathname();
  // Three equal-width grid slots so the center FAB sits at the geometric
  // center of the bar regardless of the outer tab labels' widths.
  // `justify-around` would skew the FAB right when "home" is shorter than
  // "profile" (or vice versa). Bottom padding respects iOS home-indicator
  // safe area so the bar doesn't sit underneath it.
  //
  // `before:` extends the surface upward by ~28px so the elevated FAB
  // (`-mt-6`, size-14) sits over an opaque backdrop instead of letting
  // feed photos peek through the corners of its circular silhouette.
  return (
    <nav
      className="sticky bottom-0 z-20 grid grid-cols-3 items-center border-t border-hc-line bg-hc-surface px-4 pt-2.5 before:pointer-events-none before:absolute before:-top-7 before:left-0 before:right-0 before:h-7 before:bg-hc-surface before:content-[''] md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="relative z-10 flex justify-center">
        <MobileTabLink item={MOBILE_TAB_ITEMS[0]!} pathname={pathname} />
      </div>
      <div className="relative z-10 flex justify-center">
        <MobileAddButton variant="fab" />
      </div>
      <div className="relative z-10 flex justify-center">
        <MobileTabLink item={MOBILE_TAB_ITEMS[1]!} pathname={pathname} />
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
        startTransition(() => router.refresh());
      }}
      aria-current={active ? "page" : undefined}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
        active ? "text-hc-ink" : "text-hc-muted opacity-60"
      }`}
    >
      <NavIcon size={22}>{item.icon}</NavIcon>
      <span className="font-mono text-hc-tiny font-semibold uppercase tracking-wider">
        {item.label}
      </span>
    </Link>
  );
}
