# Split deploy — Neon → Render → Vercel → Firebase → Cloudflare

Step-by-step guides for Evoke’s **free-tier split stack**. Each service has its **own document** — follow them in order.

---

## Architecture

```
Browser
   │
   ▼
Cloudflare (optional — DNS, CDN, SSL, Turnstile, Access)
   │
   ├──► Vercel ──────────────► Next.js frontend
   │                              │
   │                              │ Bearer token (Sanctum)
   │                              ▼
   └──► Render ──────────────► Laravel API
                                  │
                                  ▼
                              Neon Postgres

Firebase Cloud Messaging ◄── Render sends push ──► Browser (via Vercel)
```

---

## Guides (in order)

| Step | Service | Doc | What you set up |
|------|---------|-----|-----------------|
| 1 | **Neon** | [01-NEON.md](01-NEON.md) | Postgres database + connection details |
| 2 | **Render** | [02-RENDER.md](02-RENDER.md) | Laravel API, migrations, seed, Firebase backend vars |
| 3 | **Vercel** | [03-VERCEL.md](03-VERCEL.md) | Next.js frontend, API URL, Firebase public vars |
| 4 | **Firebase** | [04-FIREBASE.md](04-FIREBASE.md) | FCM project, web app, service account, authorized domains |
| 5 | **Cloudflare** | [05-CLOUDFLARE.md](05-CLOUDFLARE.md) | DNS, SSL, optional R2 / Turnstile / Access |
| — | **DB maintenance** | [06-DATABASE-MAINTENANCE.md](06-DATABASE-MAINTENANCE.md) | Migrate / seed Neon without Render Shell |

---

## Env reference (no secrets in git)

Template only — copy values into each platform dashboard:

→ [infra/free/config/split-free.env.example](../../../infra/free/config/split-free.env.example)

Blueprint for Render:

→ [render.yaml](../../../render.yaml)

---

## After all steps

| Check | URL / action |
|-------|----------------|
| API health | `GET https://YOUR-RENDER-URL/api/v1/health` |
| Site loads | `https://YOUR-FRONTEND-URL` |
| Admin login | `admin@evoke.com` / `password` (if demo seed ran) |
| Push test | Account → Settings → Enable notifications → Send test notification |
| CORS | Sign-in works from frontend domain without browser CORS errors |

---

## Database maintenance (no Render Shell)

Render free tier has **no Shell**. To migrate or seed after the first deploy:

→ [06-DATABASE-MAINTENANCE.md](06-DATABASE-MAINTENANCE.md)

---

## Related

- Overview: [OPTION-C-FREE.md](../OPTION-C-FREE.md)
- Full hosting comparison: [DEPLOYMENT.md](../../DEPLOYMENT.md)
