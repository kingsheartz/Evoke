# Option A — Production on a single VPS

Deploy Evoke on one VPS with Docker Compose: Next.js, Laravel, MySQL, Redis, Nginx, queue worker, and scheduler.

**Budget:** ~₹450–750/month (Hostinger, Hetzner, Contabo, etc.)  
**Difficulty:** Medium — SSH + Docker, no AWS required

Related: [DEPLOYMENT.md](../DEPLOYMENT.md) · [RUN.md](../../RUN.md) · [infra/vps/Caddyfile.example](../../infra/vps/Caddyfile.example)

---

## Architecture

```
Browser ──HTTPS──► Caddy (host, :443)
                      │
                      ▼
                 Nginx container (:80)
                   /      → frontend:3000
                   /api/* → backend:8000
                      │
            MySQL + Redis (containers)
            queue-worker + scheduler
```

TLS terminates on **Caddy** (recommended) or Certbot on the host. The in-repo Nginx container handles routing only on port 80 internally.

---

## Phase 0 — Local smoke test (do first)

On your dev machine, confirm production builds work:

```powershell
# Windows — use your real production API URL
$env:NEXT_PUBLIC_API_URL = "https://yourdomain.com/api/v1"
.\scripts\run.ps1 prod up mysql --migrate
.\scripts\run.ps1 prod health
```

```bash
export NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
./scripts/run.sh prod up mysql --migrate
./scripts/run.sh prod health
```

Fix migrations, build errors, and env issues **before** renting a server.

---

## Phase 1 — Provision the VPS

### Minimum spec

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 2 GB | 4 GB |
| CPU | 1 vCPU | 2 vCPU |
| Disk | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 22.04 or 24.04 LTS | |

### Suggested providers

| Provider | Rough cost | Notes |
|----------|------------|-------|
| Hostinger VPS | ₹399–699/mo | India billing |
| Hetzner CX22 | ~€4/mo | Strong value |
| Oracle Cloud Always Free | ₹0 | ARM; more DIY |

### Firewall

Open only:

| Port | Purpose |
|------|---------|
| 22 | SSH (key-only; optional if using another access method) |
| 80 | HTTP (Caddy / Certbot) |
| 443 | HTTPS |

---

## Phase 2 — Install Docker on the VPS

SSH into the server as root or sudo user:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin git curl

sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# Log out and back in so docker group applies
```

Verify:

```bash
docker compose version
```

---

## Phase 3 — Clone and configure

```bash
sudo mkdir -p /opt/evoke
sudo chown $USER:$USER /opt/evoke
git clone --branch master https://github.com/YOUR_ORG/Evoke.git /opt/evoke
cd /opt/evoke
```

Copy the production env template:

```bash
cp infra/vps/config/production.env.example /opt/evoke/.env.production
cp backend/.env.example backend/.env
```

Edit **`/opt/evoke/.env.production`** — shell env used by Docker Compose for build args and URLs:

```bash
nano /opt/evoke/.env.production
```

Edit **`backend/.env`** for Laravel:

```bash
nano /opt/evoke/backend/.env
```

### URL layouts

**Single domain (recommended)** — one nginx proxy, simplest Sanctum setup:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://yourdomain.com/api/v1` |
| `APP_URL` | `https://yourdomain.com` |
| `FRONTEND_URL` | `https://yourdomain.com` |
| `SANCTUM_STATEFUL_DOMAINS` | `yourdomain.com,www.yourdomain.com` |
| `SESSION_DOMAIN` | `.yourdomain.com` |

**Split subdomain** — API on `api.yourdomain.com`:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com/api/v1` |
| `APP_URL` | `https://api.yourdomain.com` |
| `FRONTEND_URL` | `https://yourdomain.com` |

### Required secrets

Generate `APP_KEY` locally or on the server:

```bash
cd /opt/evoke
docker compose run --rm backend php artisan key:generate --show
```

Paste into `backend/.env` as `APP_KEY=base64:...`

Also set:

