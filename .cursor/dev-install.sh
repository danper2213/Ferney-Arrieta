#!/usr/bin/env bash
# Idempotent repository bootstrap, run after checkout.
#
# With environment builds this runs once to create the baseline snapshot, so we
# also pre-pull the Supabase Docker images here (they get baked into the
# snapshot, making per-boot `start` fast). Per-boot work lives in dev-start.sh.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "[install] setting up docker"
bash .cursor/setup-docker.sh

echo "[install] installing node dependencies"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "[install] pre-pulling Supabase images"
# Start once to pull all images + validate migrations, then stop. The images
# persist in Docker's data-root; the ephemeral DB is discarded.
npx supabase start || true
npx supabase stop --no-backup || true

echo "[install] done"
