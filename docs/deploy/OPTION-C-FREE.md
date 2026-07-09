# Option C — Free testing deployment

Deploy Evoke for **₹0/month** to share a live test URL with stakeholders. Not for production traffic — free tiers sleep, rate-limit, or expire.

Related: [DEPLOYMENT.md](../DEPLOYMENT.md) · [RUN.md](../../RUN.md)

---

## Pick a path

| Path | Cost | Always on? | Difficulty | Best for |
|------|------|------------|------------|----------|
| **C1 — Oracle Cloud** | ₹0 | Yes | Medium | Full platform test (shop, academy, tours, admin) |
| **C2 — Vercel + Render + Neon** | ₹0 | No (cold starts) | Low | Quick UI/API demo, no SSH |
| **C3 — AWS free tier** | ₹0* | Yes (12 mo) | Medium | CI/CD + always-on if you already use AWS |

\* AWS requires a card; small charges possible after free tier.

---

## What works on free tiers

| Feature | C1 Oracle | C2 Split | Notes |
|---------|-----------|----------|-------|
| Public site + admin | Yes | Yes | |
| Auth (Bearer token) | Yes | Yes | Set `FRONTEND_URL` + `CORS_ALLOWED_ORIGINS` on split deploy |
| Academy, shop, tours, CMS | Yes | Yes | |
| File uploads (CMS, avatars) | Yes | Limited | Render disk is ephemeral — uploads lost on redeploy |
| Email / Razorpay / SMS | Optional | Optional | Add keys when testing those flows |
| AI / Ollama | No | No | Needs paid RAM/GPU |
| Queue workers | Optional | Skip | Use `QUEUE_CONNECTION=sync` on free |

---

## Path C1 — Oracle Cloud Always Free (recommended)

Oracle **Ampere A1** gives up to **4 OCPU / 24 GB RAM** forever free — enough for the full Docker stack (no AI).

### Phase 0 — Local smoke test

```powershell
$env:NEXT_PUBLIC_API_URL = "https://YOUR_DOMAIN_OR_IP/api/v1"
.\scripts\run.ps1 prod up mysql --migrate --seed
.\scripts\run.ps1 prod health
```

```bash
export NEXT_PUBLIC_API_URL=https://YOUR_DOMAIN_OR_IP/api/v1
./scripts/run.sh prod up mysql --migrate --seed
./scripts/run.sh prod health
```

### Phase 1 — Create Oracle VM

