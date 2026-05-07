import Link from "next/link";

import { Avatar } from "~/components/avatar";
import { HabitIcon } from "~/components/habit-icon";
import { RelativeTime } from "~/components/relative-time";
import { buttonClass } from "~/components/ui";
import {
  buildHeatmap,
  computeHabitStats,
  type HeatmapCell,
  localYmd,
} from "~/lib/habit-stats";

import type {
  FrequencyType,
  HabitStatus,
  MediaType,
} from "../../../../../generated/prisma";

import { ChewOutButton } from "./chewout-button";
import { LogDayButton } from "./log-day-button";

export type HabitDetailData = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  frequencyType: FrequencyType;
  targetCount: number;
  periodDays: number | null;
  isPublic: boolean;
  status: HabitStatus;
  startDate: Date | null;
  createdAt: Date;
  owner: {
    id: string;
    username: string;
    displayName: string;
    imageUrl: string | null;
    timezone: string;
  };
};

export type RecentLog = {
  id: string;
  completedAt: Date;
  notes: string | null;
  mediaUrl: string | null;
  mediaType: MediaType | null;
  likeCount: number;
  commentCount: number;
  dayNumber: number;
};

export function HabitDetailView({
  habit,
  isOwn,
  logs,
  logIdByDay = {},
  recentLogs,
}: {
  habit: HabitDetailData;
  isOwn: boolean;
  logs: Array<{ completedAt: Date }>;
  logIdByDay?: Record<string, string>;
  recentLogs: RecentLog[];
}) {
  const stats = computeHabitStats({
    logs,
    timezone: habit.owner.timezone,
    startDate: habit.startDate ?? habit.createdAt,
    frequencyType: habit.frequencyType,
    targetCount: habit.targetCount,
    periodDays: habit.periodDays,
  });
  const heatmap = buildHeatmap({
    dayCounts: stats.dayCounts,
    timezone: habit.owner.timezone,
  });
  const completionPct = Math.round(stats.completion * 100);
  const nextDay = stats.currentStreak + 1;

  return (
    <div className="-mx-5 -my-6 flex flex-col gap-6 pb-2 md:-mx-8 md:-my-8 md:gap-7">
      <Header habitName={habit.name} habitId={habit.id} isOwn={isOwn} />

      <div className="mx-auto flex w-full max-w-180 flex-col gap-5 px-5 md:px-8 md:gap-6">
        <HeroCard habit={habit} stats={stats} isOwn={isOwn} />
        <ActionRow habit={habit} isOwn={isOwn} nextDayNumber={nextDay} />
        <StatsRow
          completionPct={completionPct}
          longest={stats.longestStreak}
          current={stats.currentStreak}
          total={stats.totalLogs}
        />
        <Heatmap
          cells={heatmap}
          totalLogs={stats.totalLogs}
          logIdByDay={logIdByDay}
          todayYmd={localYmd(new Date(), habit.owner.timezone)}
        />
        {habit.description && <DescriptionCard description={habit.description} />}
        {!isOwn && <OwnerCard owner={habit.owner} />}
        <RecentLogs logs={recentLogs} habitIcon={habit.icon} />
      </div>
    </div>
  );
}

function Header({
  habitName,
  habitId,
  isOwn,
}: {
  habitName: string;
  habitId: string;
  isOwn: boolean;
}) {
  return (
    <header className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 flex items-center gap-3 border-b border-hc-line bg-hc-bg/85 px-5 py-3 backdrop-blur md:top-0 md:px-8 md:py-4">
      <Link
        href="/profile"
        aria-label="back to profile"
        className="grid size-9 shrink-0 place-items-center rounded-full text-hc-ink hover:bg-hc-surface"
      >
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
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </Link>
      <h1
        className="min-w-0 flex-1 truncate font-display text-base font-extrabold text-hc-ink"
        style={{ letterSpacing: "-0.03em" }}
      >
        {habitName}
      </h1>
      {isOwn && (
        <Link
          href={`/habit/${habitId}/edit`}
          aria-label="edit habit"
          className="grid size-9 shrink-0 place-items-center rounded-full text-hc-ink hover:bg-hc-surface"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </Link>
      )}
    </header>
  );
}

