import "server-only";

import { createNotification } from "~/server/notifications";
import { db } from "~/server/db";
import { computeHabitStats, localYmd } from "~/lib/habit-stats";

import { NotificationType } from "../../../generated/prisma";

// Streak thresholds — fire `streak_milestone` once when current streak hits
// any of these. Add aspirational ones (200, 365) so power users get pinged
// occasionally; they cost nothing to compute.
const MILESTONES = [7, 14, 30, 50, 100, 200, 365];

// Streak-at-risk fires only when the user is "late in the day" — defined as
// hour-of-day ≥ 20 in their local tz. Earlier than that and a "you haven't
// logged yet" ping is just noise.
const AT_RISK_HOUR = 20;

export type CronRunResult = {
  ranAt: string;
  reminders: number;
  streakAtRisk: number;
  milestones: number;
  succeeded: number;
};

/**
 * Scans every active habit and fires the system notifications that aren't
 * triggered by user action — habit reminders, streak-at-risk warnings,
 * milestone celebrations, and habit-succeeded acks.
 *
 * Designed to run every 15 minutes (idempotent — dedup happens via
 * "already fired this type for this habit today" lookups in `notifications`).
 * One slow query per habit is acceptable at our scale; revisit when habit
 * count crosses ~10k active.
 */
export async function runNotificationsCron(): Promise<CronRunResult> {
  const now = new Date();
  const result: CronRunResult = {
    ranAt: now.toISOString(),
    reminders: 0,
    streakAtRisk: 0,
    milestones: 0,
    succeeded: 0,
  };

  const activeHabits = await db.habit.findMany({
    where: { status: "active" },
    select: {
      id: true,
      name: true,
      icon: true,
      userId: true,
      frequencyType: true,
      targetCount: true,
      periodDays: true,
      startDate: true,
      createdAt: true,
      user: { select: { id: true, username: true, timezone: true } },
      schedules: {
        where: { reminderEnabled: true },
        select: { id: true, dayOfWeek: true, reminderTime: true },
      },
    },
  });

  for (const habit of activeHabits) {
    // Per-iteration try/catch: a single throw (bad timezone string,
    // transient DB hiccup, push provider error) must not halt the entire
    // cron run. Failures are logged and the loop moves to the next habit.
    try {
      const tz = habit.user.timezone;
      const localNow = getLocalParts(now, tz);
      const todayYmd = localNow.ymd;

      // Pull a 48h window of logs for this habit so we can answer "logged
      // today?" and feed the streak calculator. Cheaper than a full
      // history pull and matches the right-rail's approach.
      const recentLogsCutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      const recentLogs = await db.habitLog.findMany({
        where: { habitId: habit.id, completedAt: { gte: recentLogsCutoff } },
        select: { completedAt: true },
      });
      const loggedToday = recentLogs.some(
        (l) => localYmd(l.completedAt, tz) === todayYmd,
      );

      // ────────────────────────────────────────────────
      // Reminder — `createNotification` writes localDay; the unique
      // (userId, habitId, type, localDay) catches concurrent cron-run
      // races and short-circuits as idempotent success.
      // ────────────────────────────────────────────────
      if (!loggedToday && habit.schedules.length > 0) {
        const reminderHit = habit.schedules.some((s) => {
          if (s.dayOfWeek != null && s.dayOfWeek !== localNow.dayOfWeek) {
            return false;
          }
          if (!s.reminderTime) return false;
          const target = extractTimeMinutes(s.reminderTime);
          const cur = localNow.hour * 60 + localNow.minute;
          // ±10 min — pairs with a 15-min cron cadence so every reminder
          // fires once even with mild scheduler jitter.
          return Math.abs(cur - target) <= 10;
        });
        if (reminderHit) {
          const res = await createNotification({
            recipientId: habit.userId,
            type: NotificationType.reminder,
            habitId: habit.id,
            localDayYmd: todayYmd,
            pushTitle: `time to log "${habit.name}"`,
            pushBody: "tap to mark today done",
            pushUrl: `/habit/${habit.id}`,
          });
          if (res.created) result.reminders += 1;
        }
      }

      // ────────────────────────────────────────────────
      // Streak-at-risk
      // ────────────────────────────────────────────────
      if (!loggedToday && localNow.hour >= AT_RISK_HOUR) {
        const stats = computeHabitStats({
          logs: recentLogs,
          timezone: tz,
          startDate: habit.startDate ?? habit.createdAt,
          frequencyType: habit.frequencyType,
          targetCount: habit.targetCount,
          periodDays: habit.periodDays,
        });
        if (stats.currentStreak >= 1) {
          const res = await createNotification({
            recipientId: habit.userId,
            type: NotificationType.streak_at_risk,
            habitId: habit.id,
            localDayYmd: todayYmd,
            pushTitle: `${stats.currentStreak}-day streak at risk`,
            pushBody: `log "${habit.name}" before midnight to keep it alive`,
            pushUrl: `/habit/${habit.id}`,
          });
          if (res.created) result.streakAtRisk += 1;
        }
      }

      // ────────────────────────────────────────────────
      // Milestone (current streak crossed a threshold today)
      // ────────────────────────────────────────────────
      if (loggedToday) {
        const stats = computeHabitStats({
          logs: recentLogs,
          timezone: tz,
          startDate: habit.startDate ?? habit.createdAt,
          frequencyType: habit.frequencyType,
          targetCount: habit.targetCount,
          periodDays: habit.periodDays,
        });
        if (MILESTONES.includes(stats.currentStreak)) {
          // Dedup is per-local-day: a milestone day spans one calendar
          // date. If the user breaks streak and re-hits day-30 next year,
          // a *different* localDay value lets the unique pass through and
          // we re-notify — intentional.
          const res = await createNotification({
            recipientId: habit.userId,
            type: NotificationType.streak_milestone,
            habitId: habit.id,
            localDayYmd: todayYmd,
            pushTitle: `${stats.currentStreak} days on "${habit.name}" ✦`,
            pushBody: "milestone hit · keep going",
            pushUrl: `/habit/${habit.id}`,
          });
          if (res.created) result.milestones += 1;
        }
      }
    } catch (err) {
      // Common causes: invalid `users.timezone` (RangeError from
      // `Intl.DateTimeFormat`), transient Neon disconnect, push provider
      // refusing the payload. Log enough to debug, then carry on so the
      // next habit gets its notification.
      console.warn("[cron] habit failed", {
        habitId: habit.id,
        userId: habit.userId,
        err,
      });
    }
  }

  // ────────────────────────────────────────────────
  // Habit-succeeded — fires for habits whose status flipped to succeeded
  // *recently*. The status-flip happens in the daily auto-eval job from
  // NOTES.md §7, so a 48h `updatedAt` window catches every newly-succeeded
  // habit even if the cron has been down for a while, without scanning
  // every succeeded habit ever (which grows forever).
  // ────────────────────────────────────────────────
  const succeededRecencyCutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const succeededHabits = await db.habit.findMany({
    where: { status: "succeeded", updatedAt: { gte: succeededRecencyCutoff } },
    select: {
      id: true,
      name: true,
      userId: true,
      updatedAt: true,
      user: { select: { username: true } },
    },
  });
  for (const habit of succeededHabits) {
    try {
      // habit_succeeded fires exactly once per habit. We use a fixed
      // `localDay` of the habit's `updatedAt` so re-runs land on the same
      // unique key and dedup naturally. (The user's timezone doesn't
      // matter here — there's no streak day to anchor to; we just need a
      // stable per-habit value.)
      const ymd = habit.updatedAt.toISOString().slice(0, 10);
      const res = await createNotification({
        recipientId: habit.userId,
        type: NotificationType.habit_succeeded,
        habitId: habit.id,
        localDayYmd: ymd,
        pushTitle: `you finished "${habit.name}" 🏁`,
        pushBody: "challenge complete — bet won",
        pushUrl: `/habit/${habit.id}`,
      });
      if (res.created) result.succeeded += 1;
    } catch (err) {
      console.warn("[cron] succeeded fanout failed", {
        habitId: habit.id,
        err,
      });
    }
  }

  return result;
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

/** Returns the local YMD plus hour/minute/dow in the given IANA timezone. */
function getLocalParts(date: Date, timezone: string): {
  ymd: string;
  hour: number;
  minute: number;
  dayOfWeek: number;
} {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) {
    if (p.type !== "literal") parts[p.type] = p.value;
  }
  const ymd = `${parts.year}-${parts.month}-${parts.day}`;
  // `hour` can come back as "24" in en-CA at midnight — normalize to 0.
  const hour = (parseInt(parts.hour ?? "0", 10) || 0) % 24;
  const minute = parseInt(parts.minute ?? "0", 10) || 0;
  const dayOfWeek = WEEKDAY_TO_INDEX[parts.weekday ?? "Sun"] ?? 0;
  return { ymd, hour, minute, dayOfWeek };
}

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Reads a Postgres `time` value (Prisma returns it as a 1970-01-01 Date)
 * and returns minutes past midnight. */
function extractTimeMinutes(time: Date): number {
  return time.getUTCHours() * 60 + time.getUTCMinutes();
}
