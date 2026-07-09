# Evoke — Run Guide

Start and test Evoke **without configuring everything upfront**. Pick a **stack** (only the services you need), run **migrate when ready**, add AI/payments/email later.

## Which script to use

| Shell | Command prefix | Example |
|-------|----------------|---------|
| **PowerShell** | `.\scripts\run.ps1` | `.\scripts\run.ps1 up core --migrate --seed` |
| **CMD** | `scripts\run.cmd` | `scripts\run.cmd up core --migrate --seed` |
| **WSL / Linux / macOS** | `./scripts/run.sh` | `./scripts/run.sh up core --migrate --seed` |

All three support the **same commands, stacks, and flags**. Use the row that matches your terminal.

For day-to-day UI work (stale cache, verify admin): [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)  
For VPS / hosting options: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)  
For **free testing** deploy (₹0): [docs/deploy/OPTION-C-FREE.md](docs/deploy/OPTION-C-FREE.md)

---

## Fastest path (3 commands)

**PowerShell**

```powershell
.\scripts\run.ps1 init
.\scripts\run.ps1 up core --migrate --seed
.\scripts\run.ps1 smoke
```

**CMD**

```cmd
scripts\run.cmd init
scripts\run.cmd up core --migrate --seed
scripts\run.cmd smoke
```

**WSL / Linux / macOS**

```bash
chmod +x scripts/run.sh
./scripts/run.sh init
./scripts/run.sh up core --migrate --seed
./scripts/run.sh smoke
```

Open **http://localhost:3000** — login **admin@evoke.com** / **password**

No Razorpay, email, SMS, or AI keys required for this.

---

## `run` vs `dev`

| Script | Purpose |
|--------|---------|
| **`scripts/run.*`** | Stack orchestration — what to start, prod mode, migrate, health |
| **`scripts/dev.*`** | UI troubleshooting — `reset-frontend`, `verify-ui`, `verify-admin` |

Both work on **PowerShell, CMD, and WSL** — use `run.ps1`, `run.cmd`, or `run.sh` respectively.

| Script | Shell |
|--------|-------|
| `scripts/run.ps1` | PowerShell |
| `scripts/run.cmd` | CMD (native, no PowerShell required) |
| `scripts/run.sh` | WSL / Linux / macOS |

---

## Stacks (pick one)

You do **not** need the full platform running to develop or test.

| Stack | Services started | Use when |
|-------|------------------|----------|
| **`core`** (default) | frontend, backend, postgres, redis | CMS, shop, academy, auth — most dev |
| **`web`** | core + nginx (:8080) | Test single-host routing like production proxy |
| **`mysql`** | frontend, backend, mysql, redis | Lighter DB, XAMPP-style, no AI |
| **`workers`** | core + queue-worker + scheduler | Background jobs, scheduled tasks |
| **`ai`** | core + ai-service + ollama | Chatbot / RAG (heavy RAM) |
| **`full`** | nginx + workers + ai + postgres | Everything except MySQL |

Optional services use Docker Compose **profiles** — they stay off until you choose a stack.

### Examples

```powershell
# Default dev
.\scripts\run.ps1 up core

# Lighter MySQL stack
.\scripts\run.ps1 up mysql --migrate --seed

# Add unified proxy
.\scripts\run.ps1 up web

# Background workers only when needed
.\scripts\run.ps1 up workers

# AI (pull models after first start)
.\scripts\run.ps1 up ai
docker compose exec ollama ollama pull qwen3
docker compose exec ollama ollama pull nomic-embed-text

# Full stack
.\scripts\run.ps1 up full --migrate
```

---

## Commands

| Command | Description |
|---------|-------------|
| `init` | Copy `.env` examples if missing (never overwrites unless `--force`) |
| `up [stack]` | Start stack (detached) |
| `down` | Stop all containers |
| `down --volumes` | Stop and **delete** database volumes |
| `status` | Container status |
| `logs [service]` | Follow logs (default: `frontend`) |
| `restart [service]` | Restart one service |
| `install` | `composer install` + `npm install` in containers |
| `migrate [stack]` | Run migrations |
| `shell [service]` | Shell into `frontend` or `backend` |
| `health` | HTTP checks (frontend + API) |
| `smoke` | health + homepage markers + DB connectivity |
| `build [stack]` | Build images without starting |
| `stacks` | Print stack descriptions |

### Flags (with `up`, `build`, `migrate`)

| Flag | Effect |
|------|--------|
| `--migrate` | Run migrations after `up` |
| `--seed` | Migrate with demo data |
| `--fresh` | `migrate:fresh --seed` (**wipes DB**) |
| `--no-build` / `--watch` | Skip image rebuild; use for daily dev (hot reload) |
| `--pull` | Pull base images first |
| `--foreground` / `-f` | Attach logs (no `-d`) |
| `--force` | `init`: overwrite env files from examples |

---

## Hot reload (why code changes apply without rebuild)

In **dev mode** (default `up core`, not `prod up`), Evoke is set up for live editing:

| Piece | How it works |
|-------|----------------|
| **Frontend** | `./frontend` is bind-mounted into the container; `npm run dev` (Next.js) recompiles on save |
| **Backend** | `./backend` is bind-mounted; PHP picks up changes immediately |
| **No stale `.next` cache** | The dev compose file does **not** use a separate Docker volume for `.next` |

So you edit files on disk → containers see them → the dev servers refresh. You only need a **full image rebuild** when dependencies or Dockerfiles change (`package.json`, `composer.json`, etc.).

### Daily workflow

**First time** (or after dependency/Dockerfile changes):

```bash
./scripts/run.sh up core --migrate --seed
```

