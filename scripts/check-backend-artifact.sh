#!/usr/bin/env bash
set -euo pipefail

artifact_dir="${2:-deploy/artifacts/linux-x86_64}"
checksum_file="$artifact_dir/.source-checksum"
checksum="$(
  find api cli entity migrations src Cargo.toml Cargo.lock rust-toolchain.toml \
    deploy/Dockerfile.backend-artifact .dockerignore \
    \( -name target -o -name node_modules \) -prune -o \
    -type f ! -name .DS_Store -print0 \
    | LC_ALL=C sort -z | xargs -0 sha256sum | sha256sum | cut -d ' ' -f 1
)"

case "${1:-check}" in
  write)
    printf '%s\n' "$checksum" > "$checksum_file"
    ;;
  check)
    if [[ ! -f "$checksum_file" ]] || [[ "$(cat "$checksum_file")" != "$checksum" ]]; then
      echo 'Backend artifact is missing or stale. Run npm run build:rust and include the updated artifact in your release.' >&2
      exit 1
    fi
    ;;
  *)
    echo 'Usage: check-backend-artifact.sh [check|write] [artifact-directory]' >&2
    exit 1
    ;;
esac
