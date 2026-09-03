# Step 5 — Cloudflare (DNS, CDN, optional extras)

Cloudflare is **optional** for Evoke’s split stack. Vercel and Render already provide HTTPS on their default URLs.

Use Cloudflare when you want a **custom domain**, **CDN in front of everything**, **R2 media storage**, **Turnstile** (bot protection), or **Access** (gate admin URLs).

**Prerequisites:** [03-VERCEL.md](03-VERCEL.md) (know your Vercel + Render URLs)

Each subsection is **independent** — enable only what you need.

---

## Part A — DNS + SSL (custom domain)

### A1. Add site to Cloudflare

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Add a site**.
2. Enter your domain (e.g. `evokegroup.com`).
3. Choose **Free** plan.
4. Cloudflare shows **nameservers** — update them at your domain registrar.

### A2. Frontend (Vercel)

1. Vercel → Project → **Settings → Domains** → add `www.yourdomain.com`.
2. Cloudflare → **DNS → Records**:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| `CNAME` | `www` | `cname.vercel-dns.com` (Vercel will show exact target) | Proxied (orange cloud) |

3. Vercel verifies the domain.

### A3. API subdomain (Render)

1. Render → **evoke-api → Settings → Custom Domains** → add `api.yourdomain.com`.
2. Cloudflare DNS:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| `CNAME` | `api` | Your Render hostname (e.g. `evoke-api.onrender.com`) | DNS only (grey cloud) recommended* |

\*Render + orange-cloud proxy can work but grey cloud avoids double-proxy issues. Test if unsure.

3. Update Render env:

```env
APP_URL=https://api.yourdomain.com
```

4. Update Vercel:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

5. Update Render CORS:

```env
FRONTEND_URL=https://www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://www.yourdomain.com
```

6. Redeploy Render + Vercel.

### A4. SSL/TLS settings

Cloudflare → **SSL/TLS**:

| Mode | When |
|------|------|
| **Full (strict)** | Recommended when origin has valid HTTPS (Vercel/Render do) |

---

## Part B — Cloudflare R2 (durable file uploads)

Render free disk is **ephemeral** — uploads disappear on redeploy. R2 uses the same S3 driver in Laravel.

### B1. Create bucket

1. Cloudflare → **R2 → Create bucket** (e.g. `evoke-media`).
2. **Manage R2 API tokens → Create API token** with Object Read & Write.

### B2. Map to Laravel (Render env)

R2 tokens use **AWS-compatible** env names:

```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=<R2 token Access Key ID>
AWS_SECRET_ACCESS_KEY=<R2 token Secret Access Key>
AWS_DEFAULT_REGION=auto
AWS_BUCKET=evoke-media
AWS_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
AWS_URL=https://<public-bucket-url-or-custom-domain>
```

### B3. Frontend media URL

Vercel:

```env
NEXT_PUBLIC_MEDIA_BASE_URL=https://your-public-r2-or-cdn-url
```

Enable public access on the bucket or use a custom domain on R2.

---

## Part C — Turnstile (free bot protection)

Not full authentication — protects sign-in / register forms from bots.

### C1. Create widget

1. Cloudflare → **Turnstile → Add site**.
2. Domain: your frontend domain.
3. Copy **Site key** and **Secret key**.

### C2. Wire into Evoke

Requires code integration (not enabled by default). Store keys for when implemented:

```env
# Render
TURNSTILE_SECRET_KEY=...

# Vercel
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
```

---

## Part D — Zero Trust Access (optional admin gate)

Free for **up to 50 users**. Puts a login wall **before** your app loads — useful for staging or extra admin protection.

**Does not replace** Evoke customer login (Laravel Sanctum).

### D1. Create Zero Trust org

1. Cloudflare → **Zero Trust** → create organization (team name).
2. Choose **Free** plan.

### D2. Protect a hostname

1. **Access → Applications → Add an application**.
2. Type: **Self-hosted**.
3. Domain: e.g. `admin.yourdomain.com` or path on staging URL.
4. Policy: allow your email / Google login.

### D3. DNS

Point `admin.yourdomain.com` to Vercel (or use Access on existing admin path via Cloudflare worker — advanced).

Users hit **Cloudflare login first**, then Evoke admin login unless you redesign auth.

---

## Part E — What Cloudflare does *not* replace

| Service | Still handled by |
|---------|------------------|
| Customer accounts & orders | Laravel + Neon |
| Push notifications | Firebase |
| Postgres | Neon |
| API runtime | Render |
| Frontend runtime | Vercel |

---

## Checklist

### DNS only
- [ ] Nameservers at registrar point to Cloudflare
- [ ] `www` → Vercel
- [ ] `api` → Render (if using custom API domain)
- [ ] Render + Vercel env URLs updated
- [ ] SSL mode Full (strict)

### R2 (optional)
- [ ] Bucket + API token
- [ ] Render `AWS_*` / `FILESYSTEM_DISK=s3`
- [ ] Vercel `NEXT_PUBLIC_MEDIA_BASE_URL`

### Turnstile / Access (optional)
- [ ] Widget or Access app created
- [ ] Keys stored in Render/Vercel when integrated

---

## Related

- Firebase authorized domains: [04-FIREBASE.md](04-FIREBASE.md)
- Env template: [split-free.env.example](../../../infra/free/config/split-free.env.example)
