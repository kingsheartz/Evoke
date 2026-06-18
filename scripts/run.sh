#!/usr/bin/env bash
# Evoke stack runner — progressive dev/test/deploy without full setup upfront.
# Usage: ./scripts/run.sh <command> [stack|service] [options]
# Docs: RUN.md

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

COMMAND="${1:-help}"
shift || true

DO_MIGRATE=0
DO_SEED=0
DO_BUILD=1
DO_PULL=0
FOREGROUND=0
REMOVE_VOLUMES=0
FORCE_INIT=0
FRESH_MIGRATE=0

declare -a COMPOSE_PROFILES=()
COMPOSE_MODE="dev"
STACK="core"
SERVICE="frontend"

usage() {
  cat <<'EOF'
Evoke run — start only what you need (see RUN.md)

Usage:
  ./scripts/run.sh <command> [stack|service] [options]

Stacks (pick one — no need to enable everything):
  core      Frontend + API + Postgres + Redis (default)
  web       core + Nginx proxy on :8080
  mysql     Frontend + API + MySQL + Redis (lighter, no AI)
  workers   core + queue worker + scheduler
  ai        core + AI service + Ollama
  full      All services except MySQL

Commands:
  init              Copy .env examples if missing (safe, non-destructive)
  up [stack]        Start a stack (detached)
  down              Stop all containers
  restart [svc]     Restart one service
  status            Show container status
  logs [svc]        Follow logs (default: frontend)
  install           composer + npm install in containers
  migrate [stack]   Run migrations (--seed, --fresh supported)
  shell [svc]       Shell into frontend|backend
  health            Quick HTTP checks
  smoke             health + migrate status + UI marker check
  build [stack]     Build images without starting
  stacks            List stacks and what they include
  prod up [stack]   Production compose (next start, APP_ENV=production)
  prod down         Stop production stack
  prod build        Build production images
  prod migrate      Migrate in production mode
  prod health       Health checks against production stack

Options (for up / build / prod up):
  --migrate         Run migrations after start
  --seed            Migrate with seed data
  --fresh           migrate:fresh --seed (destroys data)
  --no-build        Skip image build
  --pull            Pull base images before build
  --foreground, -f  Attach logs (no -d)
  --volumes         down: remove volumes
  --force           init: overwrite from examples

Examples:
  ./scripts/run.sh init
  ./scripts/run.sh up core --migrate --seed
  ./scripts/run.sh up mysql --migrate
  ./scripts/run.sh up web
  ./scripts/run.sh prod up core --migrate
  ./scripts/run.sh smoke

PowerShell: .\scripts\run.ps1 ...
CMD:        scripts\run.cmd ...

Daily UI fixes: scripts/dev.sh (reset-frontend, verify-ui)
Hosting guide:   docs/DEPLOYMENT.md
EOF
}

parse_flags() {
  local args=("$@")
  for arg in "${args[@]}"; do
    case "$arg" in
      --migrate) DO_MIGRATE=1 ;;
      --seed) DO_SEED=1; DO_MIGRATE=1 ;;
      --fresh) DO_SEED=1; DO_MIGRATE=1; FRESH_MIGRATE=1 ;;
      --no-build) DO_BUILD=0 ;;
      --pull) DO_PULL=1 ;;
      --foreground|-f) FOREGROUND=1 ;;
      --volumes) REMOVE_VOLUMES=1 ;;
      --force) FORCE_INIT=1 ;;
    esac
  done
}

is_stack() {
  case "$1" in
    core|web|mysql|workers|ai|full) return 0 ;;
    *) return 1 ;;
  esac
}

