# Habit Tracking App — Database Package

A social habit-tracking app with challenges, follows, likes, comments,
and push notifications. Auth is Discord OAuth only.

## Folder Contents

```
habit-app/
├── README.md            ← you are here
├── schema.dbml          ← canonical schema (paste into dbdiagram.io to visualize)
├── NOTES.md             ← every design decision and gotcha — READ THIS
└── migrations/
    └── 001_init.sql     ← Postgres migration with enums, FKs, CHECK constraints
```

## Quick Facts

- **11 tables.** users, habits, habit_schedules, habit_logs, follows, blocks,
  reports, likes, comments, notifications, device_tokens.
- **Postgres-targeted.** Uses real `ENUM` types, `uuid`, `TIMESTAMPTZ`,
  and `gen_random_uuid()` from pgcrypto.
- **Hard deletes only.** All FKs cascade. No `deleted_at` columns.
- **All timestamps in UTC.** Convert to user-local using `users.timezone` at query time.

## Read Order for Implementation

1. **`NOTES.md`** — covers cascades, enum enforcement, polymorphic reports cleanup,
   timezone handling, streak computation, challenge lifecycle, privacy rules,
   block semantics, push notification flow, rate limits, mention rendering, and
   every "gotcha" from the design conversation.
2. **`schema.dbml`** — quick visual reference; paste into https://dbdiagram.io/.
3. **`migrations/001_init.sql`** — the actual SQL to run.

## Open Decisions Flagged in NOTES.md

These are intentional v1 deferrals — revisit when the product needs them:

- Whether to disallow username changes (avoids `@mention` drift in old comments).
- Whether to add a `mention` notification type for mentioned non-log-owners.
- Whether to award persistent badges (currently computed-only).

## Required Background Jobs

The schema relies on app code (not DB triggers) for these:

- **Orphaned reports cleanup** — periodic job, deletes `reports` rows whose
  polymorphic `target_id` no longer exists. Suggested cadence: hourly.
- **Challenge auto-evaluation** — daily job, flips `habits.status` from `active`
  to `succeeded`/`failed` when `end_date` passes.
- **Stale device tokens cleanup** — periodic job, deletes `device_tokens` whose
  `last_used_at` is older than ~60 days, or that received "invalid" responses
  from APNs/FCM. Suggested cadence: daily.
- **Orphan habit-log media cleanup** — periodic job, lists R2 keys under
  `habit-logs/` and deletes any that don't appear in `habit_logs.media_url`.
  See NOTES.md §17. Suggested cadence: weekly.

## Required App-Layer Enforcement

The DB stores facts; the app enforces policy:

- Block semantics (filter feeds, prevent likes/comments/follows across blocks).
- Privacy (filter out logs of private habits from non-owners).
- Challenge state (reject log inserts when `habits.status != 'active'`).
- Rate limits (comments, follows, likes, reports, habit creation).
- Mention parsing & notification (plain-text `@` parsing on render and on
  comment create).
- Push delivery (look up `device_tokens`, send via APNs/FCM, prune invalid tokens).

## Building from Here

If you're handing this to Claude Code: start with `NOTES.md` for context,
then run `migrations/001_init.sql` against a fresh Postgres database, then
build the API endpoints. The notes file enumerates every cross-cutting
concern (timezone, cascades, blocks, privacy) so the API layer can implement
them consistently.