- `APP_ENV=production`, `APP_DEBUG=false`
- Strong `DB_PASSWORD` (and MySQL root password if you customize compose)
- `RAZORPAY_*`, `RESEND_API_KEY` when going live with shop/email

### MySQL (recommended on 2 GB RAM)

In `backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=evoke
DB_USERNAME=evoke
DB_PASSWORD=<strong-password>
```

**Note:** AI/RAG needs PostgreSQL + pgvector. Core shop, academy, tours, CMS, and auth work on MySQL.

---

## Phase 4 — First deploy (Docker Compose)

Load production env and start the stack:

```bash
cd /opt/evoke
set -a && source .env.production && set +a

docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  --profile mysql \
  --profile proxy \
  --profile workers \
  up -d --build
```

This starts:

- **frontend** — production Next.js image
- **backend** — Laravel API
- **nginx** — routes `/` and `/api`
- **mysql**, **redis**
- **queue-worker**, **scheduler**

### Post-deploy commands

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --profile mysql exec backend php artisan migrate --force

docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --profile mysql exec backend php artisan config:cache

docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --profile mysql exec backend php artisan route:cache

docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --profile mysql exec backend php artisan storage:link --force
```

Verify internally:

```bash
curl -fsS http://127.0.0.1:8080/api/v1/health
```

(Port 8080 is the nginx proxy mapped in compose.)

---

## Phase 5 — DNS

Point your domain to the VPS public IP:

| Record | Type | Value |
|--------|------|-------|
| `@` | A | `<VPS_IP>` |
| `www` | A or CNAME | `<VPS_IP>` or `yourdomain.com` |

Wait for propagation, then continue to HTTPS.

---

## Phase 6 — HTTPS with Caddy (recommended)

Install Caddy on the **host** (not in compose):

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

Copy and edit the example Caddyfile:

```bash
sudo cp /opt/evoke/infra/vps/Caddyfile.example /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile
# Replace yourdomain.com with your domain
```

The example proxies HTTPS → `127.0.0.1:8080` (nginx container).

Reload Caddy:

```bash
sudo systemctl reload caddy
```

Verify:

```bash
curl -fsS https://yourdomain.com/api/v1/health
```

---

## Phase 7 — Go-live verification

In the browser:

- [ ] Public homepage loads over HTTPS
- [ ] Admin sign-in works
- [ ] CMS pages render
- [ ] Shop checkout (if Razorpay configured)
- [ ] Password reset / email (if Resend configured)

On the server:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile mysql ps
# queue-worker and scheduler should be Up
```

---

## Updating production (manual deploy)

After pulling code changes:

```bash
cd /opt/evoke
git pull
set -a && source .env.production && set +a

docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  --profile mysql --profile proxy --profile workers \
  up -d --build

docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --profile mysql exec backend php artisan migrate --force
```

Rebuild is required when frontend or backend code changes (images are baked at build time).

---

## Troubleshooting

| Symptom | Check |
|---------|-------|
| 502 from Caddy | `docker compose ps` — is nginx/frontend/backend up? |
| Admin login fails | `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN`, HTTPS |
| API CORS errors | `FRONTEND_URL`, `APP_URL` match actual domains |
| Out of memory | Switch to MySQL; disable AI; upgrade to 4 GB RAM |
| Stale frontend | Rebuild: `docker compose ... up -d --build` (not `--watch`) |

---

## Security checklist

- [ ] `APP_DEBUG=false`, `APP_ENV=production`
- [ ] Firewall: only 22, 80, 443
- [ ] SSH key auth; disable password login
- [ ] Strong DB passwords
- [ ] Daily MySQL backups (`mysqldump` cron or provider snapshots)
- [ ] Never commit `.env` or `.env.production`

---

## Related

- [Option G — AWS](../deploy/OPTION-G-AWS.md) — automated ECR + GitHub Actions deploy
- [DEPLOYMENT.md](../DEPLOYMENT.md) — all hosting options and budgets
