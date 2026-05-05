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
    const tz = habit.user.timezone;
    const localNow = getLocalParts(now, tz);
    const todayYmd = localNow.ymd;
    const todayUtc = ymdAsUtcDate(todayYmd);
    const tomorrowUtc = new Date(todayUtc);
    tomorrowUtc.setUTCDate(tomorrowUtc.getUTCDate() + 1);

    // Pull a 48h window of logs for this habit so we can answer "logged
    // today?" and feed the streak calculator. Cheaper than a full history
    // pull and matches the right-rail's approach.
    const recentLogsCutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const recentLogs = await db.habitLog.findMany({
      where: { habitId: habit.id, completedAt: { gte: recentLogsCutoff } },
      select: { completedAt: true },
    });
    const loggedToday = recentLogs.some(
      (l) => localYmd(l.completedAt, tz) === todayYmd,
    );

    // ────────────────────────────────────────────────
    // Reminder
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
        const already = await db.notification.findFirst({
          where: {
            userId: habit.userId,
            habitId: habit.id,
            type: NotificationType.reminder,
            createdAt: { gte: todayUtc, lt: tomorrowUtc },
          },
          select: { id: true },
        });
        if (!already) {
          await createNotification({
            recipientId: habit.userId,
            type: NotificationType.reminder,
            habitId: habit.id,
            pushTitle: `time to log "${habit.name}"`,
            pushBody: "tap to mark today done",
            pushUrl: `/habit/${habit.id}`,
          });
          result.reminders += 1;
        }
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
      // streak ≥ 1 means yesterday counted — i.e. there's something to
      // lose if today goes unlogged.
      if (stats.currentStreak >= 1) {
        const already = await db.notification.findFirst({
          where: {
            userId: habit.userId,
            habitId: habit.id,
            type: NotificationType.streak_at_risk,
            createdAt: { gte: todayUtc, lt: tomorrowUtc },
          },
          select: { id: true },
        });
        if (!already) {
          await createNotification({
            recipientId: habit.userId,
            type: NotificationType.streak_at_risk,
            habitId: habit.id,
            pushTitle: `${stats.currentStreak}-day streak at risk`,
            pushBody: `log "${habit.name}" before midnight to keep it alive`,
            pushUrl: `/habit/${habit.id}`,
          });
          result.streakAtRisk += 1;
        }
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
        // Dedup at the milestone level — if we ever notified for THIS
        // habit at THIS threshold (forever, not just today), don't again.
        // A user who breaks and re-hits day-30 still gets one celebratory
        // ping, just not one per re-hit on the same day.
        const already = await db.notification.findFirst({
          where: {
            userId: habit.userId,
            habitId: habit.id,
            type: NotificationType.streak_milestone,
            // The simplest dedup is "already fired today" — milestones
            // only sit on a single calendar day so that's enough; if the
            // user hits 30 again next year, they get notified again.
            createdAt: { gte: todayUtc, lt: tomorrowUtc },
          },
          select: { id: true },
        });
        if (!already) {
          await createNotification({
            recipientId: habit.userId,
            type: NotificationType.streak_milestone,
            habitId: habit.id,
            pushTitle: `${stats.currentStreak} days on "${habit.name}" ✦`,
            pushBody: "milestone hit · keep going",
            pushUrl: `/habit/${habit.id}`,
          });
          result.milestones += 1;
        }
      }
    }
  }

  // ────────────────────────────────────────────────
  // Habit-succeeded — fires for habits whose status just flipped (or any
  // status='succeeded' that hasn't been acknowledged yet). NOTES.md §7
  // describes the auto-eval job that flips status; we read its output
  // and notify. If that job hasn't run yet, this loop is a cheap no-op.
  // ────────────────────────────────────────────────
  const succeededHabits = await db.habit.findMany({
    where: { status: "succeeded" },
    select: {
      id: true,
      name: true,
      userId: true,
      updatedAt: true,
      user: { select: { username: true } },
    },
  });
  for (const habit of succeededHabits) {
    const already = await db.notification.findFirst({
      where: {
        userId: habit.userId,
        habitId: habit.id,
        type: NotificationType.habit_succeeded,
      },
      select: { id: true },
    });
    if (already) continue;
    await createNotification({
      recipientId: habit.userId,
      type: NotificationType.habit_succeeded,
      habitId: habit.id,
      pushTitle: `you finished "${habit.name}" 🏁`,
      pushBody: "challenge complete — bet won",
      pushUrl: `/habit/${habit.id}`,
    });
    result.succeeded += 1;
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

function ymdAsUtcDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y!, (m ?? 1) - 1, d!, 0, 0, 0));
}

/** Reads a Postgres `time` value (Prisma returns it as a 1970-01-01 Date)
 * and returns minutes past midnight. */
function extractTimeMinutes(time: Date): number {
  return time.getUTCHours() * 60 + time.getUTCMinutes();
}
