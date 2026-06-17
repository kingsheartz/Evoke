#!/bin/sh
set -e

cd /var/www/html

if [ ! -f vendor/autoload.php ]; then
  echo "Installing Composer dependencies..."
  composer install --no-interaction --prefer-dist
fi

# Keep bind-mounted .env aligned with Docker service hostnames (HTTP server reads .env)
if [ -f .env ]; then
  if [ -n "$DB_HOST" ]; then
    sed -i "s/^DB_HOST=.*/DB_HOST=${DB_HOST}/" .env
  fi
  if [ -n "$REDIS_HOST" ]; then
    sed -i "s/^REDIS_HOST=.*/REDIS_HOST=${REDIS_HOST}/" .env
  fi
  if [ -n "$APP_KEY" ]; then
    sed -i "s|^APP_KEY=.*|APP_KEY=${APP_KEY}|" .env
  fi
  if [ -n "$AI_SERVICE_URL" ]; then
    sed -i "s|^AI_SERVICE_URL=.*|AI_SERVICE_URL=${AI_SERVICE_URL}|" .env
  fi
fi

php artisan package:discover --ansi 2>/dev/null || true

exec "$@"
