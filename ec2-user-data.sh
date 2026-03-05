#!/usr/bin/env bash
set -euo pipefail

APP_USER="ubuntu"
APP_DIR="/home/${APP_USER}/extinctbook0"
REPO_URL="https://github.com/ItsDev75/extinctbook0.git"
NODE_VERSION="20"
PNPM_VERSION="9.15.4"

export DEBIAN_FRONTEND=noninteractive

echo "== System update =="
apt-get update
apt-get install -y --no-install-recommends \
  ca-certificates \
  curl \
  git \
  gnupg \
  lsb-release

echo "== Install Node.js ${NODE_VERSION} + pnpm =="
curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash -
apt-get install -y --no-install-recommends nodejs
corepack enable
corepack prepare "pnpm@${PNPM_VERSION}" --activate

echo "== Clone repo =="
if [ ! -d "${APP_DIR}" ]; then
  sudo -u "${APP_USER}" -H git clone "${REPO_URL}" "${APP_DIR}"
fi

echo "== Configure env =="
if [ ! -f "${APP_DIR}/.env" ]; then
  cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
fi
ln -sf "${APP_DIR}/.env" "${APP_DIR}/apps/backend/.env"
set -a
. "${APP_DIR}/.env"
set +a

echo "== Install PostgreSQL (local) =="
apt-get install -y --no-install-recommends postgresql postgresql-contrib
systemctl enable --now postgresql

echo "== Configure PostgreSQL =="
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${POSTGRES_USER}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE ROLE ${POSTGRES_USER} LOGIN PASSWORD '${POSTGRES_PASSWORD}';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'" | grep -q 1 || \
  sudo -u postgres createdb -O "${POSTGRES_USER}" "${POSTGRES_DB}"
sudo -u postgres psql -c "ALTER ROLE ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';"
sudo -u postgres psql -c "ALTER ROLE ${POSTGRES_USER} CREATEDB;"

echo "== Install dependencies =="
sudo -u "${APP_USER}" -H bash -lc "cd '${APP_DIR}' && pnpm install"

echo "== Prepare database (Prisma) =="
sudo -u "${APP_USER}" -H bash -lc "cd '${APP_DIR}' && pnpm --filter @extinctbook/backend db:generate"
sudo -u "${APP_USER}" -H bash -lc "cd '${APP_DIR}' && pnpm --filter @extinctbook/backend exec prisma migrate deploy"

echo "== Build apps =="
sudo -u "${APP_USER}" -H bash -lc "cd '${APP_DIR}' && pnpm --filter @extinctbook/backend build"
sudo -u "${APP_USER}" -H bash -lc "cd '${APP_DIR}' && pnpm --filter @extinctbook/admin build"

echo "== Create systemd services =="
cat > /etc/systemd/system/extinctbook-backend.service <<EOF
[Unit]
Description=Extinctbook Backend
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${APP_DIR}
EnvironmentFile=${APP_DIR}/.env
Environment=NODE_ENV=production
ExecStart=/usr/bin/pnpm --filter @extinctbook/backend start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/extinctbook-admin.service <<EOF
[Unit]
Description=Extinctbook Admin
After=network.target

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
ExecStart=/usr/bin/pnpm --filter @extinctbook/admin start -- -p 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now extinctbook-backend
systemctl enable --now extinctbook-admin

echo "== Done =="
echo "Backend: http://<EC2-PUBLIC-IP>:3001"
echo "Admin:   http://<EC2-PUBLIC-IP>:3000"
