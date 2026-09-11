# Deploy Praxis Live

The repository contains the prebuilt Linux x86_64 backend binary and the
prebuilt Vite frontend used by the Docker image. On the VPS, clone the
repository, create `.env` from `.env.example`, configure it, and start the
existing Compose stack:

```bash
cp .env.example .env
docker compose up -d --build
curl --fail http://127.0.0.1:3100/api/health
```

Do not run `docker compose down --volumes`; PostgreSQL, Redis, and uploads use
named volumes.

## Refresh the backend binary

After changing Rust code, rebuild and commit the Linux x86_64 artifact from a
machine with Docker/buildx:

```bash
scripts/build-linux-artifact.sh
```

The production build rejects a missing or stale backend source checksum.
Run `npm run build:rust` and include the updated artifact in your release
if this check fails.

## Refresh the frontend build

After changing frontend code, rebuild and commit the frontend artifact from a
machine with Docker/buildx:

```bash
scripts/build-frontend-artifact.sh
```

The production build rejects a missing or stale frontend source checksum.
Run `npm run build:frontend` and include the updated artifact in your release
if this check fails.

The VPS Docker build uses both artifacts and does not install Rust, compile
the backend, or run `npm run build`.
