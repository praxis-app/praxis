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

Use Rust **1.98.1**, Node **24.21.0**, PostgreSQL **16**, and Redis **8.4**. The frontend uses React, TypeScript, and Vite. `rust-toolchain.toml` selects the Rust version through rustup. E2E tests and artifact builds require Docker with Compose and Buildx.

```bash
# Select Node with nvm, if installed
nvm use

# Install dependencies and create local configuration
npm ci
cp .env.example .env
```

Start PostgreSQL and Redis locally. Configure `DB_*` for an existing development database, add `REDIS_HOST=localhost`, and match the Redis port and password in `.env`. Set `DB_MIGRATIONS=true` to apply migrations at startup.

Replace `AUTH_TOKEN_SECRET` and `CHANNEL_KEY_MASTER` with separate keys. Generate each with `openssl rand -base64 32`; `CHANNEL_KEY_MASTER` must decode to 32 bytes. Keep that key when reusing a database, since it encrypts channel content.

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
# Install Chromium once, and again after Playwright upgrades
npm run test:e2e:install

# Run all E2E tests
npm run test:e2e

# Run one spec
npm run test:e2e -- e2e/specs/02-chat.spec.ts

# Watch the browser with slower interactions
npm run test:e2e:headed

# Open the HTML report after a run
npx playwright show-report
```

The runner builds current source with the Dockerfile's `e2e` target and starts separate PostgreSQL, Redis, and LiveKit containers. Chromium runs with one worker. The E2E stack resets before and after each run. Failure screenshots, videos, and traces go in `test-results/`; HTML reports go in `playwright-report/`.

### Frontend tests

Vitest tests live under `view/src/` and cover components, hooks, and voting helpers.

```bash
npm run test
npm run test:watch
```

### Rust tests

Rust has unit tests and API route tests in `api/tests/http_routes/`. Route tests create temporary databases on local PostgreSQL. They require `psql`, database creation and deletion permissions, and Redis configured through `.env`.

```bash
# All Rust tests, including API route tests
npm run test:rust

# Only API route integration tests
npm run test:api:integration
```

The database connection comes from `PRAXIS_TEST_DATABASE_ADMIN_URL`, `DATABASE_URL`, or the `DB_*` values in `.env`, in that order.

### Run everything

```bash
npm run test-all
```

This runs frontend, Rust, and E2E tests in sequence, stopping on failure. All prerequisites above apply.

For TypeScript checks, ESLint, and the npm dependency audit, run `npm run check`. For Rust formatting and lint checks, run `cargo fmt --all --check` and `cargo clippy --workspace --all-targets`.

## Building deployment artifacts

Production uses two tracked artifacts: the Linux x86_64 backend in `deploy/artifacts/linux-x86_64/` and the Vite frontend in `deploy/artifacts/frontend-dist/`.

```bash
# Rebuild both artifacts
npm run build:artifacts

# Or rebuild one
npm run build:rust
npm run build:frontend
```

Docker Buildx uses pinned Rust and Node images from `deploy/Dockerfile.backend-artifact` and `deploy/Dockerfile.frontend-artifact`. The backend targets `linux/amd64`, including on ARM Macs. Each build exports the artifact and its `.source-checksum` to the tracked directory. Include rebuilt files in your release after source, dependency, or build configuration changes.

`npm run build` creates a local frontend build in `view/dist`; it does not refresh the tracked deployment artifact.

## Docker and deployment

The production Dockerfile recomputes source checksums and rejects missing or stale artifacts. It packages the prebuilt backend and frontend, so the deployment host does not compile Rust or install Node dependencies.

```bash
# Verify and build the production image locally
docker build --platform linux/amd64 --target production -t praxis:local .

# Build and start the configured production Compose stack
docker compose up -d --build
```

Production requires a Linux x86_64 host and a configured `.env`. If checksum verification fails, rebuild the affected artifact with the commands above. Do not run `docker compose down --volumes`, since production data and uploads use named volumes.

See [deployment instructions](docs/deployment/deployment.md) for secrets, migrations, reverse proxy setup, LiveKit, and updates, or [DEPLOY.md](DEPLOY.md) for the quick reference.

## Documentation

See the [documentation index](docs/README.md) for project docs and the [original app proposal](docs/project-proposals/praxis-chat-app-proposal.md) for product scope.
