-- ============================================================
-- Habit Tracking App — Initial Migration (Postgres)
-- ============================================================
-- Conventions:
--   - GUIDs use uuid type with gen_random_uuid() default
--   - Enums are real Postgres types where the value set is closed
--   - All FKs are ON DELETE CASCADE unless explicitly noted
--   - Timestamps are stored as TIMESTAMPTZ (always UTC)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE frequency_type AS ENUM ('daily', 'weekly', 'n_per_period');
CREATE TYPE habit_status AS ENUM ('active', 'succeeded', 'failed', 'abandoned');
CREATE TYPE report_target_type AS ENUM ('user', 'comment', 'habit_log');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'dismissed');
CREATE TYPE notification_type AS ENUM ('follow', 'like', 'comment');
CREATE TYPE device_platform AS ENUM ('ios', 'android', 'web');

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id     varchar NOT NULL UNIQUE,
  username       varchar NOT NULL UNIQUE,
  bio            text,
  avatar_url     varchar,
  timezone       varchar NOT NULL DEFAULT 'UTC',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz,

  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,32}$')
);

CREATE INDEX users_discord_id_idx ON users (discord_id);
CREATE INDEX users_username_idx   ON users (username);

-- ============================================================
-- HABITS
-- ============================================================

CREATE TABLE habits (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                  varchar NOT NULL,
  description           text,
  icon                  varchar,
  color                 varchar,

  frequency_type        frequency_type NOT NULL,
  target_count          int NOT NULL DEFAULT 1 CHECK (target_count > 0),
  period_days           int CHECK (period_days IS NULL OR period_days > 0),

  -- Challenge fields
  start_date            date,
  end_date              date,
  required_completions  int CHECK (required_completions IS NULL OR required_completions > 0),
  status                habit_status NOT NULL DEFAULT 'active',

  is_public             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz,

  -- n_per_period must specify period_days
  CONSTRAINT n_per_period_has_period CHECK (
    (frequency_type <> 'n_per_period') OR (period_days IS NOT NULL)
  ),
  -- Challenge consistency: end_date >= start_date when both set
  CONSTRAINT challenge_dates_sane CHECK (
    end_date IS NULL OR start_date IS NULL OR end_date >= start_date
  )
);

CREATE INDEX habits_user_id_idx        ON habits (user_id);
CREATE INDEX habits_user_id_status_idx ON habits (user_id, status);

-- ============================================================
-- HABIT SCHEDULES
-- ============================================================

CREATE TABLE habit_schedules (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id          uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  day_of_week       int CHECK (day_of_week BETWEEN 0 AND 6),
  reminder_time     time,
  reminder_enabled  boolean NOT NULL DEFAULT true
);

CREATE INDEX habit_schedules_habit_id_idx ON habit_schedules (habit_id);

-- ============================================================
-- HABIT LOGS
-- ============================================================

CREATE TABLE habit_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id      uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  completed_at  timestamptz NOT NULL,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX habit_logs_habit_id_idx              ON habit_logs (habit_id);
CREATE INDEX habit_logs_user_id_idx               ON habit_logs (user_id);
CREATE INDEX habit_logs_user_completed_at_idx     ON habit_logs (user_id, completed_at);
CREATE INDEX habit_logs_habit_completed_at_idx    ON habit_logs (habit_id, completed_at);

-- ============================================================
-- SOCIAL: FOLLOWS
-- ============================================================

CREATE TABLE follows (
  follower_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX follows_following_id_idx ON follows (following_id);

-- ============================================================
-- SOCIAL: BLOCKS
-- ============================================================

CREATE TABLE blocks (
  blocker_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT no_self_block CHECK (blocker_id <> blocked_id)
);

CREATE INDEX blocks_blocked_id_idx ON blocks (blocked_id);

-- ============================================================
-- SOCIAL: REPORTS
-- Polymorphic target — no FK on target_id, cleanup handled by job.
-- ============================================================

CREATE TABLE reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type  report_target_type NOT NULL,
  target_id    uuid NOT NULL,
  reason       varchar NOT NULL,
  status       report_status NOT NULL DEFAULT 'pending',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX reports_target_idx  ON reports (target_type, target_id);
CREATE INDEX reports_status_idx  ON reports (status);

-- ============================================================
-- SOCIAL: LIKES
-- ============================================================

CREATE TABLE likes (
  user_id        uuid NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  habit_log_id   uuid NOT NULL REFERENCES habit_logs(id) ON DELETE CASCADE,
  created_at     timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, habit_log_id)
);

CREATE INDEX likes_habit_log_id_idx ON likes (habit_log_id);

-- ============================================================
-- SOCIAL: COMMENTS
-- ============================================================

CREATE TABLE comments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  habit_log_id  uuid NOT NULL REFERENCES habit_logs(id) ON DELETE CASCADE,
  content       text NOT NULL CHECK (length(content) BETWEEN 1 AND 2000),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX comments_habit_log_id_idx ON comments (habit_log_id);
CREATE INDEX comments_user_id_idx      ON comments (user_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id      uuid REFERENCES users(id) ON DELETE CASCADE,
  type          notification_type NOT NULL,
  habit_log_id  uuid REFERENCES habit_logs(id) ON DELETE CASCADE,
  comment_id    uuid REFERENCES comments(id)   ON DELETE CASCADE,
  is_read       boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_unread_idx  ON notifications (user_id, is_read);
CREATE INDEX notifications_user_created_idx ON notifications (user_id, created_at DESC);

-- ============================================================
-- DEVICE TOKENS (push)
-- ============================================================

CREATE TABLE device_tokens (
  token         varchar PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform      device_platform NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_used_at  timestamptz
);

CREATE INDEX device_tokens_user_id_idx ON device_tokens (user_id);
