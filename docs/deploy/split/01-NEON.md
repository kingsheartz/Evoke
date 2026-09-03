# Step 1 — Neon (Postgres)

Neon hosts Evoke’s **PostgreSQL** database. Render connects to Neon over the public internet.

**Next step after this doc:** [02-RENDER.md](02-RENDER.md)

---

## 1. Create a Neon account

1. Go to [neon.tech](https://neon.tech) and sign up (free tier).
2. Create a **project** (e.g. `evoke-prod`).
3. Choose a region close to Render (**Singapore** if API is on Render Singapore).

---

## 2. Create the database

Neon creates a default database (often `neondb`). You can rename or create `evoke-db`:

1. Neon Console → **Projects** → your project → **Databases**.
2. Note the database name (e.g. `evoke-db` or `neondb`).

---

## 3. Copy connection details

Neon Console → **Connect** (or **Connection details**).

You need:

| Variable | Neon field | Example shape |
|----------|------------|---------------|
| `DB_HOST` | Host | `ep-xxxx.ap-southeast-1.aws.neon.tech` |
| `DB_PORT` | Port | `5432` |
| `DB_DATABASE` | Database | `evoke-db` |
| `DB_USERNAME` | User | `neondb_owner` |
| `DB_PASSWORD` | Password | (shown once — store in a password manager) |

Use the **direct** connection string for Render (pooled is OK for serverless-style traffic too).

**Laravel env mapping:**

```env
DB_CONNECTION=pgsql
DB_HOST=ep-xxxx.ap-southeast-1.aws.neon.tech
DB_PORT=5432
DB_DATABASE=evoke-db
DB_USERNAME=neondb_owner
DB_PASSWORD=your_neon_password
```

---

## 4. Security

- **Never commit** the password to git.
- Set it only in **Render → Environment** (and local `backend/.env` for dev).
- If exposed, use Neon → **Reset password** and update Render.

---

## 5. What Neon does *not* do

| Not on Neon | Where instead |
|-------------|---------------|
| Run Laravel | Render |
| Serve the website | Vercel |
| Store uploaded files long-term | Cloudflare R2 or S3 (optional) |
| Send push notifications | Firebase (via Render) |

---

## 6. Verify (after Render is connected)

In Neon Console → **Monitoring** / **SQL Editor**:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

After Render’s first deploy with `RUN_MIGRATIONS=true`, you should see Laravel tables (`users`, `shop_products`, etc.).

---

## Checklist

- [ ] Neon project created
- [ ] Region chosen (near Render)
- [ ] Host, database, user, password saved securely
- [ ] Ready to paste into Render env vars → [02-RENDER.md](02-RENDER.md)
