-- ============================================================
-- Migration 003 — notifications.local_day + dedup unique
-- ============================================================
-- Adds the `local_day` column that cron-fired notifications stamp with the
-- recipient's local YMD, plus a unique constraint on
-- (user_id, habit_id, type, local_day) so concurrent cron runs can't
-- produce duplicate reminders/streak/milestone/habit_succeeded fires.
--
-- NULL local_day means "user-action notification" (like/comment/mention/
-- follow/chewout). Postgres treats NULLs as distinct, so the unique
-- doesn't constrain those rows.
-- ============================================================

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS local_day date;

-- Drop any prior constraint with the same name so re-runs are idempotent.
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_user_id_habit_id_type_local_day_key;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_user_id_habit_id_type_local_day_key
  UNIQUE (user_id, habit_id, type, local_day);
