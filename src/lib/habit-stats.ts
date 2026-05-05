// Streak + heatmap computation. All inputs use UTC `completedAt` timestamps;
// callers must pass the user's IANA timezone so we group by *local* days
// (per .claude/db/NOTES.md §5). The implementation walks the day list
// without relying on Date arithmetic — using `Intl.DateTimeFormat` for the
// year/month/day extraction is the only way to handle DST cleanly without
// pulling in a dep.

import type { FrequencyType } from "../../generated/prisma";

export type LogTimestamp = { completedAt: Date };

export type HabitStats = {
  totalLogs: number;
  currentStreak: number;
  longestStreak: number;
  /** "Day N" label for the most recent log relative to the current streak. */
  currentDay: number;
  /** 0..1 — completion of the period applicable to this habit. */
  completion: number;
  /** Map of `YYYY-MM-DD` (local) → number of logs that day. */
  dayCounts: Map<string, number>;
};

const ymdFmtCache = new Map<string, Intl.DateTimeFormat>();
function ymdFmt(timezone: string) {
  let f = ymdFmtCache.get(timezone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    ymdFmtCache.set(timezone, f);
  }
  return f;
}

export function localYmd(date: Date, timezone: string): string {
  // en-CA's locale formats as `YYYY-MM-DD` natively — no manual padding.
  return ymdFmt(timezone).format(date);
}

function ymdAddDays(ymd: string, delta: number): string {
  // Build a noon UTC instant for the input date so the +/- delta math
  // never crosses a DST boundary (we're working with calendar dates only).
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, (m ?? 1) - 1, d!, 12, 0, 0));
  dt.setUTCDate(dt.getUTCDate() + delta);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function buildDayCounts(
  logs: LogTimestamp[],
  timezone: string,
): Map<string, number> {
  const out = new Map<string, number>();
  for (const log of logs) {
    const key = localYmd(log.completedAt, timezone);
    out.set(key, (out.get(key) ?? 0) + 1);
  }
  return out;
}

// Daily semantics: "current streak" = consecutive local days ending today
// (or yesterday if no log today yet) with at least one log.
function currentDailyStreak(
  dayCounts: Map<string, number>,
  todayYmd: string,
): number {
  let cursor = todayYmd;
  if ((dayCounts.get(cursor) ?? 0) === 0) {
    // Allow grace: if today has no log yet but yesterday does, the streak
    // is alive — they just haven't logged today. Mockup matches this UX.
    cursor = ymdAddDays(cursor, -1);
    if ((dayCounts.get(cursor) ?? 0) === 0) return 0;
  }
  let streak = 0;
  while ((dayCounts.get(cursor) ?? 0) > 0) {
    streak += 1;
    cursor = ymdAddDays(cursor, -1);
  }
  return streak;
}

function longestDailyStreak(dayCounts: Map<string, number>): number {
  if (dayCounts.size === 0) return 0;
  const days = Array.from(dayCounts.keys()).sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    if (days[i] === ymdAddDays(days[i - 1]!, 1)) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }
  return best;
}

export function computeHabitStats({
  logs,
  timezone,
  startDate,
  // We currently treat all frequencies with daily-streak semantics for the
  // surface stats — weekly + n_per_period get a real adherence calc once
  // the UI separates "streak" from "in-period progress" (NOTES.md §6).
  frequencyType: _frequencyType,
  targetCount: _targetCount,
  periodDays: _periodDays,
}: {
  logs: LogTimestamp[];
  timezone: string;
  startDate: Date | null;
  frequencyType: FrequencyType;
  targetCount: number;
  periodDays: number | null;
}): HabitStats {
  const dayCounts = buildDayCounts(logs, timezone);
  const today = localYmd(new Date(), timezone);
  const currentStreak = currentDailyStreak(dayCounts, today);
  const longestStreak = longestDailyStreak(dayCounts);
  const totalLogs = logs.length;

  let completion = 0;
  if (startDate) {
    const startYmd = localYmd(startDate, timezone);
    // Inclusive day count from start → today.
    let cursor = startYmd;
    let daysSinceStart = 0;
    while (cursor <= today) {
      daysSinceStart += 1;
      cursor = ymdAddDays(cursor, 1);
      if (daysSinceStart > 3650) break; // safety on bad data
    }
    if (daysSinceStart > 0) {
      const distinctDaysWithLogs = dayCounts.size;
      completion = Math.min(1, distinctDaysWithLogs / daysSinceStart);
    }
  }

  return {
    totalLogs,
    currentStreak,
    longestStreak,
    currentDay: currentStreak,
    completion,
    dayCounts,
  };
}

export type HeatmapCell = {
  ymd: string;
  count: number;
  isFuture: boolean;
};

// Builds an 8-week (56-day) grid ending today, oriented as week columns
// (Sun..Sat rows) so the UI can render it as a simple grid of squares.
export function buildHeatmap({
  dayCounts,
  timezone,
  weeks = 8,
}: {
  dayCounts: Map<string, number>;
  timezone: string;
  weeks?: number;
}): HeatmapCell[][] {
  const today = localYmd(new Date(), timezone);
  // Find this week's Saturday (the rightmost cell in the most-recent column).
  const todayDate = new Date(`${today}T12:00:00Z`);
  const dow = todayDate.getUTCDay(); // 0=Sun..6=Sat
  const daysToSat = 6 - dow;
  const lastDayYmd = ymdAddDays(today, daysToSat);

  const totalDays = weeks * 7;
  const firstDayYmd = ymdAddDays(lastDayYmd, -(totalDays - 1));

  const columns: HeatmapCell[][] = [];
  let cursor = firstDayYmd;
  for (let w = 0; w < weeks; w += 1) {
    const col: HeatmapCell[] = [];
    for (let d = 0; d < 7; d += 1) {
      col.push({
        ymd: cursor,
        count: dayCounts.get(cursor) ?? 0,
        isFuture: cursor > today,
      });
      cursor = ymdAddDays(cursor, 1);
    }
    columns.push(col);
  }
  return columns;
}

// "Day N" relative to the current run of consecutive local days containing
// `logCompletedAt`. Used on log detail headers + feed cards.
export function dayNumberForLog({
  logCompletedAt,
  dayCounts,
  timezone,
}: {
  logCompletedAt: Date;
  dayCounts: Map<string, number>;
  timezone: string;
}): number {
  const ymd = localYmd(logCompletedAt, timezone);
  let cursor = ymd;
  let day = 0;
  while ((dayCounts.get(cursor) ?? 0) > 0) {
    day += 1;
    cursor = ymdAddDays(cursor, -1);
  }
  return day;
}