apply_stack() {
  local stack="$1"
  COMPOSE_PROFILES=()
  export DB_CONNECTION="${DB_CONNECTION:-pgsql}"
  export DB_HOST="${DB_HOST:-postgres}"
  export DB_PORT="${DB_PORT:-5432}"

  case "$stack" in
    core) COMPOSE_PROFILES=(--profile pgsql) ;;
    web) COMPOSE_PROFILES=(--profile pgsql --profile proxy) ;;
    mysql)
      COMPOSE_PROFILES=(--profile mysql)
      export DB_CONNECTION=mysql
      export DB_HOST=mysql
      export DB_PORT=3306
      ;;
    workers) COMPOSE_PROFILES=(--profile pgsql --profile workers) ;;
    ai) COMPOSE_PROFILES=(--profile pgsql --profile ai) ;;
    full) COMPOSE_PROFILES=(--profile full) ;;
    *)
      echo "Unknown stack: $stack" >&2
      echo "Run: ./scripts/run.sh stacks" >&2
      exit 1
      ;;
  esac
}

compose_files() {
  if [[ "$COMPOSE_MODE" == "prod" ]]; then
    echo -f docker-compose.yml -f docker-compose.prod.yml
  else
    echo -f docker-compose.yml
  fi
}

dc() {
  # shellcheck disable=SC2046
  docker compose $(compose_files) "${COMPOSE_PROFILES[@]}" "$@"
}

copy_if_missing() {
  local src="$1"
  local dest="$2"
  if [[ -f "$dest" && "$FORCE_INIT" -eq 0 ]]; then
    echo "  keep  $dest"
    return 0
  fi
  if [[ -f "$src" ]]; then
    cp "$src" "$dest"
    echo "  create $dest"
  else
    echo "  skip  $dest (no $src)"
  fi
}

cmd_init() {
  echo "Initializing env files (existing files are kept unless --force)..."
  copy_if_missing ".env.example" ".env"
  copy_if_missing "backend/.env.example" "backend/.env"
  copy_if_missing "frontend/.env.example" "frontend/.env.local"
  echo ""
  echo "Optional later (not required to start testing):"
  echo "  - RAZORPAY_* / RESEND_* / MSG91_* in backend/.env"
  echo "  - AI: ./scripts/run.sh up ai  then docker compose exec ollama ollama pull qwen3"
  echo ""
  echo "Next: ./scripts/run.sh up core --migrate --seed"
}

cmd_stacks() {
  cat <<'EOF'
Stacks — enable only what you need:

  core     frontend, backend, postgres, redis
  web      core + nginx (:8080 unified proxy)
  mysql    frontend, backend, mysql, redis  (no AI / pgvector)
  workers  core + queue-worker + scheduler
  ai       core + ai-service + ollama
  full     nginx + workers + ai + postgres stack

Optional services stay off until you pick a stack.
EOF
}

print_urls() {
  local stack="$1"
  echo "URLs:"
  echo "  Frontend:  http://localhost:3000"
  echo "  Admin:     http://localhost:3000/login"
  echo "  API:       http://localhost:8000/api/v1"
  if [[ "$stack" == "web" || "$stack" == "full" ]]; then
    echo "  Proxy:     http://localhost:8080"
  fi
  if [[ "$stack" == "ai" || "$stack" == "full" ]]; then
    echo "  AI:        http://localhost:8001"
  fi
  echo ""
  echo "Login: admin@evoke.com / password"
}

cmd_migrate_internal() {
  if [[ "$FRESH_MIGRATE" -eq 1 ]]; then
    dc exec -T backend php artisan migrate:fresh --seed --force
  elif [[ "$DO_SEED" -eq 1 ]]; then
    dc exec -T backend php artisan migrate --seed --force
  else
    dc exec -T backend php artisan migrate --force
  fi
}

cmd_up() {
  local stack="$1"
  shift || true
  parse_flags "$@"
  apply_stack "$stack"

  echo "Stack: $stack ($COMPOSE_MODE mode)"
  echo "Profiles: ${COMPOSE_PROFILES[*]}"

  local up_args=(-d)
  [[ "$FOREGROUND" -eq 1 ]] && up_args=()

  if [[ "$DO_PULL" -eq 1 ]]; then
    dc pull --ignore-buildable || true
  fi

  if [[ "$DO_BUILD" -eq 1 ]]; then
    dc up "${up_args[@]}" --build
  else
    dc up "${up_args[@]}"
  fi

  if [[ "$DO_MIGRATE" -eq 1 ]]; then
    echo ""
    echo "Waiting for backend..."
    sleep 5
    cmd_migrate_internal
  fi

  echo ""
  print_urls "$stack"
}

