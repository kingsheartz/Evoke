# Step 2 — Render (Laravel API)

Render runs the **Evoke API** (Docker). It connects to **Neon** for Postgres.

**Prerequisite:** [01-NEON.md](01-NEON.md)  
**Next step:** [03-VERCEL.md](03-VERCEL.md)

---

## 1. Push code to GitHub

Render deploys from your repo. Ensure `master` (or your deploy branch) includes:

- `backend/Dockerfile.prod`
- `render.yaml` (optional Blueprint)

---

## 2. Create the Render service

### Option A — Blueprint (recommended)

1. [render.com](https://render.com) → **New → Blueprint**.
2. Connect the Evoke GitHub repo.
3. Render reads root **`render.yaml`** and creates **evoke-api**.

### Option B — Manual web service

1. **New → Web Service** → connect repo.
2. **Root directory:** repo root (Dockerfile path `./backend/Dockerfile.prod`).
3. **Plan:** Free.
4. **Region:** Singapore (match Neon if possible).

---

## 3. Generate APP_KEY

Run once (any machine with Docker):

```powershell
docker run --rm -v "${PWD}\backend:/app" -w /app composer:latest php artisan key:generate --show
```

Copy the output (`base64:...`). You will **not** need this on Neon — only Render.

---

## 4. Set environment variables

Render → **evoke-api** → **Environment**:

### Required

| Key | Value |
|-----|--------|
| `APP_KEY` | From step 3 |
| `APP_URL` | `https://evoke-api.onrender.com` (your Render URL, no trailing slash) |
| `FRONTEND_URL` | `https://your-app.vercel.app` (set after Vercel — update later) |
| `CORS_ALLOWED_ORIGINS` | Same as `FRONTEND_URL` |
| `DB_HOST` | From Neon |
| `DB_DATABASE` | From Neon |
| `DB_USERNAME` | From Neon |
| `DB_PASSWORD` | From Neon |

### Already in render.yaml (verify)

| Key | Typical value |
|-----|----------------|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `DB_CONNECTION` | `pgsql` |
| `DB_PORT` | `5432` |
| `RUN_MIGRATIONS` | `true` |
| `RUN_SEED` | `true` (first deploy only) |
| `SEED_DEMO` | `true` |
| `CACHE_STORE` | `file` |
| `SESSION_DRIVER` | `file` |
| `QUEUE_CONNECTION` | `sync` |

### Firebase (after [04-FIREBASE.md](04-FIREBASE.md))

| Key | Value |
|-----|--------|
| `FIREBASE_PROJECT_ID` | e.g. `evoke-group` |
| `FIREBASE_CREDENTIALS_JSON` | Full service account JSON on **one line** |

---

## 5. Deploy

1. **Manual Deploy** or push to GitHub (auto-deploy).
2. Watch **Logs** for:
   - `Running migrations...`
   - `Running database seeders...` (if `RUN_SEED=true`)
3. Wait until status is **Live**.

---

## 6. Verify API

```text
GET https://YOUR-RENDER-URL/api/v1/health
```

Expected:

```json
{"status":"ok","version":"v1",...}
```

---

## 7. After first successful deploy

In Render env, set:

```env
RUN_SEED=false
```

Redeploy once. This stops re-running demo seeders on every deploy.

Keep `RUN_MIGRATIONS=true` so new migrations apply automatically.

---

## 8. Limitations (Render free)

| Limit | Impact |
|-------|--------|
| No Shell | Migrate/seed via deploy flags or [06-DATABASE-MAINTENANCE.md](06-DATABASE-MAINTENANCE.md) |
| Cold starts | First request after idle can take 15–60 s |
| Ephemeral disk | Local uploads lost on redeploy — use R2/S3 for media |

---

## Checklist

- [ ] Service deployed and health OK
- [ ] Neon credentials set
- [ ] `APP_KEY` set
- [ ] `FRONTEND_URL` + `CORS_ALLOWED_ORIGINS` updated after Vercel URL known
- [ ] `RUN_SEED=false` after first seed
- [ ] Firebase vars set when push is needed → [04-FIREBASE.md](04-FIREBASE.md)
