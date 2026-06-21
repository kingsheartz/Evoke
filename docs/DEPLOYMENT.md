# Evoke — Deployment Guide

How to put Evoke on the internet: hosting options, budgets, environment setup, and production checklist.

For local development, see [DEVELOPMENT.md](DEVELOPMENT.md).  
For stack runner and progressive setup, see [RUN.md](../RUN.md).

---

## Before you deploy

The repo ships a **development** Docker stack (`docker compose up`). It is optimized for local work, not production:

| Component | Dev setup (`docker compose up`) | Production |
|-----------|----------------------------------|------------|
| Frontend | `npm run dev` in Docker | `next build` + `next start` — see `frontend/Dockerfile.prod` |
| Backend | `php artisan serve` | Production image — see `backend/Dockerfile.prod` (FPM/Octane optional upgrade) |
| Nginx | Routes `/api`, `/`, `/ai` on port 8080 | HTTPS (443), real domain |
| AI + Ollama | Optional in compose | Heavy; skip on small budgets |
| Secrets | Example values in compose | Strong passwords, unique `APP_KEY` |

Use **`docker-compose.prod.yml`** locally to smoke-test production builds (`scripts/run.ps1 prod up`). For AWS, see [Option G](#option-g--aws-ec2--cicd-free-tier) and [infra/aws/README.md](../infra/aws/README.md).

---

## What you are deploying

```
                    ┌─────────────────────────────────────┐
  Browser ──HTTPS──►│  Reverse proxy (Nginx / Caddy)      │
                    │    /        → Next.js (frontend)    │
                    │    /api/*   → Laravel (backend)     │
                    │    /ai/*    → FastAPI (optional)  │
                    └─────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
              PostgreSQL or      Redis            Ollama (optional)
              MySQL              (cache/queue)    (AI only)
```

| Service | Required for core platform | Notes |
|---------|---------------------------|-------|
| Next.js frontend | Yes | Public site + admin UI |
| Laravel API | Yes | REST API, auth, business logic |
| PostgreSQL | Default | Required for AI/RAG (pgvector) |
| MySQL | Optional | Core platform only; lighter on small VPS |
| Redis | Recommended | Queues, sessions, cache; can use file/sync on tiny setups |
| AI service + Ollama | No | Phase 2; needs GPU or large RAM |

---

## Budget guide

### ~₹800/month (recommended constraint)

Realistic for a **small production** or **beta** launch:

| Item | Cost | Notes |
|------|------|-------|
| VPS (1 vCPU, 2 GB RAM) | ₹399–699/mo | Hostinger, Contabo, Hetzner (~€4) |
| Domain (`.in` / `.com`) | ~₹10–15/mo | Amortized yearly |
| SSL | Free | Let's Encrypt via Caddy or Certbot |
| **Total** | **~₹450–750/mo** | |

**On this budget:**

- Run **one VPS** with frontend + backend + MySQL (or Postgres) + Nginx
- **Disable AI/Ollama** until you have more budget or traffic
- Use **MySQL** on 2 GB RAM if Postgres feels tight (see [MySQL on production](#mysql-on-production))
- Skip Laravel Forge, managed Redis, and separate app servers

### ~₹0–200/month (demo / very low traffic)

| Piece | Service | Cost |
|-------|---------|------|
| Frontend | Vercel Hobby | Free |
| Backend | Render / Fly.io free tier | Free (cold starts, limits) |
| Database | Neon / PlanetScale free tier | Free |
| Redis | Upstash free tier | Free |
| Domain | Optional | ~₹100–150/year |

**Tradeoffs:** API may sleep, cold starts, strict limits. Fine for demos, not ideal for a busy shop.

**Alternative:** [Option G](#option-g--aws-ec2--cicd-free-tier) — AWS EC2 t3.micro free tier with full Docker stack (always-on, more setup).

### ~$800/month (USD)

Comfortable budget for managed hosting: Vercel Pro, Laravel Forge + VPS, managed Postgres/Redis, optional cloud LLM API (pay-per-use). Ollama self-hosted still optional.

---

## Deployment options (compared)

| Option | Monthly cost | Difficulty | Best for |
|--------|--------------|------------|----------|
| **A. Single VPS + Docker** | ₹450–750 | Medium | Full control, one bill, ₹800 budget |
| **B. Vercel + VPS (API only)** | ₹400–700 | Medium | Best Next.js performance, split ops |
| **C. Free-tier split** | ₹0–200 | Medium | Demos, internal testing |
| **D. PaaS (Railway / Render)** | ₹500–2000+ | Low–medium | Less SSH, pay per service |
| **E. Laravel Forge + Vercel** | ₹1500+ | Low | Easiest ops, over ₹800 |
| **F. XAMPP / shared PHP only** | — | — | **Not suitable** (no Next.js, no Redis) |
| **G. AWS EC2 + CI/CD** | ₹0–500* | Medium | Free-tier EC2, ECR, GitHub Actions deploy |

\* AWS **t3.micro** free tier (12 months) + domain; small ECR/storage charges possible after free tier.

---

## Option A — Single VPS (best fit for ₹800/month)

**Recommended** when you want one server and one monthly bill.

### Suggested providers

| Provider | Rough price | Notes |
|----------|-------------|-------|
| Hostinger VPS (India) | ₹399–699/mo | Local billing, support |
| Hetzner CX22 | ~€4 (~₹400) | Strong value; EU latency |
| Oracle Cloud Always Free | ₹0 | ARM VM if account approved; DIY setup |

### Minimum server spec

| Resource | Minimum | Better |
|----------|---------|--------|
| RAM | 2 GB | 4 GB |
| CPU | 1 vCPU | 2 vCPU |
| Disk | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 22.04 / 24.04 LTS | |

### Stack on the VPS

1. **Caddy** or **Nginx** on the host — HTTPS (Let's Encrypt), proxy to containers
2. **Docker Compose** — frontend (prod build), backend (FPM or Octane), MySQL or Postgres, Redis
3. **Do not run** `ai-service` and `ollama` unless you upgrade RAM/CPU significantly

### High-level steps

```bash
# On the VPS (Ubuntu)
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git

git clone <your-repo-url> /opt/evoke
cd /opt/evoke

# Copy and edit env files (see Production environment below)
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Production smoke test (next start, APP_ENV=production):
# ./scripts/run.sh prod up core --migrate

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan config:cache
docker compose exec backend php artisan route:cache
```

Point your domain A record to the VPS IP. Terminate TLS at Caddy/Nginx.

### MySQL on production

On a **2 GB VPS**, MySQL often uses less memory than PostgreSQL + pgvector:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=evoke
DB_USERNAME=evoke
DB_PASSWORD=<strong-password>
```

Use `docker compose --profile mysql up` locally to test; in production, run MySQL as a compose service or install on the host.

**Limitation:** AI/RAG vector search requires PostgreSQL + pgvector. Core Academy, Shop, Tours, CMS, and auth work on MySQL.

Details: [DEVELOPMENT.md — MySQL / XAMPP](DEVELOPMENT.md#mysql--xampp-optional).

---

## Option B — Vercel (frontend) + VPS (backend)

Split hosting when you want **fast global frontend** and a **simple API server**.

| Part | Host | Build |
|------|------|-------|
| Frontend | [Vercel](https://vercel.com) | Connect `frontend/` repo or monorepo root |
| API + DB + Redis | VPS or Railway | Laravel + MySQL/Postgres + Redis |

### Vercel settings

- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output:** Next.js default

### Environment (Vercel)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_NAME=Evoke
```

### Environment (Laravel on VPS)

```env
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
SESSION_DOMAIN=.yourdomain.com
```

Configure CORS so the Vercel origin can call the API with Sanctum cookies if you use cookie-based SPA auth.

**Pros:** Automatic frontend SSL and CDN; API stays on a cheap VPS.  
**Cons:** Two places to configure; cross-origin auth needs correct Sanctum/CORS setup.

---

## Option C — Free-tier split (demo only)

| Service | Role |
|---------|------|
| Vercel | Next.js frontend |
| Render free web service | Laravel (`php artisan serve` or Docker) |
| Neon free Postgres | Database |
| Upstash free Redis | Cache / queues |

Set the same env vars as Option B. Expect cold starts and usage caps.

---

## Option D — Railway / Render / Fly.io

Connect the GitHub repo and define services:

- **frontend** — build `frontend/`, run `npm start`
- **backend** — build `backend/`, run Octane or FPM
- **postgres** / **redis** — platform plugins

Easier than raw VPS if you prefer dashboards over SSH. Cost scales with services; often **above ₹800** for always-on production.

---

## Option E — Laravel Forge + Vercel

[Forge](https://forge.laravel.com) provisions the VPS, Nginx, SSL, queue workers, and scheduler for Laravel. Deploy frontend to Vercel.

**Cost:** Forge (~$12/mo) + VPS (~$6/mo) ≈ **₹1,500+/mo** — above the ₹800 target, but the **lowest-effort** paid path.

---

## Option G — AWS EC2 + CI/CD (free tier)

Run Evoke on a **t3.micro EC2** instance with images in **ECR**, built and deployed by **GitHub Actions** or **AWS CodeBuild**. All public URLs are configurable via `deploy.env` and GitHub repository variables.

| Piece | AWS service |
|-------|-------------|
| Host | EC2 `t3.micro` (free tier eligible) |
| Images | ECR (`evoke-frontend`, `evoke-backend`) |
| Build | GitHub Actions (`.github/workflows/build.yml`, `deploy-aws.yml`) or CodeBuild (`infra/aws/buildspec.yml`) |
| Deploy | SSM Run Command → `infra/aws/scripts/deploy.sh` on EC2 |
| Stack on host | `infra/aws/docker-compose.aws.yml` (nginx + MySQL + Redis) |

**Pros:** Free-tier friendly, repeatable CI/CD, OIDC deploy (no long-lived AWS keys in GitHub).  
**Cons:** More AWS setup than a plain VPS; MySQL default (no AI/RAG); HTTPS requires Caddy/Certbot or ALB on the host.

### Quick start

1. Deploy CloudFormation stacks in [infra/aws/cloudformation/](../infra/aws/cloudformation/)
2. Configure `/opt/evoke/deploy.env` from [infra/aws/config/deploy.env.example](../infra/aws/config/deploy.env.example)
3. Set GitHub variables: `NEXT_PUBLIC_API_URL`, `ECR_REGISTRY`, `AWS_DEPLOY_ROLE_ARN`, `EC2_INSTANCE_ID`
4. Run the **Deploy AWS** workflow or push to `main` with `AUTO_DEPLOY_ON_PUSH=true`

Full steps: **[infra/aws/README.md](../infra/aws/README.md)**

---

## What not to use for production

| Approach | Why it fails |
|----------|--------------|
| **XAMPP alone** | No Node.js for Next.js; weak for queues and Redis |
| **Shared PHP hosting only** | Cannot run Next.js admin/site on the same host |
| **Dev Docker as-is on a server** | `next dev` and `artisan serve` are not production-grade |
| **Ollama on 2 GB VPS** | Models need several GB RAM; blows the budget |

XAMPP/MySQL is fine for **local development** — see [DEVELOPMENT.md](DEVELOPMENT.md).

---

## Production environment

### Backend (`backend/.env`)

```env
APP_NAME=Evoke
APP_ENV=production
APP_DEBUG=false
APP_KEY=                          # php artisan key:generate
APP_URL=https://api.yourdomain.com
APP_TIMEZONE=Asia/Kolkata

FRONTEND_URL=https://yourdomain.com

LOG_CHANNEL=stack
LOG_LEVEL=warning

DB_CONNECTION=mysql                 # or pgsql for AI
DB_HOST=...
DB_PORT=...
DB_DATABASE=evoke
DB_USERNAME=...
DB_PASSWORD=...

SESSION_DRIVER=redis
SESSION_DOMAIN=.yourdomain.com
QUEUE_CONNECTION=redis
CACHE_STORE=redis
REDIS_HOST=...
REDIS_PORT=6379

SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com

MAIL_MAILER=resend
RESEND_API_KEY=...

RAZORPAY_KEY=...
RAZORPAY_SECRET=...

# Omit or disable if not running AI
# AI_SERVICE_URL=http://ai-service:8001
```

### Frontend (`frontend/.env.local` or host env)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_NAME=Evoke
```

On Docker internal networking (single VPS), you may also set:

```env
INTERNAL_API_URL=http://backend:8000/api/v1
```

for server-side Next.js requests inside the compose network.

---

## Post-deploy checklist

Run once after first deploy and after major config changes:

```bash
cd backend

php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link
```

Ensure these processes are **always running** in production:

| Process | Purpose |
|---------|---------|
| Queue worker | `php artisan queue:work redis` — emails, notifications, jobs |
| Scheduler | Cron: `* * * * * php artisan schedule:run` |

The dev `docker-compose.yml` includes `queue-worker` and `scheduler` services; mirror that in production.

### Security

- [ ] `APP_DEBUG=false`, `APP_ENV=production`
- [ ] Strong DB and Redis passwords
- [ ] HTTPS everywhere
- [ ] Firewall: only 80, 443, and SSH (prefer key-only SSH)
- [ ] Rate limiting configured for API routes
- [ ] Backups: database daily, `storage/` if uploads matter
- [ ] Do not commit `.env` files

### DNS layout (examples)

**Single domain (VPS):**

| Record | Points to |
|--------|-----------|
| `yourdomain.com` | VPS IP |
| `www` | VPS IP or CNAME |

Nginx/Caddy routes `/api` to Laravel and `/` to Next.js (see `docker/nginx/default.conf`).

**Split (Vercel + API subdomain):**

| Record | Points to |
|--------|-----------|
| `yourdomain.com` | Vercel |
| `api.yourdomain.com` | VPS IP |

---

## AI service (optional)

Enable only when you have **PostgreSQL + pgvector** and enough RAM (8 GB+ recommended for Ollama):

1. Run `postgres` (pgvector image), `ollama`, and `ai-service` from compose or separate server
2. Set `AI_SERVICE_URL` on the backend
3. Pull models: `ollama pull qwen3`, `ollama pull nomic-embed-text`

For ₹800/month, prefer **disabling AI** or using a **hosted LLM API** (Groq, OpenAI) with pay-per-use instead of self-hosted Ollama.

---

## HTTPS

| Method | When to use |
|--------|-------------|
| **Caddy** | Automatic Let's Encrypt on VPS; simplest |
| **Certbot + Nginx** | Traditional; manual renewal setup |
| **Cloudflare proxy** | Free SSL + CDN; set SSL mode to Full (strict) |
| **Vercel / Render** | Automatic on their domains |

The in-repo Nginx config listens on **port 80** only. Terminate TLS on the host reverse proxy or Cloudflare, not inside the dev compose file as-is.

---

## Recommended path by goal

| Goal | Path |
|------|------|
| **Launch on ₹800/mo** | Option A — one VPS, MySQL, no AI, Caddy + Docker |
| **Best frontend UX, same budget** | Option B — Vercel free + cheap VPS for API |
| **Quick demo, no cost** | Option C — free tiers |
| **AWS free tier + automated deploy** | Option G — EC2 + ECR + GitHub Actions |
| **Minimal DevOps, higher budget** | Option E — Forge + Vercel |
| **Full AI on your own hardware** | Separate GPU/large VPS; not ₹800 |

---

## Repo production assets

Already in the repository:

| Asset | Purpose |
|-------|---------|
| `docker-compose.prod.yml` | Production overrides (no bind mounts, prod frontend image) |
| `frontend/Dockerfile.prod` | Multi-stage `next build` + standalone `node server.js` |
| `backend/Dockerfile.prod` | Production API image (`composer --no-dev`) |
| `.github/workflows/build.yml` | CI — lint, build, Docker smoke test |
| `.github/workflows/deploy-aws.yml` | Build → ECR → deploy EC2 via SSM |
| `infra/aws/` | AWS compose, scripts, CloudFormation, CodeBuild spec |

### Still optional (future)

- Backend image with **PHP-FPM + Nginx** (or Laravel Octane) instead of `artisan serve`
- Example **Caddyfile** for single-domain HTTPS on VPS/EC2
- GitHub Actions deploy workflow for **generic VPS** (SSH, not AWS-only)
- `docker-compose.prod.yml` profile for **PostgreSQL + AI** on larger hosts

---

## Related docs

- [DEVELOPMENT.md](DEVELOPMENT.md) — local Docker, dev scripts, MySQL profile
- [RUN.md](../RUN.md) — stack runner, `prod up`, progressive setup
- [infra/aws/README.md](../infra/aws/README.md) — AWS build & deploy pipelines (Option G)
- [README.md](../README.md) — architecture and quick start
