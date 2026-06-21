#!/usr/bin/env bash
# Render backend.runtime.env from deploy.env for docker compose on EC2.
set -euo pipefail

ROOT="${1:-/opt/evoke}"
ENV_FILE="${ROOT}/deploy.env"
OUT_FILE="${ROOT}/infra/aws/backend.runtime.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing ${ENV_FILE}. Copy infra/aws/config/deploy.env.example to deploy.env and edit." >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

mkdir -p "$(dirname "$OUT_FILE")"

cat >"$OUT_FILE" <<EOF
APP_NAME=${APP_NAME:-Evoke}
APP_ENV=${APP_ENV:-production}
APP_DEBUG=${APP_DEBUG:-false}
APP_KEY=${APP_KEY:?Set APP_KEY in deploy.env}
APP_URL=${APP_URL:?Set APP_URL in deploy.env}
APP_TIMEZONE=${APP_TIMEZONE:-Asia/Kolkata}
FRONTEND_URL=${FRONTEND_URL:?Set FRONTEND_URL in deploy.env}

LOG_CHANNEL=stack
LOG_LEVEL=warning

DB_CONNECTION=${DB_CONNECTION:-mysql}
DB_HOST=${DB_HOST:-mysql}
DB_PORT=${DB_PORT:-3306}
DB_DATABASE=${DB_DATABASE:-evoke}
DB_USERNAME=${DB_USERNAME:-evoke}
DB_PASSWORD=${DB_PASSWORD:?Set DB_PASSWORD in deploy.env}

SESSION_DRIVER=${SESSION_DRIVER:-redis}
SESSION_LIFETIME=120
SESSION_DOMAIN=${SESSION_DOMAIN:-localhost}

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=${QUEUE_CONNECTION:-redis}
CACHE_STORE=${CACHE_STORE:-redis}

REDIS_CLIENT=predis
REDIS_HOST=${REDIS_HOST:-redis}
REDIS_PORT=${REDIS_PORT:-6379}

SANCTUM_STATEFUL_DOMAINS=${SANCTUM_STATEFUL_DOMAINS:-localhost}

MAIL_MAILER=${MAIL_MAILER:-resend}
RESEND_API_KEY=${RESEND_API_KEY:-}

RAZORPAY_KEY=${RAZORPAY_KEY:-}
RAZORPAY_SECRET=${RAZORPAY_SECRET:-}

MSG91_AUTH_KEY=${MSG91_AUTH_KEY:-}
MSG91_SENDER_ID=${MSG91_SENDER_ID:-}

AI_SERVICE_URL=${AI_SERVICE_URL:-}
EOF

chmod 600 "$OUT_FILE"
echo "Wrote ${OUT_FILE}"
