# Step 4 — Firebase (auth + push)

Evoke uses Firebase for:

- **Customer sign-in** — Google, email/password, passwordless email link (Firebase proves identity; Laravel issues Sanctum tokens)
- **Web push (FCM)** — order/enrollment notifications

Hosting split:

- **Vercel** — Firebase web SDK, OAuth handler proxy, FCM token registration
- **Render** — verify Firebase ID tokens, delete Firebase users, send FCM via HTTP v1
- **Neon** — `users.firebase_uid`, `device_tokens`

**Prerequisites:** [02-RENDER.md](02-RENDER.md), [03-VERCEL.md](03-VERCEL.md)  
**Optional next:** [05-CLOUDFLARE.md](05-CLOUDFLARE.md)

---

## 1. Create a Firebase project

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. Name: e.g. `evoke-group`.
3. Stay on **Spark (free)** plan — FCM has no per-message fee.

---

## 2. Add a Web app

1. Project overview → **Web** icon (`</>`).
2. App nickname: `Evoke Web`.
3. Skip Firebase Hosting (you use Vercel).
4. Copy the **firebaseConfig** object fields — you need them for Vercel.

### Enable Google sign-in (customer auth)

1. **Build → Authentication → Get started** (if not already enabled).
2. **Sign-in method** tab:
   - **Google** → **Enable** → save.
   - **Email/Password** → **Enable** → turn on **Email link (passwordless sign-in)**.
3. Add your support email when prompted.

Evoke uses Firebase only to prove identity; Laravel still issues Sanctum tokens and owns roles.

**Delete account:** Account → Settings → Delete account removes the Firebase Auth user (Google/email) via the Admin API, then soft-deletes the Laravel user.

---

## 3. Enable Cloud Messaging

1. **Project settings** (gear) → **Cloud Messaging** tab.
2. Under **Web configuration** → **Web Push certificates**.
3. **Generate key pair** if none exists.
4. Copy the **Key pair** → this is `NEXT_PUBLIC_FIREBASE_VAPID_KEY` on Vercel.

---

## 4. Authorized domains (push + auth)

Firebase Console → **Authentication → Settings → Authorized domains**.

Add every hostname where users open the site:

| Domain | When |
|--------|------|
| `localhost` | Local dev |
| `evoke-five.vercel.app` (or your Vercel URL) | Preview/production before custom domain |
| `evokegroup.in` | Production custom domain |
| `www.evokegroup.in` | Only if you serve the app on `www` |

---

## 5. Custom auth domain (`evokegroup.in` on Vercel)

### Why you may see `eoke-group.firebaseapp.com`

Every Firebase project gets a default auth domain:

```text
https://[project-id].firebaseapp.com
```

For this project: `https://eoke-group.firebaseapp.com`.

