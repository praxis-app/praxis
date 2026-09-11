# Deploying Praxis

Praxis uses the repository's shared `Dockerfile` and `docker-compose.yml`. The
production image copies the tracked Linux x86_64 (`linux/amd64`) Rust binary
from `deploy/artifacts/linux-x86_64/praxis-live` and the tracked Vite frontend
build from `deploy/artifacts/frontend-dist`. The VPS never compiles Rust or
runs `npm run build`, which keeps deploys viable on resource-constrained
hosts.

## Initial deployment

Use a Linux x86_64 host with Docker Compose and a TLS reverse proxy:

```bash
git clone git@github.com:praxis-app/praxis-live.git
cd praxis-live
cp .env.example .env
```

Replace every development secret in `.env`. In particular,
`CHANNEL_KEY_MASTER` must be a base64-encoded 32-byte key and must be backed up.
Set `DB_MIGRATIONS=true` for the first start:

```bash
docker compose up -d --build
curl --fail http://127.0.0.1:3100/api/health
```

After a successful start, set `DB_MIGRATIONS=false`; enable it again when a
release contains new migrations. Do not reuse a database volume from the legacy
Praxis Chat application because its schema is incompatible.

Proxy the application domain to `http://127.0.0.1:3100` and preserve WebSocket
upgrade headers for `/ws`.

## Optional video calls

To use the bundled LiveKit service:

- set `COMPOSE_PROFILES=livekit`;
- set a browser-reachable `LIVEKIT_URL` using `wss://`;
- proxy that LiveKit hostname to `127.0.0.1:${LIVEKIT_PORT}`; and
- open the configured LiveKit RTC TCP and UDP ports.

## Updates

```bash
git pull
docker compose up -d --build
curl --fail http://127.0.0.1:3100/api/health
```

After Rust changes, rebuild and commit the tracked backend artifact before
deploying:

```bash
scripts/build-linux-artifact.sh
```

After frontend changes, rebuild and commit the tracked frontend artifact
before deploying:

```bash
scripts/build-frontend-artifact.sh
```

Never run `docker compose down --volumes`; PostgreSQL, Redis, and uploads use
named volumes.

See the root [DEPLOY.md](../../DEPLOY.md) for the shortest deployment reference.
