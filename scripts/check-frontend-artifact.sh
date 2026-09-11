#!/usr/bin/env bash
set -euo pipefail

artifact_dir="${2:-deploy/artifacts/frontend-dist}"
checksum_file="$artifact_dir/.source-checksum"
checksum="$(
  find view package.json package-lock.json tsconfig.json tsconfig.app.json \
    tsconfig.node.json tsconfig.e2e.json vite.config.ts components.json \
    deploy/Dockerfile.frontend-artifact .dockerignore \
    \( -name node_modules -o -path view/dist -o -path view/coverage \) -prune -o \
    -type f ! -name .DS_Store ! -name '*.tsbuildinfo' -print0 \
    | LC_ALL=C sort -z | xargs -0 sha256sum | sha256sum | cut -d ' ' -f 1
)"

case "${1:-check}" in
  write)
    printf '%s\n' "$checksum" > "$checksum_file"
    ;;
  check)
    if [[ ! -f "$checksum_file" ]] || [[ "$(cat "$checksum_file")" != "$checksum" ]]; then
      echo 'Frontend artifact is missing or stale. Run npm run build:frontend and include the updated artifact in your release.' >&2
      exit 1
    fi
    ;;
  *)
    echo 'Usage: check-frontend-artifact.sh [check|write] [artifact-directory]' >&2
    exit 1
    ;;
esac
