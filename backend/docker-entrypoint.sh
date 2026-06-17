#!/bin/sh
set -e

cd /var/www/html

# Volume mounts replace vendor from the image — reinstall when missing
if [ ! -f vendor/autoload.php ]; then
  echo "Installing Composer dependencies..."
  composer install --no-interaction --prefer-dist
fi

# Ensure Laravel package manifest exists
php artisan package:discover --ansi 2>/dev/null || true

exec "$@"
