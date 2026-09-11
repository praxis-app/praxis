# Praxis Live CLI

Read-only developer and operations utilities for Praxis Live. The CLI can inspect decision activity, print database schema details, and list the Axum route surface without starting the API server.

## Quick start

```bash
# From the repo root. DB commands use DATABASE_URL or DB_* vars from .env.
npm run cli -- poll-stats --days 14

# Or run the binary directly.
cd cli && cargo run -- poll-stats --channel-id d2f7...
```

Database commands derive their PostgreSQL connection string from `DATABASE_URL`, or from `DB_USERNAME`, `DB_PASSWORD`, `DB_SCHEMA`, `DB_HOST`, and `DB_PORT`. Those commands set `SET default_transaction_read_only = on` for the session. Source-inspection commands such as `routes` do not connect to the database.

## Current subcommands

### Activity

- `poll-stats` – poll/proposal stats with vote breakdown, day-by-day creation trend, and top channels.

Useful flags include `--days <int>`, `--server-id <uuid>`, `--channel-id <uuid>`, `--poll-id <uuid>`, `--top-polls <int>`, and `--top-channels <int>`.

### Database

- `schema` – prints the current database schema including tables, columns with data types, indexes, constraints, and enums.

### Source Inspection

- `routes` – prints Axum API routes extracted from `api/src/**/routes.rs` and `api/src/lib.rs`, including handler names. Supports `--path <substring>` and `--tree`.

## Future commands

The CLI is designed to expand with additional utilities for:

- `integrity-check` – detect orphaned images, invalid foreign keys, polls missing config/action, impossible vote states
- `activity-heatmap` – ASCII day x hour heatmap for messages, polls, and votes
- `channel-activity` – per-channel totals, unique participants, vote/message ratio, fastest-growing channels
- `code-hotspots` – largest services/components, TODO/FIXME density, complexity heuristics
- `db-activity` – active PostgreSQL sessions, query runtime, wait events, blocked state
- `db-backup` – trigger a DB backup, list recent backups, restore
- `db-locks` – blocker -> blocked tree, lock types, blocked durations, relation/query context
- `decision-funnel` – stage conversion rates (voting -> ratified/closed/revision) and median time-to-ratify
- `env-check` – inspect config and environment variables (for "works on my machine")
- `image-backlog` – stale upload placeholders by type, oldest placeholders, affected channels/polls
- `logs` – view and filter application logs with custom views
- `permission-audit` – who has `manage` scope, roles with no members, overlapping grants, unexpected effective powers
- `route-guards` – static check for write endpoints missing auth/permission middleware

## Environment variables

- `DATABASE_URL` – full PostgreSQL connection string.
- `DB_USERNAME`, `DB_PASSWORD`, `DB_SCHEMA`, `DB_HOST`, `DB_PORT` – same variables used by the rest of the Praxis Live stack when `DATABASE_URL` is not set.

## Sample invocations

```bash
# Highlight stats for a single decision room/channel
npm run cli -- poll-stats --channel-id 8a7...

# Deep dive into a single poll's vote mix
cd cli && cargo run -- poll-stats --poll-id 4bb...

# Bigger window with more leaders
npm run cli -- poll-stats --days 90 --top-channels 10

# Print database schema
npm run cli -- schema

# List routes, or focus on one route family
npm run cli -- routes
npm run cli -- routes --path /api/servers --tree
```

The CLI stays out of the primary workflow; running it is entirely optional but provides quick operational awareness during incident reviews and development tasks.
