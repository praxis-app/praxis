#!/usr/bin/env bash
#
# One-time Ubuntu VPS cutover: praxis-live → praxis, preserving DB/images/secrets.
#
# First complete steps 1–5 in .docs/deploy/rename-praxis-startup-checklist.md:
# off-server backups, rebuilt artifacts, new checkout and matching production .env.
#
# Run from the new checkout: bash scripts/redeploy.sh OLD_CHECKOUT HEALTH_URL
# Copies stopped volumes; leaves originals intact. Refuses existing destinations.

set -euo pipefail

if [[ ${1:-} == --help || $# != 2 ]]; then
	# Show the required checkout and public health endpoint.
	echo 'Usage: bash scripts/redeploy.sh /path/to/praxis-live https://YOUR_DOMAIN/api/health'
	[[ ${1:-} == --help ]] && exit 0
	exit 2
fi

# Resolve both checkouts independently of the terminal directory.
new_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)
old_dir=$(cd "$1" && pwd -P)
health_url=$2
[[ "$old_dir" != "$new_dir" && -f "$old_dir/.env" && -f "$new_dir/.env" ]] || {
	echo 'Expected separate old/new checkouts, each with its production .env.' >&2
	exit 1
}

# Authenticate sudo before any downtime.
sudo -v

# Use explicit project names and files for every Compose command.
old=(sudo docker compose --project-directory "$old_dir" -f "$old_dir/docker-compose.yml" -p praxis-live)
new=(sudo docker compose --project-directory "$new_dir" -f "$new_dir/docker-compose.yml" -p praxis)

for pair in database:postgres_data web:uploads cache:cache; do
	service=${pair%%:*}
	volume=${pair#*:}
	destination=$volume
	[[ "$volume" != uploads ]] || destination=content

	# Confirm the running old service actually mounts the expected source volume.
	container=$("${old[@]}" ps -q "$service")
	[[ -n "$container" ]] || {
		echo "Old service is not running: $service" >&2
		exit 1
	}
	sudo docker inspect --format '{{range .Mounts}}{{println .Name}}{{end}}' "$container" |
		grep -Fxq "praxis-live_$volume" || {
		echo "Unexpected volume for $service" >&2
		exit 1
	}
	if [[ "$service" != web ]]; then
		# Keep the database/cache image tags unchanged during the volume migration.
		old_image=$(sudo docker inspect --format '{{.Config.Image}}' "$container")
		"${new[@]}" config --images "$service" | grep -Fxq "$old_image" || {
			echo "Image changed for $service; align it with $old_image before cutover." >&2
			exit 1
		}
	fi

	# Refuse to merge with existing or partially copied data.
	if sudo docker volume inspect "praxis_$destination" >/dev/null 2>&1; then
		echo "Destination already exists: praxis_$destination; resolve it before running." >&2
		exit 1
	fi
done

# Persist the new project name and enable pending migrations without changing secrets.
sed -i '/^COMPOSE_PROJECT_NAME=/d; /^DB_MIGRATIONS=/d' "$new_dir/.env"
printf '\nCOMPOSE_PROJECT_NAME=praxis\nDB_MIGRATIONS=true\n' >>"$new_dir/.env"

# Validate configuration and build the artifact-based web image while the site stays online.
"${new[@]}" config --quiet
"${new[@]}" build web

# Download service images and the volume-copy helper before stopping the site.
"${new[@]}" pull database cache
"${new[@]}" --profile livekit pull livekit
sudo docker pull alpine

# Report cutover failures without automatically discarding new writes via rollback.
trap 'echo "Cutover incomplete. Old volumes are retained; inspect Compose logs and checklist rollback instructions before retrying." >&2' ERR

# Stop the old stack cleanly; never remove its volumes.
"${old[@]}" down
for volume in postgres_data uploads cache; do
	# Map the old uploads volume to the new content volume.
	destination=$volume
	[[ "$volume" != uploads ]] || destination=content
	# Create an empty destination, then preserve file ownership while copying.
	sudo docker volume create "praxis_$destination" >/dev/null
	sudo docker run --rm --mount "type=volume,src=praxis-live_$volume,dst=/from,readonly" \
		--mount "type=volume,src=praxis_$destination,dst=/to" alpine sh -c 'cp -a /from/. /to/'
done

# Start from prepared images; no builds or downloads during cutover.
"${new[@]}" up -d --no-build --pull never

# Allow startup/migrations to finish and verify the public endpoint.
curl --fail --silent --show-error --retry 30 --retry-delay 2 --retry-all-errors --max-time 5 "$health_url"

# Disable startup migrations after the first successful start.
sed -i 's/^DB_MIGRATIONS=true$/DB_MIGRATIONS=false/' "$new_dir/.env"

# Apply the final environment and check health again after the web restart.
"${new[@]}" up -d --no-build --pull never
curl --fail --silent --show-error --retry 30 --retry-delay 2 --retry-all-errors --max-time 5 "$health_url"

# Clear failure reporting and print the remaining browser checks.
trap - ERR
echo 'Cutover complete. Check existing login, encrypted messages, images, uploads and video calls; retain old volumes and backups.'
