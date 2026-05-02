"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoText } from "~/components/brand/logo-text";
import { TwoFaceMascot } from "~/components/brand/two-face-mascot";

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

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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
    <aside className="hidden w-60 shrink-0 flex-col gap-1 border-r border-hc-line bg-hc-bg px-4 pb-4 pt-5 md:flex">
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
                className={`flex items-center gap-3 rounded-hc-2 border-[1.5px] px-3 py-2.5 font-sans text-sm transition-colors ${
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

      <div className="flex items-center gap-2.5 rounded-hc-2 border-[1.5px] border-hc-line-strong bg-hc-surface p-2.5">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-hc-ink">
          <TwoFaceMascot size={32} bg="#1B1726" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-sans text-[13px] font-bold text-hc-ink">
            {displayName}
          </div>
          <div className="truncate font-mono text-[10px] font-medium text-hc-muted">
            @{username}
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            aria-label="sign out"
            title="sign out"
            className="grid size-7 place-items-center rounded-hc-1 text-hc-muted hover:bg-hc-bg hover:text-hc-ink"
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
      </div>
    </aside>
  );
}

export function AppMobileTopBar() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-hc-line bg-hc-bg/90 px-5 py-3 backdrop-blur md:hidden">
      <Link href="/feed">
        <LogoText size={16} />
      </Link>
    </header>
  );
}

export function AppMobileTabBar({
  signOutAction,
}: {
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-10 flex items-center justify-around border-t border-hc-line bg-hc-surface px-4 pb-2 pt-2.5 md:hidden">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              active ? "text-hc-ink" : "text-hc-muted opacity-60"
            }`}
          >
            <NavIcon>{item.icon}</NavIcon>
            <span className="font-mono text-[9px] font-semibold uppercase tracking-wider">
              {item.label}
            </span>
          </Link>
        );
      })}

      <form action={signOutAction} className="flex">
        <button
          type="submit"
          aria-label="sign out"
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-hc-muted opacity-60 hover:opacity-100"
        >
          <svg
            width="20"
            height="20"
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
          <span className="font-mono text-[9px] font-semibold uppercase tracking-wider">
            sign out
          </span>
        </button>
      </form>
    </nav>
  );
}
