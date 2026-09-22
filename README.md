# Praxis - Chat-Based CDM

Praxis is a chat-based collaborative decision-making (CDM) app with support for video calling. Groups can transition smoothly between messaging, live conversation, and structured decision-making without breaking flow or losing context.

Designed for organizations, teams, and communities that need robust group decision-making capabilities, it combines the familiarity of chat and video calls with flexible decision-making tools, multiple voting models, and forum style organization when needed.

**Tech stack**:

- Rust v1.98.1
- Node v24.21.0
- React/Vite
- TypeScript
- PostgreSQL

Praxis is free and open source software, as specified by the GNU General Public License.

## Work in progress

You are entering a construction yard. Things are going to change and break regularly as the project is still getting off the ground. Your feedback is highly welcome.

## Installation

Use the Rust and Node versions listed above, PostgreSQL 16, and Redis 8.4. `rust-toolchain.toml` and `.nvmrc` pin the language runtimes. E2E tests and artifact builds require Docker with Compose and Buildx.

```bash
nvm use
npm ci
cp .env.example .env
```

Start PostgreSQL and Redis locally, then configure them in `.env`. Set `DB_MIGRATIONS=true` when migrations need to run. Replace `AUTH_TOKEN_SECRET` and `CHANNEL_KEY_MASTER`; generate each with `openssl rand -base64 32`. Keep `CHANNEL_KEY_MASTER` when reusing a database because it encrypts channel content.

## Running the app

Run the API and frontend in separate terminals:

```bash
# Rust API, http://localhost:3100
cargo run --bin praxis

# Vite frontend, http://localhost:3000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first account you register becomes the instance admin. Video calls are disabled by default; enable `VIDEO_CALLS_ENABLED=true` and configure a running LiveKit service to use them.

## Tests

### Playwright E2E

Playwright provides the broadest coverage of user flows across chat, calls, proposals, events, and notifications.

```bash
# Install Chromium once
npm run test:e2e:install

# Run all E2E tests
npm run test:e2e

# Run one spec
npm run test:e2e -- e2e/specs/02-chat.spec.ts

# Watch the tests run in the browser with headed mode
npm run test:e2e:headed
```

The runner builds current source and starts isolated PostgreSQL, Redis, and LiveKit containers. It resets the E2E stack before and after each run.

### Other tests

Vitest covers the frontend. Rust tests include API route tests in `api/tests/http_routes/`, which create temporary databases on local PostgreSQL. They require `psql`, database creation and deletion permissions, and Redis configured through `.env`.

```bash
# Frontend tests
npm run test

# All Rust tests
npm run test:rust

# Only API route integration tests
npm run test:api:integration
```

### Run everything

```bash
npm run test-all
```

This runs frontend, Rust, and E2E tests in sequence. All prerequisites above apply.

Run `npm run check` for TypeScript, ESLint, and dependency checks. Run `cargo fmt --all --check` and `cargo clippy --workspace --all-targets` for Rust.

## Building deployment artifacts

Production uses two tracked artifacts: the Linux x86_64 backend in `deploy/artifacts/linux-x86_64/` and the Vite frontend in `deploy/artifacts/frontend-dist/`.

```bash
# Rebuild both artifacts
npm run build:artifacts

# Or rebuild one
npm run build:rust
npm run build:frontend
```

Builds use the pinned Rust and Node images. The backend targets `linux/amd64`, including on ARM Macs. Each build updates the tracked artifact and its `.source-checksum`. Include those files in your release.

## Docker and deployment

The production Dockerfile verifies both source checksums before packaging the prebuilt backend and frontend. Missing or stale artifacts stop the build.

```bash
# Verify and build the production image locally
docker build --platform linux/amd64 --target production -t praxis:local .

# Build and start the configured production Compose stack
docker compose up -d --build
```

Production requires Linux x86_64 and a configured `.env`. Do not run `docker compose down --volumes`, since production data and uploads use named volumes.

Browse the [documentation index](docs/README.md) for deployment guidance and project background.

## Contributions

Praxis is open to contributions. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for more details.
