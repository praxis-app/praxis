#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"
artifact_dir="deploy/artifacts/frontend-dist"
temporary_dir="$(mktemp -d)"
trap 'rm -rf "$temporary_dir"' EXIT

docker buildx build \
  --file deploy/Dockerfile.frontend-artifact \
  --output "type=local,dest=$temporary_dir" \
  .

rm -rf "$artifact_dir"
mkdir -p "$artifact_dir"
cp -R "$temporary_dir/." "$artifact_dir/"
