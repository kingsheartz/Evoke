#!/usr/bin/env bash
# Pull ECR images and restart the Evoke stack on EC2.
# Called by GitHub Actions (SSM), CodeDeploy, or manually after a build.
set -euo pipefail

ROOT="${EVOKE_ROOT:-/opt/evoke}"
cd "$ROOT"

ENV_FILE="${ROOT}/deploy.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing ${ENV_FILE}" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

: "${AWS_REGION:?Set AWS_REGION in deploy.env}"
: "${ECR_REGISTRY:?Set ECR_REGISTRY in deploy.env}"
: "${NEXT_PUBLIC_API_URL:?Set NEXT_PUBLIC_API_URL in deploy.env}"

COMPOSE_FILE="${COMPOSE_FILE:-infra/aws/docker-compose.aws.yml}"
export IMAGE_TAG="${IMAGE_TAG:-latest}"

bash "${ROOT}/infra/aws/scripts/render-env.sh" "$ROOT"

echo "Logging into ECR (${ECR_REGISTRY})..."
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$ECR_REGISTRY"

echo "Pulling images (tag=${IMAGE_TAG})..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull

echo "Starting services..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --remove-orphans

if [[ "${RUN_MIGRATIONS:-true}" == "true" ]]; then
  echo "Running migrations..."
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T backend \
    php artisan migrate --force
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T backend \
    php artisan config:cache
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T backend \
    php artisan route:cache
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T backend \
    php artisan storage:link --force || true
fi

echo "Deploy complete. Health check:"
curl -fsS "http://127.0.0.1:${HTTP_PORT:-80}/api/v1/health" || echo "(health endpoint not ready yet)"