cmd_build() {
  local stack="$1"
  shift || true
  parse_flags "$@"
  apply_stack "$stack"
  dc build
}

cmd_down() {
  if [[ "$REMOVE_VOLUMES" -eq 1 ]]; then
    docker compose -f docker-compose.yml down -v
  else
    docker compose -f docker-compose.yml down
  fi
}

cmd_install() {
  apply_stack "core"
  dc exec -T backend composer install --no-interaction
  dc exec -T frontend npm install
}

cmd_health() {
  local ok=0
  check_url() {
    local name="$1"
    local url="$2"
    if curl -sf --max-time 10 "$url" >/dev/null 2>&1; then
      echo "OK   $name — $url"
    else
      echo "FAIL $name — $url"
      ok=1
    fi
  }
  check_url "Frontend" "http://localhost:3000"
  check_url "API" "http://localhost:8000/api/v1/health"
  if curl -sf --max-time 5 "http://localhost:8080" >/dev/null 2>&1; then
    echo "OK   Nginx proxy — http://localhost:8080"
  fi
  return $ok
}

cmd_smoke() {
  cmd_health || true
  echo ""
  if html=$(curl -sf --max-time 15 "http://localhost:3000" 2>/dev/null); then
    if echo "$html" | grep -qE "Evoke|mesh-bg|font-display"; then
      echo "OK   Homepage HTML looks sane"
    else
      echo "WARN Homepage missing expected markers"
    fi
  fi
  apply_stack "core"
  if dc exec -T backend php artisan migrate:status >/dev/null 2>&1; then
    echo "OK   Database reachable from backend"
  else
    echo "WARN migrate:status failed — run: ./scripts/run.sh up core --migrate --seed"
  fi
}

resolve_stack_from_args() {
  if [[ $# -gt 0 ]] && is_stack "$1"; then
    STACK="$1"
    shift
  fi
}

case "$COMMAND" in
  help|-h|--help) usage ;;
  stacks) cmd_stacks ;;

  init)
    parse_flags "$@"
    cmd_init
    ;;

  up)
    resolve_stack_from_args "$@"
    cmd_up "$STACK" "$@"
    ;;

  build)
    resolve_stack_from_args "$@"
    cmd_build "$STACK" "$@"
    ;;

  down)
    parse_flags "$@"
    cmd_down
    ;;

  restart)
    SERVICE="${1:-frontend}"
    apply_stack "core"
    dc restart "$SERVICE"
    ;;

  status)
    docker compose -f docker-compose.yml ps -a
    ;;

  logs)
    SERVICE="${1:-frontend}"
    apply_stack "core"
    dc logs -f "$SERVICE"
    ;;

  install)
    cmd_install
    ;;

  migrate)
    resolve_stack_from_args "$@"
    parse_flags "$@"
    apply_stack "$STACK"
    cmd_migrate_internal
    ;;

  shell)
    SERVICE="${1:-frontend}"
    apply_stack "core"
    if [[ "$SERVICE" == "backend" ]]; then
      dc exec backend bash
    else
      dc exec frontend sh
    fi
    ;;

  health) cmd_health ;;
  smoke) cmd_smoke ;;

  prod)
    COMPOSE_MODE="prod"
    PROD_CMD="${1:-help}"
    shift || true
    case "$PROD_CMD" in
      up)
        resolve_stack_from_args "$@"
        cmd_up "$STACK" "$@"
        ;;
      down)
        parse_flags "$@"
        cmd_down
        ;;
      build)
        resolve_stack_from_args "$@"
        cmd_build "$STACK" "$@"
        ;;
      migrate)
        resolve_stack_from_args "$@"
        parse_flags "$@"
        apply_stack "$STACK"
        cmd_migrate_internal
        ;;
      health) cmd_health ;;
      *)
        echo "Prod commands: prod up|down|build|migrate|health [stack]"
        exit 1
        ;;
    esac
    ;;

  *)
    echo "Unknown command: $COMMAND" >&2
    usage
    exit 1
    ;;
esac