**Every day after** (containers already built — skip rebuild, keep hot reload):

```bash
./scripts/run.sh up core --watch --migrate
# or:  --no-build  (same thing)
```

If containers are already running, you usually don't need `up` at all — just save files and refresh the browser. Use `down` / `up --watch` when restarting Docker.

**When you *do* need a rebuild:**

```bash
./scripts/run.sh up core --migrate          # default: rebuilds if Dockerfile/deps changed
./scripts/run.sh build core && ./scripts/run.sh up core --watch
./scripts/dev.sh reset-frontend             # UI still stale after code changes
```

**Production** (`prod up`) is different: code is baked into images at build time — you must rebuild after changes.

---

## Production mode (local smoke test)

Test a **production-like** build on your machine before deploying to a VPS. Uses `docker-compose.prod.yml` + `frontend/Dockerfile.prod` (`next build` → `next start`).

```powershell
.\scripts\run.ps1 prod up core --migrate
.\scripts\run.ps1 prod health
.\scripts\run.ps1 prod down
```

Set production URLs before `prod up` if testing real domains:

```env
# frontend/.env.local or shell env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

For server deployment: [docs/deploy/README.md](docs/deploy/README.md) (Option A VPS or AWS).

---

## Progressive setup (what to configure when)

| Phase | Do this | Skip for now |
|-------|---------|--------------|
| **1. Smoke test** | `init` → `up core --migrate --seed` | Payments, email, AI |
| **2. Feature dev** | Keep `core`, use `dev.ps1 reset-frontend` if UI stale | Workers, nginx |
| **3. Jobs / cron** | `up workers` | AI |
| **4. MySQL path** | `up mysql --migrate` | Postgres, AI |
| **5. AI features** | `up ai` + ollama model pulls | — |
| **6. Pre-deploy** | `prod up core --migrate`, `prod health` | Live domain SSL |
| **7. Free test deploy** | [OPTION-C-FREE.md](docs/deploy/OPTION-C-FREE.md) — Oracle or Vercel+Render | — |
| **8. Go live** | VPS → [OPTION-A-VPS.md](docs/deploy/OPTION-A-VPS.md) · AWS → [OPTION-G-AWS.md](docs/deploy/OPTION-G-AWS.md) | — |

### Optional env (add when needed)

| Keys | File | When |
|------|------|------|
| `RAZORPAY_*` | `backend/.env` | Shop checkout |
| `RESEND_API_KEY` | `backend/.env` | Transactional email |
| `MSG91_*` | `backend/.env` | SMS |
| `AI_SERVICE_URL` | `backend/.env` | Only with `ai` stack |

---

## URLs

| What | URL |
|------|-----|
| Frontend | http://localhost:3000 |
| Admin login | http://localhost:3000/login |
| API | http://localhost:8000/api/v1 |
| API health | http://localhost:8000/api/v1/health |
| Nginx proxy (`web` / `full`) | http://localhost:8080 |
| AI service (`ai` / `full`) | http://localhost:8001 |

---

## Shell reference (all platforms)

### PowerShell

```powershell
.\scripts\run.ps1 init
.\scripts\run.ps1 up core --migrate --seed
.\scripts\run.ps1 up mysql --migrate
.\scripts\run.ps1 logs backend
.\scripts\run.ps1 migrate --seed
.\scripts\run.ps1 shell backend
.\scripts\run.ps1 down
.\scripts\run.ps1 prod up core --migrate
```

### CMD

```cmd
scripts\run.cmd init
scripts\run.cmd up core --migrate --seed
scripts\run.cmd health
scripts\run.cmd down
```

### WSL

```bash
./scripts/run.sh init
./scripts/run.sh up core --migrate --seed
./scripts/run.sh health
./scripts/run.sh down
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No database / backend crash on start | Use a stack with a DB: `up core` or `up mysql`, not bare `docker compose up` |
| UI looks old / unchanged | `.\scripts\dev.ps1 reset-frontend` |
| Most pages show **404** (especially `/admin/...`) | Turbopack + Windows Docker mounts — fixed in dev via webpack; run `.\scripts\dev.ps1 reset-frontend` then hard-refresh |
| Port already in use | Stop other stacks: `run down` |
| `Network evoke_evoke-network Resource is still in use` after `down` | Postgres (or other profiled services) was still running. Use the updated `run down` (stops all profiles), or manually: `docker stop evoke-postgres-1` then `docker compose --profile full --profile mysql down --remove-orphans` |
| Docker shows `<none>` images after restart | Dangling layers from rebuilds — safe to remove: `docker image prune -f` |
| MySQL migrations fail | Ensure stack is `mysql`, not `core` |
| AI errors | Use `core` stack; AI needs `ai` stack + Postgres + model pulls |
| WSL `bash\r` error | Windows CRLF line endings. Fix once: `python -c "p='scripts/run.sh'; open(p,'wb').write(open(p,'rb').read().replace(b'\\r\\n',b'\\n'))"` (run from repo root). Or: `git add --renormalize scripts/run.sh scripts/dev.sh && git checkout -- scripts/` |

---

## Under the hood

- **`docker-compose.yml`** — base services; optional parts gated by profiles (`pgsql`, `mysql`, `proxy`, `workers`, `ai`, `full`)
- **`docker-compose.prod.yml`** — production overrides (no frontend bind mount, `APP_ENV=production`)
- **`scripts/run.*`** — maps stack names → compose profiles + DB env vars

Direct compose (advanced):

```bash
docker compose --profile pgsql up -d --build
docker compose --profile mysql up -d --build
```

Prefer `scripts/run.*` so stack names and migrate flags stay consistent.
