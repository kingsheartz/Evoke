# Database maintenance — Neon from your PC

Render **free tier has no Shell**. Use these steps to run **migrations** or **seeders** against **Neon** from your machine.

**Prerequisite:** [01-NEON.md](01-NEON.md) connection details + Render `APP_KEY`

---

## One-time: build the seed image

From repo root (PowerShell):

```powershell
cd "d:\WORK\Projects\Evoke Group\Evoke"
docker build -t evoke-seed -f backend/Dockerfile.prod backend
```

This image includes **PostgreSQL support** (`pdo_pgsql`). Do not use `composer:latest` alone — it lacks the driver.

---

## Run migrations

Replace placeholders with Neon + Render values:

```powershell
docker run --rm `
  -e DB_CONNECTION=pgsql `
  -e DB_HOST=ep-xxxx.region.aws.neon.tech `
  -e DB_PORT=5432 `
  -e DB_DATABASE=evoke-db `
  -e DB_USERNAME=neondb_owner `
  -e DB_PASSWORD=YOUR_NEON_PASSWORD `
  -e APP_KEY=base64:YOUR_RENDER_APP_KEY `
  evoke-seed `
  php artisan migrate --force
```

Success: lists migrated tables, exit code `0`.

Creates e.g. `device_tokens` for push notifications.

---

## Seed notification templates only

Safe to re-run (`updateOrInsert`):

```powershell
docker run --rm `
  -e DB_CONNECTION=pgsql `
  -e DB_HOST=ep-xxxx.region.aws.neon.tech `
  -e DB_PORT=5432 `
  -e DB_DATABASE=evoke-db `
  -e DB_USERNAME=neondb_owner `
  -e DB_PASSWORD=YOUR_NEON_PASSWORD `
  -e APP_KEY=base64:YOUR_RENDER_APP_KEY `
  evoke-seed `
  php artisan db:seed --class=NotificationTemplateSeeder --force
```

---

## Full demo seed

```powershell
docker run --rm `
  -e DB_CONNECTION=pgsql `
  -e DB_HOST=... `
  -e DB_PORT=5432 `
  -e DB_DATABASE=... `
  -e DB_USERNAME=... `
  -e DB_PASSWORD=... `
  -e APP_KEY=base64:... `
  -e SEED_DEMO=true `
  evoke-seed `
  php artisan db:seed --force
```

---

## Alternative: auto-seed on Render

Set on Render (first deploy only):

```env
RUN_MIGRATIONS=true
RUN_SEED=true
SEED_DEMO=true
```

Redeploy → then set `RUN_SEED=false`.

See [02-RENDER.md](02-RENDER.md).

---

## Verify in Neon

Neon Console → **SQL Editor**:

```sql
SELECT event, channel FROM notification_templates WHERE channel = 'push';
```

```sql
SELECT COUNT(*) FROM device_tokens;
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `could not find driver` | Use `evoke-seed` image, not `composer:latest` |
| Connection refused | Check Neon host, firewall, password |
| `APP_KEY` errors | Copy exact key from Render env |

---

## Security

- Never commit passwords or `migrate.bat` with real credentials.
- Store helper scripts under `secrets/` (gitignored).
- Rotate Neon password if exposed.
