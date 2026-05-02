# Implementation Notes

This file captures every decision and concern from the schema design conversation.
Read this before writing app code — most of the "gotchas" live here, not in the schema.

---

## 1. Hard Deletes Only

There are no soft-delete columns anywhere. When something is deleted, it's gone.

Foreign keys are configured `ON DELETE CASCADE` everywhere. The cascade chains are:

- **User deleted** → their habits, logs, follows (both directions), blocks (both directions),
  likes, comments, notifications (both as recipient and actor), and device_tokens all cascade.
- **Habit deleted** → its schedules, logs, and (transitively via logs) likes, comments, and
  notifications referencing those logs.
- **Habit log deleted** → its likes, comments, and notifications referencing it cascade.
- **Comment deleted** → notifications referencing it cascade.

**Implication:** social history is fragile. If user A comments on user B's log and B deletes
that log, A's comment disappears. This is the accepted tradeoff for "no soft deletes."

---

## 2. Enum Enforcement

All status/type fields are real Postgres `ENUM` types, not free-text varchars. This means
typos like `'suceeded'` will be rejected at the DB layer.

Enums in use:

| Type | Values |
|---|---|
| `frequency_type` | `daily`, `weekly`, `n_per_period` |
| `habit_status` | `active`, `succeeded`, `failed`, `abandoned` |
| `report_target_type` | `user`, `comment`, `habit_log` |
| `report_status` | `pending`, `reviewed`, `dismissed` |
| `notification_type` | `follow`, `like`, `comment` |
| `device_platform` | `ios`, `android`, `web` |

Adding a new enum value requires `ALTER TYPE ... ADD VALUE` in a migration. Don't forget.

---

## 3. Polymorphic Reports — Cleanup Job Required

`reports.target_id` has no foreign key constraint because `target_type` can be one of three
tables. This means a report can outlive its target (someone reports a comment, comment gets
deleted, report row now points to nothing).

**Required:** a periodic cleanup job that deletes reports whose target no longer exists.

```sql
-- Run hourly or daily
DELETE FROM reports r
WHERE (r.target_type = 'user'      AND NOT EXISTS (SELECT 1 FROM users      WHERE id = r.target_id))
   OR (r.target_type = 'comment'   AND NOT EXISTS (SELECT 1 FROM comments   WHERE id = r.target_id))
   OR (r.target_type = 'habit_log' AND NOT EXISTS (SELECT 1 FROM habit_logs WHERE id = r.target_id));
```

Also handle "target no longer exists" gracefully in the moderation UI — don't crash, just
show "(deleted)".

---

## 4. Username Changes & Mention Drift

Usernames can be changed (no DB constraint preventing it). However, `@mentions` in old
comments are stored as plain text inside `comments.content`. If a user changes their handle
from `@alice` to `@alicia`:

- Old comments still say `@alice`.
- They now point to either nobody (if `alice` is taken by no one) or to a different person
  (if someone else later claims `alice`).

**Options:**
1. **Disallow username changes.** Simplest. Recommended for v1.
2. **Allow changes, accept drift.** Old mentions might become wrong. Most apps accept this.
3. **Implement Discord-style ID-based mentions.** Render `@alice` from a stored user_id
   reference. Requires the `comment_mentions` table you explicitly chose to drop.

We chose option 2 by default. If you want to enforce option 1, add a CHECK or app-level guard.

### Mention Rendering

When rendering a comment, parse `@username` patterns client-side and look up users to render
as profile links. Suggested regex:

```
/(?:^|\s)@([a-zA-Z0-9_]{3,32})\b/g
```

Edge cases to handle: trailing punctuation (`@alice.`), email addresses
(`bob@example.com` should NOT match), and usernames that don't exist (render as plain text).

### Blocked Mentions

If user A blocks user B, and B mentions A in a comment: it's still in the text (it's just a
string), but **do not create a notification**. Enforce this at the comment-creation layer:

```python
mentioned_usernames = parse_mentions(content)
for username in mentioned_usernames:
    mentioned_user = lookup_user(username)
    if not mentioned_user: continue
    if is_blocked(blocker=mentioned_user, blocked=author): continue
    create_notification(user=mentioned_user, type='comment', ...)
```