If `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is unset or still set to that value, Google sign-in and **Google security alert emails** will name `eoke-group.firebaseapp.com` — even when users sign in from `evokegroup.in`.

That alert is from **Google**, not Evoke. To show your brand domain, point Firebase Auth at your custom domain and proxy the OAuth handler on Vercel.

Evoke hosts the frontend on **Vercel**, not Firebase Hosting. The repo already includes a Next.js rewrite in `frontend/next.config.ts` that forwards `/__/auth/*` to Firebase when `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is set at build time.

### Production setup checklist

#### 1. Firebase — authorized domains

**Authentication → Settings → Authorized domains** → add:

- `evokegroup.in`
- `www.evokegroup.in` (only if you use `www`)

#### 2. Google Cloud — OAuth 2.0 Web client

**APIs & Services → Credentials → OAuth 2.0 Client IDs** → open the **Web client** Firebase created (name often includes “Web client” or your Firebase project).

**Authorized JavaScript origins:**

```text
https://evokegroup.in
https://www.evokegroup.in
```

**Authorized redirect URIs:**

```text
https://evokegroup.in/__/auth/handler
https://www.evokegroup.in/__/auth/handler
```

Add only the host(s) you actually use. The path `/__/auth/handler` is required.

#### 3. Vercel — environment variable

Set the domain users type in the browser (no `https://`):

```env
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=evokegroup.in
```

Use `www.evokegroup.in` instead if that is your canonical URL. It **must match** how people open the site.

For **evokegroup.in**, Vercel redirects the apex to `www.evokegroup.in`. Either set `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=www.evokegroup.in`, or keep `evokegroup.in` — the frontend resolves `www` vs apex automatically at runtime (redeploy after pulling that change).

Keep other Firebase vars set (`NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_API_KEY`, etc.) — see [03-VERCEL.md](03-VERCEL.md).

#### 4. Vercel — redeploy

`NEXT_PUBLIC_*` variables are embedded at **build time**. Redeploy after changing them.

The rewrite in `frontend/next.config.ts` (already in repo):

```typescript
async rewrites() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    return [];
  }

  return [
    {
      source: "/__/auth/:path*",
      destination: `https://${projectId}.firebaseapp.com/__/auth/:path*`,
    },
  ];
},
```

With `NEXT_PUBLIC_FIREBASE_PROJECT_ID=eoke-group`, requests to `https://evokegroup.in/__/auth/...` are proxied to `https://eoke-group.firebaseapp.com/__/auth/...`.

#### 5. Optional — OAuth consent screen branding

**Google Cloud → OAuth consent screen:**

- App name: **Evoke Group**
- User support email: your address
- App logo (optional)

This improves the Google account picker. It does **not** replace setting `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` for security-alert domain text.

### Local development

Custom auth domain + rewrite is intended for **production** on your real domain.

For **localhost**, keep:

```env
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=eoke-group.firebaseapp.com
```

Ensure `localhost` remains in Firebase **Authorized domains**. Google popup sign-in works locally with the default Firebase subdomain.

### One canonical host

Pick **`evokegroup.in`** or **`www.evokegroup.in`** and redirect the other (DNS or Vercel) so auth config, OAuth URIs, and `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` stay aligned.

### Before vs after

| Before | After |
|--------|--------|
| Google alert: “signed in to **eoke-group.firebaseapp.com**” | “signed in to **evokegroup.in**” |
| OAuth helper on Firebase subdomain | OAuth helper on your domain via `/__/auth/handler` |

### Limits

- You **cannot** fully edit Google’s security alert email template — only the app/domain name shown.
- **Firebase Hosting custom domain** is an alternative if the whole app were on Firebase Hosting; with Vercel, use the rewrite above.

---

## 6. Service account (Render backend)

1. **Project settings → Service accounts**.
2. **Generate new private key** → download JSON.
3. **Never commit** this file. Store in `secrets/` locally (gitignored).

**On Render**, paste the **entire JSON as one line**:

```env
FIREBASE_PROJECT_ID=evoke-group
FIREBASE_CREDENTIALS_JSON={"type":"service_account","project_id":"evoke-group",...}
```

Tips:

- Minify JSON (no line breaks) or Render may truncate wrongly.
- Alternative for local dev only: `FIREBASE_CREDENTIALS_PATH=../secrets/your-adminsdk.json`

---

## 7. Enable FCM API (Google Cloud)

1. [console.cloud.google.com](https://console.cloud.google.com) → same project as Firebase.
2. **APIs & Services → Library**.
3. Search **Firebase Cloud Messaging API** → **Enable**.

---

## 8. Set env vars (summary)

| Platform | Variables |
|----------|-----------|
| **Vercel** | All `NEXT_PUBLIC_FIREBASE_*` (see [03-VERCEL.md](03-VERCEL.md)). Production: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=evokegroup.in` |
| **Render** | `FIREBASE_PROJECT_ID`, `FIREBASE_CREDENTIALS_JSON` (required for `/auth/firebase` and account delete) |

Redeploy **both** after setting vars.

---

## 9. Database templates

Push uses rows in `notification_templates` (channel = `push`).

If not seeded yet:

- First deploy with `RUN_SEED=true`, or  
- Run `NotificationTemplateSeeder` → [06-DATABASE-MAINTENANCE.md](06-DATABASE-MAINTENANCE.md)

Migration `device_tokens` must exist (`RUN_MIGRATIONS=true` on Render).

---

## 10. Test push

1. Sign in on the live site.
2. **Account → Settings → Enable notifications** (allow browser prompt).
3. Click **Send test notification** (after latest frontend deploy).
4. Or place a shop order / enrollment to trigger a real event.

**Foreground tab:** in-app toast.  
**Background / phone:** OS notification.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| “Push not configured” on site | Missing `NEXT_PUBLIC_FIREBASE_*` on Vercel — redeploy |
| 503 on test-push | Missing Firebase vars on Render |
| No notification after enable | Check Render logs for FCM errors; verify authorized domain |
| iOS Safari | Must allow notifications for the site; HTTPS required |
| Invalid token | Re-enable notifications in Settings |
| Google sign-in cancelled after OAuth redirect | `authDomain` must match the hostname in the address bar (`www` vs apex). Use `www.evokegroup.in` on Vercel or redeploy with runtime host resolution |
| Google sign-in fails on custom domain | Add domain to Firebase authorized domains; add `/__/auth/handler` to OAuth redirect URIs |
| `auth/unauthorized-domain` | Host not listed under Firebase **Authorized domains** |
| Account delete fails (Firebase) | Render needs `FIREBASE_CREDENTIALS_JSON`; enable Identity Toolkit API |
| `firebase_uid` always null in DB | User signed in via Laravel `/auth/login` or `/auth/register`, not `/auth/firebase`; set `FIREBASE_PROJECT_ID` on Render and sign in with Google once |

---

## Checklist

- [ ] Firebase project (Spark)
- [ ] Web app + VAPID key
- [ ] Google + Email/Password + Email link enabled in Authentication
- [ ] Authorized domains: localhost, Vercel URL, `evokegroup.in`
- [ ] OAuth client: origins + `/__/auth/handler` redirect URIs for production domain
- [ ] Vercel: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=evokegroup.in` (production)
- [ ] Vercel redeployed after Firebase env changes
- [ ] Service account JSON on Render (not in git)
- [ ] FCM API enabled in Google Cloud
- [ ] Render env vars set and redeployed
- [ ] Test Google sign-in on production domain
- [ ] Test push notification received
