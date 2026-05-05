"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoText } from "~/components/brand/logo-text";
import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
import { SettingsButton } from "~/components/settings-button";

import { MobileAddButton } from "./add-sheet";
import { DesktopSearchBar } from "./desktop-search-bar";
import { MobileHeaderSearch } from "./mobile-header-search";

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

const NAV_ITEMS: NavItem[] = [
  { href: "/feed", label: "home", icon: HOME_ICON },
  { href: "/profile", label: "profile", icon: PROFILE_ICON },
];

// Mobile bottom tab bar — three slots: home · center plus · profile.
// Mirrors `.claude/ui/project/profile-page.jsx` (`ProfileTabBar`). The center
// plus is the BeReal-style FAB that opens the AddSheet.
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
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-hc-2 border-hc px-3 py-2.5 font-sans text-sm transition-colors ${
                  active
                    ? "border-hc-ink bg-hc-surface font-bold text-hc-ink"
                    : "border-transparent font-semibold text-hc-ink hover:bg-hc-surface-alt"
                }`}
              >
                <NavIcon>{item.icon}</NavIcon>
                <span>{item.label}</span>
              </Link>
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

// Desktop-only top bar carrying the global search box + notification bell.
// Replicates the right-side affordances of `.claude/ui/project/desktop.jsx`
// `DTopbar`. Not sticky itself: pages already have sticky sub-headers at
// `md:top-0` and ⌘K focuses the search from anywhere.
//
// `DesktopNewHabitButton` is the desktop's only entry point for creating
// a habit — the mobile FAB lives in the bottom tab bar, which is hidden
// on `md+` (`md:hidden` on `AppMobileTabBar`). Without this, desktop
// users have no UI affordance to start a new habit.
export function AppDesktopTopBar({
  hasUnreadNotifications = false,
}: {
  hasUnreadNotifications?: boolean;
}) {
  return (
    <header className="hidden items-center justify-end gap-3 border-b border-hc-line bg-hc-bg px-8 py-3 md:flex">
      <DesktopSearchBar />
      <DesktopNewHabitButton />
      <NotificationBell hasUnread={hasUnreadNotifications} />
    </header>
  );
}

function DesktopNewHabitButton() {
  return (
    <Link
      href="/habit/new"
      aria-label="start a new habit"
      title="start a new habit"
      className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-hc-line bg-hc-brand text-hc-brand-ink transition-transform hover:-translate-y-px"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
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
      <div className="relative flex items-center justify-between px-5 py-3">
        <Link href="/feed">
          <LogoText size={16} />
        </Link>
        <div className="flex items-center gap-2">
          <MobileHeaderSearch />
          <NotificationBell hasUnread={hasUnreadNotifications} />
        </div>
      </div>
    </header>
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
  return (
    <nav
      className="sticky bottom-0 z-10 grid grid-cols-3 items-center border-t border-hc-line bg-hc-surface px-4 pt-2.5 md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex justify-center">
        <MobileTabLink item={MOBILE_TAB_ITEMS[0]!} pathname={pathname} />
      </div>
      <div className="flex justify-center">
        <MobileAddButton variant="fab" />
      </div>
      <div className="flex justify-center">
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
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
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
