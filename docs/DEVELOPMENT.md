# Evoke — Development Guide

Quick reference for running the platform locally, fixing common Docker issues, and verifying that UI changes actually show up in the browser.

## URLs

| What | URL |
|------|-----|
| **Frontend (use this for UI work)** | http://localhost:3000 |
| API (direct) | http://localhost:8000/api/v1 |
| Nginx proxy (API + frontend) | http://localhost:8080 |
| Admin login | http://localhost:3000/login |
| Admin panel | http://localhost:3000/admin |
| AI service | http://localhost:8001 |

**Default admin** (after `migrate --seed`): `admin@evoke.com` / `password`

---

## First-time setup

```powershell
# From repo root (d:\WORK\Projects\Evoke)

# 1. Copy env files
copy .env.example .env
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local

# 2. Start everything
docker compose up -d --build

# 3. Backend (first run only)
docker compose exec backend composer install
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate --seed

# 4. Frontend deps (if package.json changed)
docker compose exec frontend npm install

# 5. Optional: AI models
docker compose exec ollama ollama pull qwen3
docker compose exec ollama ollama pull nomic-embed-text
```

---

## Daily development (most used commands)

### Start / stop

```powershell
docker compose up -d              # Start all services
docker compose down               # Stop all services
docker compose ps                 # See what's running
docker compose logs -f frontend   # Tail frontend logs
docker compose logs -f backend    # Tail backend logs
```

### Frontend only

```powershell
docker compose up -d frontend
docker compose restart frontend
docker compose exec frontend npm install    # After package.json changes
```

### Backend only

```powershell
docker compose exec backend php artisan migrate
docker compose exec backend php artisan migrate --seed
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan route:list
docker compose exec backend composer install
```

### Shell into a container

```powershell
docker compose exec frontend sh
docker compose exec backend bash
```

---

## Helper scripts (recommended)

Same commands across shells — run from the **repo root**:

| Command | PowerShell | CMD | WSL / Linux / macOS |
|---------|------------|-----|---------------------|
| Start stack | `.\scripts\dev.ps1 up` | `scripts\dev.cmd up` | `./scripts/dev.sh up` |
| Stop stack | `.\scripts\dev.ps1 down` | `scripts\dev.cmd down` | `./scripts/dev.sh down` |
| Status | `.\scripts\dev.ps1 status` | `scripts\dev.cmd status` | `./scripts/dev.sh status` |
| Logs | `.\scripts\dev.ps1 logs frontend` | `scripts\dev.cmd logs frontend` | `./scripts/dev.sh logs frontend` |
| Fix stale UI | `.\scripts\dev.ps1 reset-frontend` | `scripts\dev.cmd reset-frontend` | `./scripts/dev.sh reset-frontend` |
| Verify UI | `.\scripts\dev.ps1 verify-ui` | `scripts\dev.cmd verify-ui` | `./scripts/dev.sh verify-ui` |
| Verify admin sidebar | `.\scripts\dev.ps1 verify-admin` | `scripts\dev.cmd verify-admin` | `./scripts/dev.sh verify-admin` |
| Migrate + seed | `.\scripts\dev.ps1 migrate` | `scripts\dev.cmd migrate` | `./scripts/dev.sh migrate` |
| Install deps | `.\scripts\dev.ps1 install` | `scripts\dev.cmd install` | `./scripts/dev.sh install` |
| Shell | `.\scripts\dev.ps1 shell frontend` | `scripts\dev.cmd shell frontend` | `./scripts/dev.sh shell frontend` |
| Build frontend | `.\scripts\dev.ps1 build-frontend` | `scripts\dev.cmd build-frontend` | `./scripts/dev.sh build-frontend` |

**PowerShell** (Windows):

```powershell
.\scripts\dev.ps1 help
.\scripts\dev.ps1 up
.\scripts\dev.ps1 reset-frontend
.\scripts\dev.ps1 verify-ui
.\scripts\dev.ps1 verify-admin
```

**CMD** (Windows Command Prompt):

```cmd
scripts\dev.cmd help
scripts\dev.cmd up
scripts\dev.cmd reset-frontend
scripts\dev.cmd verify-ui
scripts\dev.cmd verify-admin
```

**WSL / Linux / macOS** (make executable once: `chmod +x scripts/dev.sh`):

```bash
./scripts/dev.sh help
./scripts/dev.sh up
./scripts/dev.sh reset-frontend
./scripts/dev.sh verify-ui
./scripts/dev.sh verify-admin
```

---

