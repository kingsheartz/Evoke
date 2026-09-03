# Step 4 — Firebase (push notifications)

Firebase **Cloud Messaging (FCM)** sends free web push notifications. Evoke uses:

- **Vercel** — browser registers FCM tokens
- **Render** — Laravel sends pushes via FCM HTTP v1
- **Neon** — stores `device_tokens`

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

---

## 3. Enable Cloud Messaging

1. **Project settings** (gear) → **Cloud Messaging** tab.
2. Under **Web configuration** → **Web Push certificates**.
3. **Generate key pair** if none exists.
4. Copy the **Key pair** → this is `NEXT_PUBLIC_FIREBASE_VAPID_KEY` on Vercel.

---

## 4. Authorized domains

Still in Firebase / Google Cloud context:

1. Ensure these domains can request push permission:
   - `localhost` (dev)
   - Your Vercel URL: `evoke-five.vercel.app`
   - Custom domain if added later

Firebase Console → **Authentication → Settings → Authorized domains** (or project settings for web app).

---

## 5. Service account (Render backend)

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

## 6. Enable FCM API (Google Cloud)

1. [console.cloud.google.com](https://console.cloud.google.com) → same project as Firebase.
2. **APIs & Services → Library**.
3. Search **Firebase Cloud Messaging API** → **Enable**.

---

## 7. Set env vars (summary)

| Platform | Variables |
|----------|-----------|
| **Vercel** | All `NEXT_PUBLIC_FIREBASE_*` (see [03-VERCEL.md](03-VERCEL.md)) |
| **Render** | `FIREBASE_PROJECT_ID`, `FIREBASE_CREDENTIALS_JSON` |

Redeploy **both** after setting vars.

---

## 8. Database templates

Push uses rows in `notification_templates` (channel = `push`).

If not seeded yet:

- First deploy with `RUN_SEED=true`, or  
- Run `NotificationTemplateSeeder` → [06-DATABASE-MAINTENANCE.md](06-DATABASE-MAINTENANCE.md)

Migration `device_tokens` must exist (`RUN_MIGRATIONS=true` on Render).

---

## 9. Test push

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

---

## Checklist

- [ ] Firebase project (Spark)
- [ ] Web app + VAPID key
- [ ] Authorized domains include Vercel URL
- [ ] Service account JSON on Render (not in git)
- [ ] FCM API enabled in Google Cloud
- [ ] Vercel + Render env vars set and redeployed
- [ ] Test notification received