Wait — note the schema has `notification_type` values `follow`, `like`, `comment`. There is
no `mention` type because mentions are part of the comment text and already trigger a
`comment` notification when the comment is created on someone's log. Mentions to users who
*aren't* the log owner do not currently produce notifications. If you want that, you need
to add a `mention` enum value and notify each mentioned user separately at comment creation.

---

## 5. Timezone Handling

All timestamps are stored as `TIMESTAMPTZ` (UTC). User-local conversion happens at query
time using `users.timezone` (an IANA timezone string like `America/Los_Angeles`).

This matters for:

- **Daily streak calculation.** A log at 11pm local time and one at 1am local time are on
  different days. Convert `completed_at` to user-local before grouping by date.
- **"Did they complete today?" checks.** Use the user's local "today," not UTC's.
- **Reminder times.** `habit_schedules.reminder_time` is stored as a naked `time` value;
  apply it in the user's timezone when scheduling.

Postgres example:

```sql
-- Get logs grouped by user-local date
SELECT date_trunc('day', completed_at AT TIME ZONE u.timezone)::date AS local_day,
       count(*)
FROM habit_logs hl
JOIN users u ON u.id = hl.user_id
WHERE hl.habit_id = $1
GROUP BY local_day;
```

---

## 6. Streak Computation (Computed, Not Stored)

There is no `streaks` table. Streaks are computed on read from `habit_logs`. The
`(habit_id, completed_at)` index makes this fast.

### Daily habits

Walk backward from today (in user-local TZ). For each consecutive day, check that at least
`target_count` logs exist. Stop at the first gap.

### Weekly habits

Group logs into ISO weeks (in user-local TZ). For each week starting from the current one
and going backward, check that at least `target_count` logs exist. Stop at the first week
that doesn't qualify.

### n_per_period habits

This isn't a traditional streak. Compute "current adherence" instead: count logs in the
last `period_days` days; if `count >= target_count`, the user is "on track." Display as
"4 of 5 in the last 10 days" rather than as a streak number.

If you want a streak-like number for n_per_period: count consecutive non-overlapping
periods where the target was met. That's a judgment call.

### Badges

Badges are computed-only — no separate table. To award "30-day streak," query the user's
current streak for each habit and check thresholds. If badges should be persistent
(e.g., "user earned this on date X, even if streak later breaks"), add a `user_badges`
table later — explicitly out of scope for v1.

---

## 7. Challenge Habits

A habit is a challenge if `start_date` and `end_date` are non-null.

### Lifecycle

| State | Trigger | Effect |
|---|---|---|
| `active` | initial | accepts logs |
| `succeeded` | end_date passed AND logs ≥ required_completions | locked, no new logs |
| `failed` | end_date passed AND logs < required_completions | locked, no new logs |
| `abandoned` | user taps "give up" | locked, no new logs |

Enforce "no new logs when status ≠ active" at the **app layer**, not the DB. Reason:
the DB doesn't know about challenge state transitions, and adding triggers complicates
testing.

### Restart Flow

User taps "restart":
1. Set `start_date = today`.
2. Set `end_date = today + duration`.
3. Set `status = 'active'`.
4. Old logs from `habit_logs` **stay**. They are pre-`start_date` and ignored by streak
   and success queries (which filter by `completed_at >= start_date`).

### Auto-Evaluation Job

A daily job should find habits where `status = 'active'` and `end_date < today`, count
logs in the window, and update status to `succeeded` or `failed`.

```sql
UPDATE habits
SET status = CASE
  WHEN (SELECT count(*) FROM habit_logs
        WHERE habit_id = habits.id
          AND completed_at >= habits.start_date
          AND completed_at <  habits.end_date + interval '1 day')
        >= COALESCE(required_completions, /* derive from frequency */ 0)
  THEN 'succeeded'::habit_status
  ELSE 'failed'::habit_status
END
WHERE status = 'active'
  AND end_date IS NOT NULL
  AND end_date < (now() AT TIME ZONE 'UTC')::date;
```

(The `required_completions` derivation when null is left to app code — depends on
frequency_type and the date range.)

### Failing Early

Optional: if it's mathematically impossible to hit `required_completions` in the
remaining days, flip status to `failed` immediately. Pure app logic, no schema impact.

