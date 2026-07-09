#!/usr/bin/env bash
# First-time bootstrap for Ubuntu on Oracle Cloud Always Free (or any lean VPS).
# Run as root or with sudo: bash infra/free/scripts/bootstrap-oracle.sh
set -euo pipefail

EVOKE_ROOT="${EVOKE_ROOT:-/opt/evoke}"
EVOKE_REPO="${EVOKE_REPO:-https://github.com/your-org/Evoke.git}"
EVOKE_BRANCH="${EVOKE_BRANCH:-master}"

echo "==> Installing Docker..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y docker.io docker-compose-plugin git curl ca-certificates

systemctl enable --now docker
if id -u ubuntu >/dev/null 2>&1; then
  usermod -aG docker ubuntu || true
fi
if id -u opc >/dev/null 2>&1; then
  usermod -aG docker opc || true
fi

echo "==> Cloning Evoke to ${EVOKE_ROOT}..."
if [[ ! -d "${EVOKE_ROOT}/.git" ]]; then
  git clone --branch "$EVOKE_BRANCH" --depth 1 "$EVOKE_REPO" "$EVOKE_ROOT"
else
  git -C "$EVOKE_ROOT" fetch origin "$EVOKE_BRANCH"
  git -C "$EVOKE_ROOT" checkout "$EVOKE_BRANCH"
  git -C "$EVOKE_ROOT" pull --ff-only
fi

chown -R "${SUDO_USER:-root}:${SUDO_USER:-root}" "$EVOKE_ROOT" 2>/dev/null || true

if [[ ! -f "${EVOKE_ROOT}/.env.production" ]]; then
  cp "${EVOKE_ROOT}/infra/free/config/oracle-free.env.example" "${EVOKE_ROOT}/.env.production"
fi
if [[ ! -f "${EVOKE_ROOT}/backend/.env" ]]; then
  cp "${EVOKE_ROOT}/backend/.env.example" "${EVOKE_ROOT}/backend/.env"
fi

# 2 GB swap helps on smaller free shapes
if [[ ! -f /swapfile ]]; then
  echo "==> Adding 2G swap (optional safety on small VMs)..."
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo ""
echo "==> Bootstrap done."
echo "Next steps:"
echo "  1. Edit ${EVOKE_ROOT}/.env.production and ${EVOKE_ROOT}/backend/.env"
echo "  2. Generate APP_KEY: docker run --rm -v ${EVOKE_ROOT}/backend:/app -w /app composer:latest php artisan key:generate --show"
echo "  3. Start stack — see docs/deploy/OPTION-C-FREE.md (Path C1, Phase 4)"
