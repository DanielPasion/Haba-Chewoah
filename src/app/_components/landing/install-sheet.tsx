"use client";

import { useEffect } from "react";

import { type Platform } from "./use-install-prompt";

function ShareIcon({ size = 22 }: { size?: number }) {
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
      <path d="M12 3v13" />
      <path d="M7 8l5-5 5 5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

function PlusSquareIcon({ size = 22 }: { size?: number }) {
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
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function MoreIcon({ size = 22 }: { size?: number }) {
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
      <circle cx="6" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function CloseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
  );
}

type Step = {
  icon: React.ReactNode;
  text: React.ReactNode;
};

function getSteps(platform: Platform): Step[] {
  if (platform === "android") {
    return [
      {
        icon: <MoreIcon />,
        text: (
          <>
            tap the <strong className="text-hc-ink">menu</strong> icon in chrome
          </>
        ),
      },
      {
        icon: <PlusSquareIcon />,
        text: (
          <>
            choose{" "}
            <strong className="text-hc-ink">install app</strong> or{" "}
            <strong className="text-hc-ink">add to home screen</strong>
          </>
        ),
      },
    ];
  }
  return [
    {
      icon: <ShareIcon />,
      text: (
        <>
          tap the <strong className="text-hc-ink">share</strong> icon in safari
        </>
      ),
    },
    {
      icon: <PlusSquareIcon />,
      text: (
        <>
          scroll and choose{" "}
          <strong className="text-hc-ink">add to home screen</strong>
        </>
      ),
    },
  ];
}

export function InstallSheet({
  open,
  onClose,
  platform,
}: {
  open: boolean;
  onClose: () => void;
  platform: Platform;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const steps = getSteps(platform);
  const heading =
    platform === "android"
      ? "install on android"
      : "install on iphone";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="install instructions"
    >
      <button
        type="button"
        aria-label="close"
        onClick={onClose}
        className="absolute inset-0 bg-hc-ink/40 backdrop-blur-sm"
      />
      <div
        className="relative m-3 w-full max-w-[420px] rounded-hc-4 border-[1.5px] border-hc-ink bg-hc-surface p-5 shadow-hc-stamp"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-hc-muted">
              add to home screen
            </div>
            <h2 className="mt-1 font-display text-[22px] font-extrabold leading-tight tracking-[-0.03em] text-hc-ink">
              {heading}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-[1.5px] border-hc-ink bg-hc-bg text-hc-ink transition-transform hover:-translate-y-[1px]"
          >
            <CloseIcon />
          </button>
        </div>

        <ol className="mt-5 flex flex-col gap-3">
          {steps.map((step, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-hc-3 border border-hc-line-strong bg-hc-bg p-3"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-hc-2 border-[1.5px] border-hc-ink bg-hc-surface text-hc-ink">
                {step.icon}
              </span>
              <span className="flex flex-1 items-center gap-2 text-[14px] leading-snug text-hc-muted">
                <span className="font-mono text-[11px] font-bold text-hc-ink">
                  {i + 1}.
                </span>
                <span>{step.text}</span>
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-hc-muted">
          opens like a native app · no app store
        </p>
      </div>
    </div>
  );
}