## Hero background video

The default hero video is committed in the repo at `frontend/public/videos/EVOKE-videoplayback.mp4` and served at `/videos/EVOKE-videoplayback.mp4`.

**Change it in admin:** http://localhost:3000/admin/cms/homepage

- Set **Background Type** → `Video`
- Set **Video URL** → `/videos/EVOKE-videoplayback.mp4` (or your own URL)
- Click **Save Homepage**, then hard-refresh the public site

---

## The Docker UI problem (why you don't see changes)

### What was wrong

`docker-compose.yml` used to mount a **separate anonymous volume** for `/app/.next`:

```yaml
volumes:
  - ./frontend:/app      # your source code (bind mount)
  - /app/node_modules    # Linux node_modules (correct)
  - /app/.next           # PROBLEM: persisted old compiled Next.js output
```

Your **source files on disk updated**, but the **dev server kept serving an old `.next` build** from that hidden volume. CSS sometimes refreshed while React components did not — so the app looked unchanged or half-updated.

### What we fixed

The `/app/.next` volume mount was **removed**. The build cache now lives on the bind-mounted `./frontend` tree (gitignored), so when you change code, Turbopack can rebuild correctly.

### When UI still looks stale

Run the reset script:

```powershell
.\scripts\dev.ps1 reset-frontend
```

```cmd
scripts\dev.cmd reset-frontend
```

```bash
./scripts/dev.sh reset-frontend
```

Or manually:

```powershell
docker compose stop frontend
docker compose rm -f -v frontend
Remove-Item -Recurse -Force frontend\.next -ErrorAction SilentlyContinue
docker compose up -d frontend
```

Then in the browser: **hard refresh** with `Ctrl + Shift + R` (or try an incognito window).

### How to verify the new UI is live

**PowerShell:**

```powershell
.\scripts\dev.ps1 verify-ui
.\scripts\dev.ps1 verify-admin
```

**CMD:**

```cmd
scripts\dev.cmd verify-ui
scripts\dev.cmd verify-admin
```

**WSL / bash:**

```bash
./scripts/dev.sh verify-ui
./scripts/dev.sh verify-admin
```

You should see markers like `Premium Multi-Business Platform`, `mesh-bg`, and `font-display` in the HTML. If you see `bg-white text-zinc-900` instead, the cache is still stale — run `reset-frontend` again.

---

## Working without Docker (frontend)

If Docker keeps getting in the way for UI work, run Next.js on the host:

```powershell
cd frontend
npm install
npm run dev
```

Ensure `frontend/.env.local` has:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Backend must still be running (Docker or local) on port 8000.

---

## Working without Docker (backend)

```powershell
cd backend
composer install
php artisan serve
```

Requires local PostgreSQL (pgvector) and Redis matching `backend/.env`.

---

## Common issues

| Symptom | Fix |
|---------|-----|
| UI unchanged after edits | `dev reset-frontend` (see helper scripts table) then `Ctrl+Shift+R` |
| `ERR_NAME_NOT_RESOLVED` on login | Use http://localhost:3000 (not a Docker-internal hostname). Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local` |
| CSRF 419 on login | Restart backend: `docker compose restart backend` |
| Missing npm package (e.g. `@dnd-kit`) | `docker compose exec frontend npm install` then restart frontend |
| Database connection error | `docker compose exec backend php artisan migrate` — ensure postgres is healthy: `docker compose ps` |
| Port already in use | Stop other stacks or change ports in `docker-compose.yml` |
| Changes not on disk | UI work from this repo may be **uncommitted** — run `git status` in the project root |

---

## Project layout (frontend)

```
frontend/src/
├── app/
│   ├── (site)/          # Public pages (home, academy, shop, tours)
│   ├── admin/           # Admin panel
│   ├── login/
│   └── globals.css      # Design tokens, glass, animations
├── components/
│   ├── ui/              # Button, Card, DataTable, etc.
│   ├── layout/          # Header, footer, mobile nav
│   ├── home/            # Hero, bento cards, features
│   └── admin/           # Sidebar, header, auth guard
└── lib/                 # API client, notifications, utils
```

---

## Git / uncommitted work

Recent UI upgrades may exist only as **local changes**. Check:

```powershell
git status
git diff --stat
```

Commit when ready:

```powershell
git add -A
git commit -m "feat: premium UI overhaul and dev tooling"
```

---

## Production build (smoke test)

```powershell
docker compose exec frontend npm run build
```

If this passes, TypeScript and Next.js compile cleanly inside the container.