---

## 8. Privacy Model

You chose: **no private accounts, but private habits are allowed.**

Rules:
- `habits.is_public = false` → habit is hidden from everyone except the owner.
- All `habit_logs` for a private habit are also effectively private.
- All `likes` and `comments` on logs of private habits should be inaccessible to
  non-owners.

Enforce at every read query:

```sql
-- Feed query example
SELECT hl.* FROM habit_logs hl
JOIN habits h ON h.id = hl.habit_id
WHERE h.is_public = true
  AND hl.user_id IN (SELECT following_id FROM follows WHERE follower_id = $current_user)
  AND NOT EXISTS (SELECT 1 FROM blocks
                  WHERE (blocker_id = $current_user AND blocked_id = hl.user_id)
                     OR (blocker_id = hl.user_id   AND blocked_id = $current_user));
```

---

## 9. Block Semantics

When user A blocks user B (`blocks` row with blocker_id=A, blocked_id=B):

- **Feeds:** A doesn't see B's logs. B doesn't see A's logs.
- **Profiles:** A's profile is hidden from B and vice versa (or shows "blocked" state).
- **Follows:** Existing follow relationships in either direction should be removed at
  block time. New follow attempts are rejected.
- **Likes/comments:** B cannot like or comment on A's logs (and vice versa). Existing
  likes/comments remain in the DB but should be filtered from view.
- **Mentions:** `@A` in a comment by B does not generate a notification (see §4).
- **Reports:** Blocking does not delete prior reports.

All of this is **app-layer enforcement**. The DB only stores the block fact.

---

## 10. Notification Cascade Behavior

When a like is deleted (user unliked), the corresponding notification cascades away.
Same for comments. This is the desired behavior — "Alice liked your post" should
disappear if Alice unlikes.

**Caveat:** if a user reads a notification and then the underlying like is removed,
the notification vanishes from their notification list mid-session. Acceptable.

---

## 11. Push Notifications

`device_tokens` stores APNs (iOS), FCM (Android), and web push subscription tokens.

### Token Lifecycle

- On app open / login: client sends current token to server, upserts into `device_tokens`.
- On logout: client deletes its token.
- On token refresh (Apple/Google rotate these): client sends new token, server replaces
  old.
- Periodic cleanup: delete tokens where `last_used_at` is older than ~60 days, or where
  Apple/Google returned a "token invalid" response.

### Sending a Push

When a notification is created:
1. Insert into `notifications` (in-app record).
2. Look up all `device_tokens` for the recipient.
3. Send to each platform's push service with the token.
4. On "invalid token" response from APNs/FCM, delete that token from `device_tokens`.

### Token PK

The PK is `token` itself (no surrogate ID), since tokens are globally unique. A user
can have multiple tokens (multiple devices); a token belongs to exactly one user at a
time. If a user logs out and another logs in on the same device, the old token row is
overwritten via `INSERT ... ON CONFLICT (token) DO UPDATE SET user_id = excluded.user_id`.

---

## 12. Rate Limiting

The schema does not enforce rate limits. Implement at the app layer for:

- **Comments:** ~5/min per user, ~30/hour.
- **Likes:** ~30/min per user.
- **Follows:** ~20/min, ~200/hour.
- **Reports:** ~5/hour per user (high enough to flag abuse, low enough to prevent
  weaponization).
- **Habit creation:** ~20/hour per user.
- **Habit logs:** Less critical, but ~100/hour is a reasonable ceiling.

Use Redis or an in-memory rate limiter. Numbers are starting points — tune in production.

---

## 13. Mention Notifications (Open Question)

Currently, mentions are plain text and produce **no separate notification**. The only
notification a mentioned user might receive is the `comment` notification sent to the
log owner — and they'd only get it if they own the log.

