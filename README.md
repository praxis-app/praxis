# Praxis Live - Chat-Based CDM

Praxis Live is a chat-based collaborative decision-making (CDM) app with support for video calling. Groups can transition smoothly between messaging, live conversation, and structured decision-making without breaking flow or losing context.

Designed for organizations, teams, and communities that need robust group decision-making capabilities, it combines the familiarity of chat and video calls with flexible decision-making tools, multiple voting models, and forum style organization when needed.

**Tech Stack**:

- Rust v1.97.0
- Node v24.18.0
- React/Vite
- TypeScript
- PostgreSQL

Praxis is free and open source software, as specified by the GNU General Public License.

## Work in progress

You are entering a construction yard. Things are going to change and break regularly as the project is still getting off the ground. Your feedback is highly welcome.

Please note that this is also an experimental approach within the Praxis project. The main repository is located at https://github.com/praxis-app/praxis.

## Integration tests

The Rust API route integration tests live in `api/tests/http_routes/` and use a real local Postgres server with temporary per-test databases. They assume Postgres is already running locally and create/drop temporary databases inside that existing server during the test run.

Recommended commands:

- `npm run test:api:integration`
- `cargo test -p api --test http_routes`

These commands intentionally run only the `http_routes` integration-test target.

## CLI

The project includes a Rust-based CLI tool for both development and production operations.

```bash
# Example: view poll and proposal stats
npm run cli -- poll-stats --days 14

# Example: print database schema
npm run cli -- schema
```

See the [CLI README](cli/README.md) for full documentation.
