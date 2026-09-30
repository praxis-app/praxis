# Praxis Documentation

This directory contains tracked Praxis documentation. The current application
uses a Rust/Axum API and a React/Vite client built into one deployable
application.

The project root [README](../README.md) contains development prerequisites and test
entry points. The [CLI README](../cli/README.md) documents operational commands.

## Deployment

- [Production deployment](deployment/deployment.md) — the minimal Docker
  Compose deployment and update workflow.
- [Quick deployment reference](../DEPLOY.md) — the shortest supported path for
  the repository's prebuilt Linux artifact workflow.

## Product scope

- [Praxis Chat app proposal](project-proposals/praxis-chat-app-proposal.md) —
  the agreed original project proposal, intentionally preserved as written.

## Database schema

Schema docs are generated locally with [tbls](https://github.com/k1LoW/tbls)
from your running PostgreSQL database. They are written to `.docs/db/` at the
project root, which is git ignored, so regenerate them whenever the schema
changes or whenever you need them.

1. Install tbls with `brew install k1LoW/tap/tbls`.
2. Start PostgreSQL and apply all migrations.
3. Run `db:docs` with `DATABASE_URL` pointing at the database named by
   `DB_SCHEMA` in `.env`:

   ```bash
   DATABASE_URL="postgres://<USER_NAME>:<PASSWORD>@localhost:5432/<DB_SCHEMA>?sslmode=disable" \
   npm run db:docs
   ```

4. Open `.docs/db/README.md`, which links to a page for each table.

To check whether your local docs are out of date with the database, run
`npm run db:docs:check` with the same `DATABASE_URL`.
