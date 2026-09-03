# Step 3 — Vercel (Next.js frontend)

Vercel hosts the **Evoke frontend**. It calls the **Render API** using Bearer tokens.

**Prerequisites:** [01-NEON.md](01-NEON.md), [02-RENDER.md](02-RENDER.md) (API health OK)  
**Next step:** [04-FIREBASE.md](04-FIREBASE.md)

---

## 1. Import the project

1. [vercel.com](https://vercel.com) → **Add New → Project**.
2. Import the Evoke GitHub repo.
3. **Root Directory:** `frontend` (important).
4. **Framework:** Next.js (auto-detected).

---

## 2. Environment variables

Vercel → Project → **Settings → Environment Variables**

Apply to **Production** (and Preview if you want push on preview URLs).

### Required

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-RENDER-URL.onrender.com/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | `Evoke` |

Must end with **`/api/v1`** — no trailing slash after `v1`.

### Firebase web push (after [04-FIREBASE.md](04-FIREBASE.md))

| Key | Source |
|-----|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Firebase → Cloud Messaging → Web Push certificates |

These are **public** — safe in Vercel.

---

## 3. Deploy

1. Click **Deploy**.
2. Copy the production URL (e.g. `https://evoke-five.vercel.app`).

---

## 4. Wire CORS on Render

Back in **Render → evoke-api → Environment**:

```env
FRONTEND_URL=https://evoke-five.vercel.app
CORS_ALLOWED_ORIGINS=https://evoke-five.vercel.app
```

Use **exact** URL: `https`, no trailing slash.

Redeploy the Render service.

---

## 5. Verify frontend

| Test | Expected |
|------|----------|
| Homepage loads | Motion / shop / academy visible |
| Sign in | No CORS error in browser console |
| Admin | `/admin` login works for seeded admin |
| API calls | Network tab shows requests to Render URL |

Demo admin (if seed ran): **admin@evoke.com** / **password**

---

## 6. Custom domain (optional)

Vercel → **Settings → Domains** → add `www.yourdomain.com`.

Then update on Render:

```env
FRONTEND_URL=https://www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://www.yourdomain.com
```

Add the same domain in Firebase authorized domains → [04-FIREBASE.md](04-FIREBASE.md).

If using Cloudflare DNS → [05-CLOUDFLARE.md](05-CLOUDFLARE.md).

---

## Checklist

- [ ] Root directory = `frontend`
- [ ] `NEXT_PUBLIC_API_URL` points to Render `/api/v1`
- [ ] Deploy succeeded
- [ ] Render CORS updated with Vercel URL
- [ ] Sign-in works
- [ ] Firebase public vars added when testing push
