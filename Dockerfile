# syntax=docker/dockerfile:1

# Backend build stage used by the E2E image
FROM rust:1.97.0-slim-bookworm AS backend-builder

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY api ./api
COPY cli ./cli
COPY entity ./entity
COPY migrations ./migrations
COPY src ./src

# Copied files keep old timestamps, so cargo can miss changes and reuse the
# cached build. Touching them first makes sure changed code is rebuilt.
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/app/target \
    find api cli entity migrations src -name '*.rs' -exec touch {} + \
    && cargo build --release -p praxis-live \
    && cp /app/target/release/praxis-live /praxis-live

# Frontend build stage
FROM node:24.18.0-bookworm-slim AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.app.json tsconfig.node.json tsconfig.e2e.json ./
COPY vite.config.ts components.json ./
COPY view ./view

RUN npm run build

# Shared runtime stage
FROM debian:bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY content ./content

ENV FRONTEND_DIST_DIR=/app/static

CMD ["./praxis-live"]

# E2E image built from the current Rust and Vite source
FROM runtime AS e2e

COPY --from=backend-builder /praxis-live ./
COPY --from=frontend-builder /app/view/dist ./static

# Verify the artifact against the source without compiling on the VPS
FROM runtime AS frontend-verified

# Copy needed config files
COPY package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json tsconfig.e2e.json ./
COPY vite.config.ts components.json .dockerignore ./
COPY view ./view
COPY deploy/Dockerfile.frontend-artifact ./deploy/Dockerfile.frontend-artifact
COPY scripts/check-frontend-artifact.sh ./scripts/check-frontend-artifact.sh
COPY deploy/artifacts/frontend-dist ./deploy/artifacts/frontend-dist

RUN bash scripts/check-frontend-artifact.sh

FROM runtime AS backend-verified

COPY Cargo.toml Cargo.lock rust-toolchain.toml .dockerignore ./
COPY api ./api
COPY cli ./cli
COPY entity ./entity
COPY migrations ./migrations
COPY src ./src
COPY deploy/Dockerfile.backend-artifact ./deploy/Dockerfile.backend-artifact
COPY scripts/check-backend-artifact.sh ./scripts/check-backend-artifact.sh
COPY deploy/artifacts/linux-x86_64 ./deploy/artifacts/linux-x86_64

RUN bash scripts/check-backend-artifact.sh

# Production image built from the tracked Linux and frontend artifacts
FROM runtime AS production

COPY --from=backend-verified /app/deploy/artifacts/linux-x86_64/praxis-live ./
COPY --from=frontend-verified /app/deploy/artifacts/frontend-dist ./static
