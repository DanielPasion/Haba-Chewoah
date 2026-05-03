"use client";

import { useState } from "react";

import { ProfileEmptyTab } from "./profile-empty-tab";

type TabId = "habits" | "logs";

const TABS: { id: TabId; label: string; count: number; emptyHint: string }[] = [
  {
    id: "habits",
    label: "habits",
    count: 0,
    emptyHint: "no habits yet — habits will live here once you start tracking.",
  },
  {
    id: "logs",
    label: "logs",
    count: 0,
    emptyHint: "no logs yet — every check-in you post shows up here.",
  },
];

export function ProfileTabs({ isOwn }: { isOwn: boolean }) {
  const [tab, setTab] = useState<TabId>("habits");
  const active = TABS.find((t) => t.id === tab) ?? TABS[0]!;

  return (
    <div>
      <div
        role="tablist"
        className="flex gap-1 border-b border-hc-line px-1"
      >
        {TABS.map((t) => {
          const sel = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={sel}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-1.5 px-3.5 py-3 font-sans text-sm font-bold transition-colors ${
                sel ? "text-hc-ink" : "text-hc-muted hover:text-hc-ink"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-px font-mono text-hc-eyebrow font-bold ${
                  sel
                    ? "bg-hc-brand text-hc-brand-ink"
                    : "bg-hc-line-strong text-hc-muted"
                }`}
              >
                {t.count}
              </span>
              {sel && (
                <span className="absolute inset-x-2 -bottom-px h-hc-tabline rounded-sm bg-hc-ink" />
              )}
            </button>
          );
        })}
      </div>

      <ProfileEmptyTab
        kind={active.id}
        hint={active.emptyHint}
        isOwn={isOwn}
      />
    </div>
  );
}
