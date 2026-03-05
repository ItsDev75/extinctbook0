#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "== Extinctbook Start (Ubuntu) =="

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found. Install Node.js 20+ and enable corepack (corepack enable)."
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "PostgreSQL client not found. Install postgres (sudo apt-get install postgresql)."
  exit 1
fi

if [ ! -f "${APP_DIR}/.env" ]; then
  cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
  echo "Created .env from .env.example. Update secrets before production use."
fi

set -a
. "${APP_DIR}/.env"
set +a

echo "== Start PostgreSQL =="
sudo systemctl enable --now postgresql

echo "== Install dependencies =="
pnpm install

echo "== Prepare database =="
pnpm --filter @extinctbook/backend db:generate
pnpm --filter @extinctbook/backend db:migrate

echo "== Start backend + admin (dev) =="
pnpm dev