If you want mentioned users (who don't own the log) to be notified:
1. Add `'mention'` to the `notification_type` enum.
2. On comment create, parse `@mentions`, look them up, and create a `mention`
   notification per non-owner mentioned user.
3. Respect blocks (don't notify if author is blocked by mentioned user).

Decision: **deferred**. Add when it becomes a UX gap.

---

## 14. Things Explicitly NOT in This Schema

- Soft deletes (chosen against)
- Categories / tags (chosen against)
- Comment editing (chosen against — no `updated_at` on comments)
- Mention join table (chosen against — `@` is plain text)
- Streaks table (chosen against — computed on read)
- Habit templates (chosen against — fully self-determined)
- Achievements/badges table (chosen against — computed only)
- Private accounts (chosen against)
- Reminder details column (chosen against)
- `count` on habit logs (chosen against — multiple events = multiple rows)

If any of these come back into scope, they're additive and won't break existing data.

> **Note on auth tables.** Earlier drafts of this list excluded
> `sessions` and `verification_tokens`. We've since had to add them — see
> §16 — because `@auth/prisma-adapter` requires them with the database
> session strategy.

---

## 15. Quick Reference: Cascade Map

```
users
 ├── habits (CASCADE)
 │    ├── habit_schedules (CASCADE)
 │    └── habit_logs (CASCADE)
 │         ├── likes (CASCADE)
 │         ├── comments (CASCADE)
 │         │    └── notifications.comment_id (CASCADE)
 │         └── notifications.habit_log_id (CASCADE)
 ├── habit_logs (CASCADE — direct, since user_id is on logs too)
 ├── follows.follower_id  / follows.following_id (CASCADE)
 ├── blocks.blocker_id   / blocks.blocked_id   (CASCADE)
 ├── likes.user_id (CASCADE)
 ├── comments.user_id (CASCADE)
 ├── reports.reporter_id (CASCADE)
 ├── notifications.user_id  (CASCADE)
 ├── notifications.actor_id (CASCADE)
 └── device_tokens.user_id (CASCADE)

reports.target_id — NO FK, polymorphic, cleanup job required
```

---

## 16. Auth Model (Discord-only) and the `username` Onboarding Indicator

The "design docs are canonical" rule has one carve-out: anything required by
`@auth/prisma-adapter` to make NextAuth work. Everything below is part of
that carve-out.

### Identity vs handle

- **`users.discord_id`** — Discord OAuth subject. Set during the provider's
  `profile()` callback in `src/server/auth/config.ts`, so the very first
  INSERT done by `PrismaAdapter.createUser` already has it. NOT NULL UNIQUE.
  Auth-only — never displayed in UI.
- **`users.username`** — user-chosen public handle. **Nullable.** Stays
  NULL until the user picks one through `/create-account`. We do **not**
  derive it from the Discord profile.

### `username IS NULL` is the onboarding indicator

This is the single source of truth for "has the user finished onboarding?":

- `session?.user && username === null` → user is authenticated but has no
  handle yet. They can only access `/create-account`. Every other
  authenticated route redirects them there.
- `session?.user && username !== null` → fully onboarded. They cannot
  re-enter `/create-account` (it redirects to `/feed`).

There is no separate `onboarded` boolean — the username's existence is the
flag. Don't add one; you'd have to keep two things in sync.

### Auth-required tables and fields

The following exist purely because the Prisma adapter needs them. They are
not in the original DBML draft and should be treated as infrastructure, not
domain data:

| Item | Reason |
| --- | --- |
| `accounts` | OAuth provider tokens; provider+account_id unique |
| `sessions` | DB session strategy (we're not using JWT) |
| `verification_tokens` | Adapter requires the table even though Discord-only OAuth never writes to it |
| `users.name` | NextAuth shell field; populated from Discord |
| `users.email` | NextAuth shell field; populated from Discord |
| `users.email_verified` | NextAuth shell field; unused for OAuth-only |
| `users.image` (Prisma name; column is `avatar_url`) | NextAuth shell field |

### Cascades for auth tables

`accounts.user_id`, `sessions.user_id` → `users.id` ON DELETE CASCADE. A
hard-delete of a user wipes their auth artifacts along with everything
else (matches the broader cascade doctrine in §1).

### Why NOT JWT sessions

We could drop `sessions` and `verification_tokens` by switching to
`session: { strategy: "jwt" }`. We didn't, because:
- DB sessions let you revoke from the server (delete the row).
- DB sessions let you query "who is logged in right now" trivially.
- The cost is two extra tables and one extra round-trip per auth check.

Revisit if write volume becomes a concern.
