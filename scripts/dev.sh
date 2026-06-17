#!/usr/bin/env bash
# Evoke development helpers
# Usage: ./scripts/dev.sh <command> [service]

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SERVICE="${2:-frontend}"

help() {
  cat <<'EOF'
Evoke dev commands (run from repo root)

  ./scripts/dev.sh up                 Start all services
  ./scripts/dev.sh down               Stop all services
  ./scripts/dev.sh status             Show running containers
  ./scripts/dev.sh logs [service]     Follow logs (default: frontend)
  ./scripts/dev.sh restart [service]  Restart a service
  ./scripts/dev.sh reset-frontend     Fix stale Next.js UI cache
  ./scripts/dev.sh verify-ui          Check if new theme HTML is served
  ./scripts/dev.sh verify-admin       Check admin sidebar layout in container
  ./scripts/dev.sh migrate            Run migrations + seed
  ./scripts/dev.sh install            composer + npm install in containers
  ./scripts/dev.sh shell [service]    Open shell (frontend|backend)
  ./scripts/dev.sh build-frontend     Production build smoke test

Docs: docs/DEVELOPMENT.md
EOF
}

cmd="${1:-help}"

case "$cmd" in
  help) help ;;
  up)
    docker compose up -d --build
    echo ""
    echo "Frontend: http://localhost:3000"
    echo "Admin:    http://localhost:3000/login"
    ;;
  down) docker compose down ;;
  status) docker compose ps ;;
  logs) docker compose logs -f "$SERVICE" ;;
  restart) docker compose restart "$SERVICE" ;;
  reset-frontend)
    echo "Stopping frontend and clearing ALL Next.js caches..."
    docker compose stop frontend 2>/dev/null || true
    docker compose rm -f frontend 2>/dev/null || true
    rm -rf frontend/.next frontend/node_modules/.cache
    echo "Removed frontend/.next and node_modules/.cache on host"
    docker compose up -d --force-recreate --no-build frontend
    echo "Waiting for dev server (up to 45s)..."
    ready=0
    for _ in 1 2 3 4 5 6 7 8 9; do
      sleep 5
      if curl -sf http://localhost:3000 >/dev/null 2>&1; then
        ready=1
        break
      fi
    done
    if [ "$ready" -eq 0 ]; then
      echo "WARN - Frontend not responding yet. Check: docker compose logs frontend"
    fi
    "$0" verify-ui
    "$0" verify-admin
    ;;
  verify-admin)
    echo "Checking admin layout source in frontend container..."
    layout=$(docker compose exec -T frontend sh -c "cat /app/src/app/admin/layout.tsx" 2>/dev/null) || true
    css=$(docker compose exec -T frontend sh -c "cat /app/src/app/globals.css" 2>/dev/null) || true
    if [ -z "$layout" ] || [ -z "$css" ]; then
      echo "ERROR - Could not read admin files in container. Is frontend running?"
      exit 1
    fi
    failed=0
    check() {
      if echo "$1" | grep -q "$2"; then
        echo "OK - $3"
      else
        echo "FAIL - $3"
        failed=$((failed + 1))
      fi
    }
    check "$layout" "fixed-sidebar-v2" "data-admin-layout marker"
    check "$layout" "AdminScrollLock" "AdminScrollLock"
    check "$layout" "admin-main-column" "admin-main-column"
    if echo "$css" | grep -q '\.admin-sidebar' && echo "$css" | grep -q 'position: fixed'; then
      echo "OK - sidebar position:fixed in CSS"
    else
      echo "FAIL - sidebar position:fixed in CSS"
      failed=$((failed + 1))
    fi
    check "$css" 'html\.admin-route' "body scroll lock CSS"
    if [ "$failed" -eq 0 ]; then
      echo ""
      echo "Admin sidebar fix is in the container. Hard refresh: Ctrl+Shift+R at http://localhost:3000/admin"
    else
      echo ""
      echo "Admin fix NOT fully deployed. Run: ./scripts/dev.sh reset-frontend"
      exit 1
    fi
    ;;
  verify-ui)
    echo "Checking http://localhost:3000 ..."
    if html=$(curl -sf http://localhost:3000 2>/dev/null); then
      if echo "$html" | grep -q "Premium Multi-Business\|mesh-bg\|font-display"; then
        echo "OK - New UI detected"
      else
        echo "WARN - New UI markers not found. Run: ./scripts/dev.sh reset-frontend"
      fi
      if echo "$html" | grep -q "bg-white text-zinc-900"; then
        echo "WARN - Old layout still present"
      fi
    else
      echo "ERROR - Could not reach frontend. Run: docker compose up -d frontend"
      exit 1
    fi
    ;;
  migrate)
    docker compose exec backend php artisan migrate --seed
    ;;
  install)
    docker compose exec backend composer install
    docker compose exec frontend npm install
    ;;
  shell)
    if [ "$SERVICE" = "backend" ]; then
      docker compose exec backend bash
    else
      docker compose exec frontend sh
    fi
    ;;
  build-frontend)
    docker compose exec frontend npm run build
    ;;
  *)
    echo "Unknown command: $cmd"
    help
    exit 1
    ;;
esac
