# Evoke Platform

Premium multi-business platform with three independent verticals managed from a single administration system:

- **Evoke Academy** — Courses, trainers, enrollments, attendance, certificates
- **Evoke Sports Shop** — E-commerce for sports equipment and apparel
- **Evoke Tours & Travels** — Travel packages, bookings, and lead management

Built as a **modular monolith** using Domain-Driven Design (DDD), with all functionality exposed through versioned REST APIs (`/api/v1`).

## Architecture

```
Evoke/
├── frontend/          # Next.js 15 (App Router, SSR, Tailwind, shadcn-style UI)
├── backend/           # Laravel 12 modular monolith (DDD)
├── ai-service/        # FastAPI + Ollama RAG pipeline
└── docker/            # Nginx, PostgreSQL init scripts
```

### Backend Module Structure (DDD)

```
backend/app/
├── Domain/            # Contracts, value objects, domain interfaces
├── Application/       # Use cases and application services
│   ├── Academy/
│   ├── Shop/
│   ├── Tours/
│   └── Notifications/
├── Infrastructure/    # Repositories, external integrations
├── Modules/           # Module route definitions
│   ├── Academy/
│   ├── Shop/
│   ├── Tours/
│   ├── CMS/
│   └── Notifications/
├── Models/            # Eloquent models (persistence)
├── Events/            # Domain events
├── Listeners/         # Event handlers
└── Jobs/              # Queued background jobs
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui patterns, Zustand, React Hook Form, Zod |
| Backend | Laravel 12, PHP 8.4+, Sanctum, Spatie Permission, Redis queues |
| Database | PostgreSQL 16 + pgvector (default); **MySQL 8+ / MariaDB** optional for core platform |
| AI | FastAPI, Ollama (Qwen3), nomic-embed-text embeddings |
| Cache/Queue | Redis |
| Payments | Razorpay |
| Notifications | Resend (email), MSG91 (SMS), Firebase (push), Meta API (WhatsApp) |

## Quick Start

### Prerequisites

- Docker Desktop (recommended)
- Node.js 20+
- PHP 8.4+ and Composer (for local backend dev without Docker)

### 1. Environment Setup

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 2. Start with Docker

```bash
./scripts/run.sh init
./scripts/run.sh up core --migrate --seed
```

Or on Windows:

```powershell
.\scripts\run.ps1 up core --migrate --seed
```

```cmd
scripts\run.cmd up core --migrate --seed
```

WSL:

```bash
./scripts/run.sh up core --migrate --seed
```

**Run guide (stacks, prod mode, progressive setup):** [RUN.md](RUN.md) — use `run.ps1` (PowerShell), `run.cmd` (CMD), or `run.sh` (WSL).

**Development guide (commands, Docker UI fixes, troubleshooting):** [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

**Deployment (hosting options, ₹800 budget, production checklist):** see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

**Windows quick helpers:**

```powershell
.\scripts\dev.ps1 up              # start stack
.\scripts\dev.ps1 reset-frontend  # fix stale UI when changes don't appear
.\scripts\dev.ps1 verify-ui       # confirm new theme is being served
```

```cmd
scripts\dev.cmd up
scripts\dev.cmd reset-frontend
```

```bash
./scripts/dev.sh up
./scripts/dev.sh reset-frontend
```

Services:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000/api/v1 |
| Nginx (proxy) | http://localhost:8080 |
| AI Service | http://localhost:8001 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |
| Ollama | localhost:11434 |

### 3. Initialize Backend (first run)

```bash
docker compose exec backend composer install
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate --seed
docker compose exec backend php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

Default admin credentials (after seeding):

- **Email:** `admin@evoke.com`
- **Password:** `password`

### 4. Pull Ollama Models (AI)

```bash
docker compose exec ollama ollama pull qwen3
docker compose exec ollama ollama pull nomic-embed-text
```

## API Overview

All endpoints are prefixed with `/api/v1`.

### Public

- `GET /health` — API health check
- `GET /homepage` — Dynamic CMS homepage (hero + entry cards)
- `GET /modules` — Enabled business modules
- `GET /search?q=` — Global search
- `POST /auth/register`, `POST /auth/login`

### Academy (`/academy`)

- `GET /categories`, `GET /courses`, `GET /courses/{slug}`
- `POST /enrollments` (authenticated)

### Shop (`/shop`)

- `GET /products`, `GET /products/{slug}`, `GET /categories`
- `GET /cart`, `POST /cart/items`, `POST /orders` (authenticated)

### Tours (`/tours`)

- `GET /packages`, `GET /packages/{slug}`
- `POST /bookings` (authenticated), `POST /enquiries`

### CMS (`/cms`)

- `GET /pages`, `GET /pages/{slug}`
- Admin: `POST/PUT/DELETE /pages`, `PUT /homepage`

### Notifications (`/notifications`)

- `GET /`, `POST /{id}/read`, `POST /read-all` (authenticated)

## User Roles

| Role | Scope |
|------|-------|
| super-admin | Full platform control |
| academy-manager | Courses, trainers, students, attendance |
| shop-manager | Products, inventory, orders |
| travel-manager | Packages, bookings, enquiries |
| trainer | Attendance, student progress |
| customer | Profile, orders, bookings, enrollments |

Modules can be enabled/disabled per vertical via the `business_modules` table (admin configurable).

## Phase Roadmap

### Phase 1 (Current Foundation)
- CMS with dynamic homepage and page builder schema
- Academy, Shop, Tours modules with REST APIs
- RBAC permissions, notifications engine, audit logs
- Docker deployment architecture

### Phase 2
- AI chatbot (RAG pipeline wired)
- Recommendation engine

### Phase 3
- Mobile apps
- Loyalty program
- Franchise / multi-branch management

## Development Notes

- **Full dev guide:** [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) — daily commands, Docker `.next` cache issue, UI verification.
- **UI not updating in Docker?** The frontend used a separate `.next` volume that served stale builds. This is fixed in `docker-compose.yml`; if you still see the old UI, run `.\scripts\dev.ps1 reset-frontend` and hard-refresh (`Ctrl+Shift+R`).
- **No hardcoded content** — Homepage, pages, and all business entities are database-driven and admin-configurable.
- **Multi-branch ready** — `branches` table and `branch_id` on users/courses support future expansion.
- **Microservice extraction** — Modules are isolated by namespace and can be extracted later if needed.
- **Security** — Sanctum auth, RBAC, rate limiting (configure in production), CSRF for SPA, audit logs, 2FA fields on users.

## Local Development (without Docker)

```bash
# Backend
cd backend && composer install && php artisan serve

# Frontend
cd frontend && npm install && npm run dev

# AI Service
cd ai-service && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Ensure PostgreSQL with pgvector and Redis are running locally and match `.env` credentials. For **MySQL / XAMPP**, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#mysql--xampp-optional).
