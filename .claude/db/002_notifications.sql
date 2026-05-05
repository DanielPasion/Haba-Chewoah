-- ============================================================
-- Migration 002 — Notifications: extra types, chewouts, push subs
-- ============================================================
-- Adds:
--   - mention / chewout / reminder / streak_at_risk / streak_milestone /
--     habit_succeeded values to notification_type
--   - notifications.habit_id (for habit-scoped system notifs)
--   - chewouts table (cooldown-enforced "chew out your friend")
--   - push_subscriptions table (Web Push / VAPID)
-- ============================================================

-- Enum extensions ------------------------------------------------------------
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'mention';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'chewout';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'reminder';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'streak_at_risk';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'streak_milestone';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'habit_succeeded';

-- notifications.habit_id ----------------------------------------------------
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS habit_id uuid REFERENCES habits(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS notifications_user_type_habit_idx
  ON notifications (user_id, type, habit_id, created_at);

-- Chewouts ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chewouts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     uuid NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  recipient_id  uuid NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  habit_id      uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  day           date NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT no_self_chewout CHECK (sender_id <> recipient_id),
  UNIQUE (sender_id, recipient_id, habit_id, day)
);

CREATE INDEX IF NOT EXISTS chewouts_recipient_day_idx ON chewouts (recipient_id, day);

-- Push subscriptions (Web Push / VAPID) -------------------------------------
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint      text NOT NULL UNIQUE,
  p256dh        text NOT NULL,
  auth          text NOT NULL,
  user_agent    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_used_at  timestamptz
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON push_subscriptions (user_id);
