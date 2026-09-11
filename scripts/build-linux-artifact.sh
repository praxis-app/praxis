#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"
artifact_dir="deploy/artifacts/linux-x86_64"
temporary_dir="$(mktemp -d)"
trap 'rm -rf "$temporary_dir"' EXIT

docker buildx build \
  --platform linux/amd64 \
  --file deploy/Dockerfile.backend-artifact \
  --output "type=local,dest=$temporary_dir" \
  .

mkdir -p "$artifact_dir"
cp "$temporary_dir/praxis-live" "$artifact_dir/praxis-live"
cp "$temporary_dir/.source-checksum" "$artifact_dir/.source-checksum"
chmod +x "$artifact_dir/praxis-live"
