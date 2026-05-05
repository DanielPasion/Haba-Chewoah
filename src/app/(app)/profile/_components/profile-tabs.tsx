"use client";

import Link from "next/link";
import { useState } from "react";

import { buttonClass } from "~/components/ui";

import { HabitCard, type HabitCardData } from "../../habit/_components/habit-card";
import { ProfileEmptyTab } from "./profile-empty-tab";
import { ProfileLogRow } from "./profile-log-row";

type TabId = "habits" | "logs";

/**
 * Profile tabs — habits + recent logs for the user being viewed. The page
 * loader is responsible for filtering to public-only when `isOwn` is false,
 * so this component just renders whatever it's handed.
 */
export function ProfileTabs({
  isOwn,
  habits,
  logs,
}: {
  isOwn: boolean;
  habits: HabitCardData[];
  logs: ProfileLogRow[];
}) {
  const [tab, setTab] = useState<TabId>("habits");

  const tabs: {
    id: TabId;
    label: string;
    count: number;
    emptyHint: string;
  }[] = [
    {
      id: "habits",
      label: "habits",
      count: habits.length,
      emptyHint: isOwn
        ? "no habits yet — start one and it'll live here."
        : "no public habits yet — they only appear once they go live.",
    },
    {
      id: "logs",
      label: "logs",
      count: logs.length,
      emptyHint: isOwn
        ? "no logs yet — every check-in you post shows up here."
        : "no public logs yet — they appear once they're shared.",
    },
  ];

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-hc-line px-1">
        {tabs.map((t) => {
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

      {tab === "habits" ? (
        habits.length === 0 ? (
          <ProfileEmptyTab
            kind="habits"
            hint={tabs[0]!.emptyHint}
            isOwn={isOwn}
            cta={
              isOwn ? (
                <Link
                  href="/habit/new"
                  className={buttonClass({ variant: "primary", size: "md" })}
                >
                  start a new habit
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 px-1 py-5 md:px-0 md:py-6 lg:grid-cols-3">
            {habits.map((h) => (
              <HabitCard key={h.id} habit={h} />
            ))}
          </div>
        )
      ) : logs.length === 0 ? (
        <ProfileEmptyTab
          kind="logs"
          hint={tabs[1]!.emptyHint}
          isOwn={isOwn}
        />
      ) : (
        <div className="flex flex-col gap-3 px-1 py-5 md:px-0 md:py-6">
          {logs.map((l) => (
            <ProfileLogRow key={l.id} log={l} isOwn={isOwn} />
          ))}
        </div>
      )}
    </div>
  );
}
