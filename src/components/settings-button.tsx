"use client";

import { useEffect, useState } from "react";

import { MoonIcon, SunIcon } from "~/components/icons";

import { useTheme } from "./theme-toggle";

type Variant = "sidebar" | "topbar" | "action";

const TRIGGER_CLASS: Record<Variant, string> = {
  sidebar:
    "grid size-7 place-items-center rounded-hc-1 text-hc-muted hover:bg-hc-bg hover:text-hc-ink",
  topbar:
    "grid size-8 place-items-center rounded-full text-hc-muted hover:bg-hc-surface hover:text-hc-ink",
  // Sits inside `ProfileActions` next to share — matches that row's outlined
  // icon-button styling (see `ICON_BASE_CLASS` in profile-actions.tsx).
  action:
    "inline-flex shrink-0 items-center justify-center rounded-hc-2 border-hc border-hc-ink bg-transparent px-3 py-2 text-hc-ink transition-transform hover:bg-hc-ink hover:text-hc-brand dark:hover:bg-hc-brand dark:hover:text-hc-brand-ink",
};

export function SettingsButton({
  signOutAction,
  variant = "sidebar",
}: {
  signOutAction: () => Promise<void>;
  variant?: Variant;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="settings"
        title="settings"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={TRIGGER_CLASS[variant]}
      >
        <GearIcon size={variant === "topbar" ? 18 : 16} />
        {variant === "action" && <span className="sr-only">settings</span>}
      </button>

      {open && (
        <SettingsModal
          onClose={() => setOpen(false)}
          signOutAction={signOutAction}
        />
      )}
    </>
  );
}

function SettingsModal({
  onClose,
  signOutAction,
}: {
  onClose: () => void;
  signOutAction: () => Promise<void>;
}) {
  const { theme, setTheme } = useTheme();

  // Lock body scroll while open and listen for Esc — same pattern as AddSheet.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="settings"
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
    >
      <button
        type="button"
        aria-label="close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-hc-ink/40 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-90 rounded-hc-4 border-hc border-hc-line bg-hc-surface p-5 shadow-hc-lg">
        <div className="mb-4 flex items-baseline justify-between">
          <h2
            className="font-display text-xl font-extrabold text-hc-ink"
            style={{ letterSpacing: "-0.03em" }}
          >
            settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="font-mono text-hc-eyebrow font-semibold uppercase tracking-hc-eyebrow text-hc-muted hover:text-hc-ink"
          >
            close
          </button>
        </div>

        <Row label="theme" hint="picks up your system preference by default">
          <ThemeSegmented theme={theme} setTheme={setTheme} />
        </Row>

        <div className="my-4 h-px bg-hc-line" />

        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-between rounded-hc-2 border-hc border-hc-line-strong bg-hc-bg px-4 py-3 text-left transition-colors hover:bg-hc-surface-alt"
          >
            <span className="flex flex-col gap-0.5">
              <span className="font-sans text-sm font-bold text-hc-ink">
                sign out
              </span>
              <span className="font-mono text-hc-tiny text-hc-muted">
                ends this session
              </span>
            </span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="text-hc-muted"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-ink">
          {label}
        </span>
        {hint && (
          <span className="font-mono text-hc-tiny text-hc-muted">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function ThemeSegmented({
  theme,
  setTheme,
}: {
  theme: "light" | "dark";
  setTheme: (next: "light" | "dark") => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="theme"
      className="grid grid-cols-2 gap-1.5 rounded-hc-2 border-hc border-hc-line-strong bg-hc-bg p-1"
    >
      <ThemeOption
        selected={theme === "light"}
        onClick={() => setTheme("light")}
        label="light"
        icon={<SunIcon size={16} />}
      />
      <ThemeOption
        selected={theme === "dark"}
        onClick={() => setTheme("dark")}
        label="dark"
        icon={<MoonIcon size={16} />}
      />
    </div>
  );
}

function ThemeOption({
  selected,
  onClick,
  label,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-hc-1 px-3 py-2 font-sans text-hc-button font-bold transition-colors ${
        selected
          ? "bg-hc-ink text-hc-brand dark:bg-hc-brand dark:text-hc-brand-ink"
          : "text-hc-muted hover:bg-hc-surface hover:text-hc-ink"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function GearIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