1. Sign up at [cloud.oracle.com](https://cloud.oracle.com) (card required; Always Free resources stay ₹0).
2. Create an **Ampere A1** instance — Ubuntu 22.04 or 24.04, **2 OCPU / 12 GB RAM** (or max free shape).
3. Open ingress: **22** (SSH), **80**, **443**.
4. Note the public IP.

### Phase 2 — Bootstrap the server

SSH in and run (replace repo URL):

```bash
export EVOKE_REPO=https://github.com/YOUR_ORG/Evoke.git
export EVOKE_BRANCH=master
curl -fsSL "${EVOKE_REPO%/Evoke.git}/raw/${EVOKE_BRANCH}/infra/free/scripts/bootstrap-oracle.sh" | bash
```

Or clone first and run locally:

```bash
git clone --branch master https://github.com/YOUR_ORG/Evoke.git /opt/evoke
sudo bash /opt/evoke/infra/free/scripts/bootstrap-oracle.sh
```

### Phase 3 — Configure env

```bash
cd /opt/evoke
cp infra/free/config/oracle-free.env.example .env.production
cp backend/.env.example backend/.env
nano .env.production
nano backend/.env
```

Generate `APP_KEY`:

```bash
docker run --rm -v /opt/evoke/backend:/app -w /app composer:latest \
  php artisan key:generate --show
```

Minimum values to set:

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://test.yourdomain.com/api/v1` or `http://YOUR_IP:8080/api/v1` |
| `APP_URL` | Same origin as API (no `/api` suffix) |
| `FRONTEND_URL` | `https://test.yourdomain.com` |
| `APP_KEY` | From `key:generate --show` |
| `DB_PASSWORD` | Strong password |

### Phase 4 — Start the stack

```bash
cd /opt/evoke
set -a && source .env.production && set +a

docker compose -f docker-compose.yml -f docker-compose.prod.yml -f infra/free/docker-compose.free.yml \
  --profile mysql --profile proxy up -d --build

docker compose --profile mysql exec backend php artisan migrate --seed --force
docker compose --profile mysql exec backend php artisan storage:link --force
```

Smoke test:

```bash
curl -s http://localhost:8080/api/v1/health
```

Open **http://YOUR_IP:8080** (or your domain after HTTPS). Login: **admin@evoke.com** / **password** (from seeder).

### Phase 5 — HTTPS (optional)

Point an A record to the VM IP, then:

```bash
sudo apt install -y caddy
sudo cp /opt/evoke/infra/vps/Caddyfile.example /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile   # set your domain
sudo systemctl reload caddy
```

Update `.env.production` and `backend/.env` URLs to `https://`, rebuild frontend:

```bash
set -a && source .env.production && set +a
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f infra/free/docker-compose.free.yml \
  --profile mysql --profile proxy up -d --build frontend
```

---

## Path C2 — Vercel + Render + Neon (no SSH)

Split hosting: **Vercel** (Next.js), **Render** (Laravel API), **Neon** (Postgres). Expect **15–60 s cold starts** on Render free.

### Architecture

```
Browser → Vercel (frontend)
              ↓ Bearer token
         Render (Laravel API)
              ↓
         Neon (Postgres, free)
```

### Step 1 — Neon database

1. Create a project at [neon.tech](https://neon.tech) (free tier).
2. Copy connection details (host, database, user, password).

### Step 2 — Render API

1. Push this repo to GitHub.
2. In [Render](https://render.com): **New → Blueprint** → connect repo (uses root `render.yaml`).
3. Set **secret** env vars in the dashboard:

| Key | Value |
|-----|-------|
| `APP_KEY` | `php artisan key:generate --show` |
| `APP_URL` | `https://evoke-api.onrender.com` (your Render URL) |
| `FRONTEND_URL` | `https://your-app.vercel.app` (set after Vercel deploy) |
| `CORS_ALLOWED_ORIGINS` | Same as `FRONTEND_URL` |
| `DB_HOST` | Neon host |
| `DB_DATABASE` | Neon database |
| `DB_USERNAME` | Neon user |
| `DB_PASSWORD` | Neon password |

4. Deploy. Wait for **GET /api/v1/health** to return OK.

### Step 3 — Vercel frontend

1. Import the repo at [vercel.com](https://vercel.com).
2. **Root directory:** `frontend`
3. Framework: **Next.js** (auto-detected).
4. Environment variables:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://evoke-api.onrender.com/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | `Evoke` |

5. Deploy. Copy the Vercel URL.

### Step 4 — Wire CORS

Back in Render, update:

```env
FRONTEND_URL=https://your-app.vercel.app
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

Redeploy the API service.

### Step 5 — Seed demo data (optional)

Render **Shell** tab (or one-off job):

```bash
php artisan migrate --seed --force
```

### Split-deploy limitations

- Render free **spins down** after ~15 minutes idle — first request is slow.
- **Uploaded files** on Render are not durable across deploys.
- Use **Bearer token** auth (already how the frontend works) — no cookie domain setup needed.
- Skip Razorpay/email until you add keys.

---

## Path C3 — AWS free tier

Use the existing AWS runbook — EC2 `t3.micro` (12 months free) + ECR + GitHub Actions:

→ [OPTION-G-AWS.md](OPTION-G-AWS.md)

---

## Free-tier environment reference

Copy templates:

| File | Use |
|------|-----|
| [infra/free/config/oracle-free.env.example](../../infra/free/config/oracle-free.env.example) | Single VM (Oracle / any VPS) |
| [infra/free/config/split-free.env.example](../../infra/free/config/split-free.env.example) | Vercel + Render + Neon |

Lean Laravel settings (no Redis on tiny hosts):

```env
CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

On Render, set `RUN_MIGRATIONS=true` so migrations run on container start.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS error on login | Set `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` to exact Vercel URL (https, no trailing slash) |
| API 502 on Render | Check logs; ensure `PORT` is used (built into `Dockerfile.prod`) |
| Frontend calls localhost API | Rebuild Vercel with correct `NEXT_PUBLIC_API_URL` |
| Oracle out of memory | Use `--profile mysql` only; do not enable `ai` or `full` profiles |
| Uploads disappear on Render | Expected on free — use Oracle/AWS for file upload testing |
| Admin 404 after deploy | Run `migrate --seed`; confirm `NEXT_PUBLIC_API_URL` ends with `/api/v1` |

---

## When to upgrade

Move to [Option A — VPS](OPTION-A-VPS.md) (~₹500–750/mo) when you need:

- Always-on API without cold starts
- Persistent file storage
- Queue workers and scheduled jobs
- Custom domain + email on day one