function HeroCard({
  habit,
  stats,
  isOwn,
}: {
  habit: HabitDetailData;
  stats: ReturnType<typeof computeHabitStats>;
  isOwn: boolean;
}) {
  const dayCount = stats.currentStreak;
  const hasStreak = dayCount > 0;
  const sinceDate = habit.startDate ?? habit.createdAt;

  return (
    <section className="flex flex-col gap-5 rounded-hc-4 border border-hc-line bg-hc-surface p-6 md:p-8">
      <div className="flex items-start gap-4">
        <HabitIcon value={habit.icon} size={56} emphasis="strong" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
            {frequencyLabel(habit)} · {habit.isPublic ? "public" : "private"}
          </p>
          <h1
            className="mt-1 font-display text-2xl font-extrabold leading-tight text-hc-ink md:text-3xl"
            style={{ letterSpacing: "-0.04em" }}
          >
            {habit.name}
          </h1>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-hc-line pt-5">
        <div>
          <p className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
            current streak
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className="font-display text-7xl font-extrabold leading-[0.85] text-hc-ink tabular-nums md:text-8xl"
              style={{ letterSpacing: "-0.06em" }}
            >
              {dayCount}
            </span>
            <span
              className="font-display text-2xl font-extrabold text-hc-muted"
              style={{ letterSpacing: "-0.03em" }}
            >
              {dayCount === 1 ? "day" : "days"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
            since
          </p>
          <p className="mt-1 font-display text-base font-extrabold text-hc-ink" style={{ letterSpacing: "-0.02em" }}>
            {formatSince(sinceDate)}
          </p>
          {!hasStreak && (
            <p className="mt-1 font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
              {isOwn ? "log day 1 to start" : "no streak yet"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function formatSince(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function frequencyLabel(habit: HabitDetailData) {
  if (habit.frequencyType === "daily") return "daily";
  if (habit.frequencyType === "weekly") {
    return `${habit.targetCount}× / week`;
  }
  return `${habit.targetCount}× / ${habit.periodDays ?? 7} days`;
}

function StatsRow({
  completionPct,
  longest,
  current,
  total,
}: {
  completionPct: number;
  longest: number;
  current: number;
  total: number;
}) {
  const stats = [
    { value: `${completionPct}%`, label: "completion" },
    { value: longest.toString(), label: "longest" },
    { value: current.toString(), label: "current" },
    { value: total.toString(), label: "total" },
  ];
  return (
    <div className="grid grid-cols-4 overflow-hidden rounded-hc-3 border border-hc-line bg-hc-surface">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`flex flex-col items-center gap-1 px-2 py-4 text-center ${
            i < stats.length - 1 ? "border-r border-hc-line" : ""
          }`}
        >
          <span
            className="font-display text-xl font-extrabold leading-none text-hc-ink tabular-nums"
            style={{ letterSpacing: "-0.04em" }}
          >
            {s.value}
          </span>
          <span className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function Heatmap({
  cells,
  totalLogs,
  logIdByDay,
  todayYmd,
}: {
  cells: HeatmapCell[][];
  totalLogs: number;
  logIdByDay: Record<string, string>;
  todayYmd: string;
}) {
  // Calendar-style flow: each row is one week, days flow left-to-right
  // (Sun → Sat). buildHeatmap returns cells[w][d] where w = week index
  // (oldest first) and d = day-of-week (0=Sun..6=Sat) — so we render the
  // outer array as rows and the inner as columns.
  const firstYmd = cells[0]?.[0]?.ymd ?? null;
  const lastRow = cells[cells.length - 1];
  const lastYmd = lastRow?.[lastRow.length - 1]?.ymd ?? null;
  const rangeLabel =
    firstYmd && lastYmd
      ? `${formatRangePart(firstYmd)} — ${formatRangePart(lastYmd)}`
      : null;

  // Month label per row: the first cell whose month differs from the row
  // above gets the abbreviation. Keeps the left rail readable without
  // crowding every row.
  const monthMarkers = cells.map((row, idx) => {
    const firstCell = row[0];
    if (!firstCell) return null;
    const monthIdx = monthOf(firstCell.ymd);
    const prevMonth =
      idx === 0 ? null : monthOf(cells[idx - 1]![0]!.ymd);
    if (idx === 0 || monthIdx !== prevMonth) {
      return MONTH_NAMES[monthIdx];
    }
    return null;
  });

  const dayLabels = ["s", "m", "t", "w", "t", "f", "s"];

  return (
    <section>
      <div className="mb-1 flex items-baseline justify-between">
        <h2
          className="font-display text-base font-extrabold text-hc-ink"
          style={{ letterSpacing: "-0.03em" }}
        >
          last 8 weeks
        </h2>
        <span className="font-mono text-hc-tiny font-medium text-hc-muted">
          {totalLogs === 0 ? "no logs yet" : `${totalLogs} logs total`}
        </span>
      </div>
      {rangeLabel && (
        <p className="mb-3 font-mono text-hc-tiny font-medium text-hc-muted">
          {rangeLabel} · oldest on top, this week on the bottom
        </p>
      )}

      <div className="rounded-hc-3 border border-hc-line bg-hc-surface p-4">
        {/* Day-of-week header: Sun → Sat, aligned over the 7 day columns. */}
        <div className="mb-1.5 flex gap-1.5">
          <span aria-hidden className="w-8 shrink-0" />
          <div className="grid flex-1 grid-cols-7 gap-1.5">
            {dayLabels.map((d, i) => (
              <span
                key={i}
                aria-hidden
                className="text-center font-mono text-hc-tiny font-medium leading-none text-hc-muted"
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          {cells.map((row, w) => (
            <div key={w} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="w-8 shrink-0 font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow-narrow text-hc-muted"
              >
                {monthMarkers[w] ?? ""}
              </span>
              <div className="grid flex-1 grid-cols-7 gap-1.5">
                {row.map((cell) => (
                  <HeatmapSquare
                    key={cell.ymd}
                    cell={cell}
                    logId={logIdByDay[cell.ymd] ?? null}
                    isToday={cell.ymd === todayYmd}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-hc-line pt-3 font-mono text-hc-tiny font-medium text-hc-muted">
          <div className="flex flex-wrap items-center gap-3">
            <Legend className="bg-hc-ink dark:bg-hc-brand">logged</Legend>
            <Legend className="bg-hc-line">missed</Legend>
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-2.5 rounded-sm bg-hc-line ring-2 ring-hc-accent ring-offset-1 ring-offset-hc-surface"
              />
              today
            </span>
          </div>
          <span className="font-sans text-xs italic text-hc-muted">
            tap a logged day to open it
          </span>
        </div>
      </div>
    </section>
  );
}

function HeatmapSquare({
  cell,
  logId,
  isToday,
}: {
  cell: HeatmapCell;
  logId: string | null;
  isToday: boolean;
}) {
  const done = cell.count > 0;
  const isMulti = cell.count > 1;
  const title = `${formatTitleDate(cell.ymd)}${isToday ? " · today" : ""} · ${cell.count} log${cell.count === 1 ? "" : "s"}`;
  const baseClass = `relative aspect-square rounded-sm ${done ? "bg-hc-ink dark:bg-hc-brand" : "bg-hc-line"} ${isToday ? "ring-2 ring-hc-accent ring-offset-1 ring-offset-hc-surface" : ""}`;
  // Cells with multiple logs render the count inside so readers don't
  // need to hover/long-press to learn a day was unusually productive.
  const countBadge = isMulti ? (
    <span
      aria-hidden
      className="absolute inset-0 grid place-items-center font-display text-[9px] font-extrabold leading-none text-hc-bg dark:text-hc-brand-ink"
    >
      {cell.count}
    </span>
  ) : null;
  if (logId) {
    return (
      <Link
        href={`/habit-log/${logId}`}
        title={title}
        aria-label={title}
        className={`${baseClass} block transition-transform hover:scale-110`}
      >
        {countBadge}
      </Link>
    );
  }
  return (
    <span title={title} className={baseClass} aria-hidden>
      {countBadge}
    </span>
  );
}

function Legend({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2.5 rounded-sm ${className}`} aria-hidden />
      {children}
    </span>
  );
}

const MONTH_NAMES = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

function monthOf(ymd: string) {
  // ymd is "YYYY-MM-DD" — month is at chars 5..7 (1-indexed). Subtract 1
  // to get a JS-style month index.
  return Number.parseInt(ymd.slice(5, 7), 10) - 1;
}

function formatRangePart(ymd: string) {
  const month = MONTH_NAMES[monthOf(ymd)];
  const day = Number.parseInt(ymd.slice(8, 10), 10);
  return `${month} ${day}`;
}

const TITLE_FMT = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

function formatTitleDate(ymd: string) {
  // `T12:00:00Z` keeps the date stable regardless of viewer timezone
  // (matches buildHeatmap's parsing strategy).
  const d = new Date(`${ymd}T12:00:00Z`);
  return TITLE_FMT.format(d).toLowerCase();
}

function DescriptionCard({ description }: { description: string }) {
  return (
    <section className="rounded-hc-3 border border-hc-line bg-hc-surface p-5">
      <p className="mb-2 font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
        the rule
      </p>
      <p className="text-[15px] leading-relaxed text-hc-ink">{description}</p>
    </section>
  );
}

function OwnerCard({ owner }: { owner: HabitDetailData["owner"] }) {
  return (
    <section className="flex items-center gap-3 rounded-hc-3 border border-hc-line bg-hc-surface p-4">
      <Avatar
        imageUrl={owner.imageUrl}
        name={owner.displayName}
        fallbackName={owner.username}
        size={44}
        alt={`${owner.displayName} avatar`}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-sm font-bold text-hc-ink">
          {owner.displayName}
        </p>
        <p className="truncate font-mono text-hc-meta font-medium text-hc-muted">
          @{owner.username}
        </p>
      </div>
      <Link
        href={`/profile/${owner.username}`}
        className={buttonClass({ variant: "secondary", size: "sm" })}
      >
        view profile
      </Link>
    </section>
  );
}

function RecentLogs({
  logs,
  habitIcon,
}: {
  logs: RecentLog[];
  habitIcon: string | null;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2
          className="font-display text-base font-extrabold text-hc-ink"
          style={{ letterSpacing: "-0.03em" }}
        >
          recent logs
        </h2>
        <span className="font-mono text-hc-tiny font-medium text-hc-muted">
          {logs.length === 0
            ? "none yet"
            : `${logs.length} log${logs.length === 1 ? "" : "s"}`}
        </span>
      </div>
      {logs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-hc-3 border border-dashed border-hc-line-strong bg-hc-surface-alt px-6 py-10 text-center">
          <p className="font-display text-base font-extrabold text-hc-ink">
            no logs yet
          </p>
          <p className="max-w-xs text-sm text-hc-muted">
            tap the button above to log your first day.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {logs.map((l) => (
            <li key={l.id}>
              <Link
                href={`/habit-log/${l.id}`}
                className="flex items-center gap-3 rounded-hc-2 border border-hc-line bg-hc-surface p-3 transition-colors hover:bg-hc-surface-alt"
              >
                {l.mediaUrl && l.mediaType === "photo" ? (
                  <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-hc-2 bg-hc-ink">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={l.mediaUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  </span>
                ) : l.mediaUrl && l.mediaType === "video" ? (
                  <span className="grid size-12 shrink-0 place-items-center rounded-hc-2 bg-hc-ink text-hc-bg">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                ) : (
                  <HabitIcon value={habitIcon} size={48} />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-extrabold text-hc-ink">
                      day {l.dayNumber}
                    </span>
                    <RelativeTime
                      date={l.completedAt}
                      className="font-mono text-hc-tiny font-medium text-hc-muted"
                    />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-hc-muted">
                    {l.notes ?? "no note"}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 font-mono text-hc-tiny font-semibold text-hc-muted">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {l.likeCount}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * Inline action row that sits directly under the hero so the primary
 * affordance (log today's day) is one tap away — no scroll, no thumb-stretch
 * to a sticky bottom bar.
 */
function ActionRow({
  habit,
  isOwn,
  nextDayNumber,
}: {
  habit: HabitDetailData;
  isOwn: boolean;
  nextDayNumber: number;
}) {
  return (
    <div className="flex gap-2">
      {isOwn ? (
        habit.status === "active" ? (
          <LogDayButton
            habitId={habit.id}
            habitName={habit.name}
            habitIcon={habit.icon}
            nextDayNumber={nextDayNumber}
          />
        ) : (
          <span className="grid flex-1 cursor-not-allowed place-items-center rounded-hc-3 border border-hc-line bg-hc-surface-alt px-4 py-4 font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-muted">
            {habit.status} · no new logs
          </span>
        )
      ) : habit.status === "active" ? (
        <>
          <ChewOutButton
            habitId={habit.id}
            recipientHandle={habit.owner.username}
          />
          <Link
            href={`/profile/${habit.owner.username}`}
            aria-label={`view @${habit.owner.username}`}
            className="grid place-items-center rounded-hc-3 border border-hc-line bg-hc-surface px-4 py-4 text-hc-ink hover:bg-hc-surface-alt"
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
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
            </svg>
          </Link>
        </>
      ) : (
        <Link
          href={`/profile/${habit.owner.username}`}
          className="flex-1 rounded-hc-3 border border-hc-line bg-hc-surface px-4 py-4 text-center font-display text-base font-extrabold text-hc-ink transition-colors hover:bg-hc-surface-alt"
          style={{ letterSpacing: "-0.02em" }}
        >
          view @{habit.owner.username}
        </Link>
      )}
    </div>
  );
}
