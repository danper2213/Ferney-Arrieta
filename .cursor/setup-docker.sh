#!/usr/bin/env bash
# Bring up a working Docker daemon inside the Cloud Agent VM.
#
# Cloud Agent VMs run nested inside a container whose root filesystem is an
# overlay mount, which breaks Docker in two ways:
#   1. The native overlay2 storage driver cannot mount overlay-on-overlay
#      ("invalid argument"), so we back Docker's data-root with an ext4
#      loopback image where overlay2 works normally (and fast).
#   2. Container-to-container traffic is silently dropped under nft, so we
#      switch iptables to the legacy backend.
#
# This script is idempotent: it can run during `install` and again on every
# boot via `start`.
set -euo pipefail

DOCKER_IMG=/docker-data.img
DOCKER_ROOT=/var/lib/docker
IMG_SIZE=100G

log() { echo "[setup-docker] $*"; }

# Fast path: if the daemon is already up and its data-root is on the loopback,
# there is nothing to do. Avoids a disruptive restart of running containers.
if docker info >/dev/null 2>&1 && mountpoint -q "$DOCKER_ROOT"; then
  log "docker already running on $DOCKER_ROOT (storage: $(docker info --format '{{.Driver}}' 2>/dev/null))"
  exit 0
fi

# 1. Install Docker if it is not present.
if ! command -v docker >/dev/null 2>&1; then
  log "installing docker engine"
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sudo sh /tmp/get-docker.sh
fi

# 2. Use the legacy iptables backend (nft breaks bridge networking here).
if update-alternatives --query iptables >/dev/null 2>&1; then
  sudo update-alternatives --set iptables /usr/sbin/iptables-legacy >/dev/null 2>&1 || true
  sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy >/dev/null 2>&1 || true
fi

# 3. Configure the overlay2 storage driver.
sudo mkdir -p /etc/docker
echo '{"storage-driver":"overlay2"}' | sudo tee /etc/docker/daemon.json >/dev/null

# 4. Create + mount the ext4 loopback backing Docker's data-root.
if [ ! -f "$DOCKER_IMG" ]; then
  log "creating ext4 loopback image at $DOCKER_IMG ($IMG_SIZE sparse)"
  sudo truncate -s "$IMG_SIZE" "$DOCKER_IMG"
  sudo mkfs.ext4 -q -F "$DOCKER_IMG"
fi
sudo mkdir -p "$DOCKER_ROOT"
if ! mountpoint -q "$DOCKER_ROOT"; then
  log "mounting loopback at $DOCKER_ROOT"
  sudo mount -o loop "$DOCKER_IMG" "$DOCKER_ROOT"
fi

# 5. Start the Docker daemon (restart only if already running to pick up the
#    mount/driver config) and wait for it to be ready.
if sudo service docker status >/dev/null 2>&1; then
  sudo service docker restart >/dev/null 2>&1 || true
else
  sudo service docker start >/dev/null 2>&1 || true
fi
for i in $(seq 1 30); do
  if sudo docker info >/dev/null 2>&1; then break; fi
  sleep 1
done
# Let the invoking (non-root) user talk to the daemon without sudo.
sudo chmod 666 /var/run/docker.sock 2>/dev/null || true

if docker info >/dev/null 2>&1; then
  log "docker is ready (storage: $(docker info --format '{{.Driver}}' 2>/dev/null))"
else
  log "ERROR: docker did not become ready" >&2
  exit 1
fi
