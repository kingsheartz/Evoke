# Step 7 — Email (Resend + SMTP failover)

Evoke sends transactional email through **Laravel Mail** with automatic **failover**: **Resend first**, then **SMTP** if Resend fails (quota exceeded, API error, etc.).

**Prerequisites:** [02-RENDER.md](02-RENDER.md) (API deployed)  
**Related:** [06-DATABASE-MAINTENANCE.md](06-DATABASE-MAINTENANCE.md) (seed notification templates)

---

## Architecture

```
Customer action or admin update
        │
        ▼
NotificationDispatcher → NotificationChannelSender (email channel)
        │
        ▼
DomainNotificationMail → Laravel failover mailer
        │
        ├──► 1. Resend API (primary)
        └──► 2. SMTP (backup, if configured)
        │
        ▼
Customer inbox
```

On Render free tier, `QUEUE_CONNECTION=sync` — emails send **during the HTTP request** (no separate queue worker).

If `MAIL_HOST` is not set, failover uses **Resend only** (same as before).

---

## 1. Resend account

1. Sign up at [resend.com](https://resend.com) (free tier: ~3,000 emails/month).
2. **API Keys** → **Create API Key** → copy the key (`re_...`).

---

## 2. Verify a sending domain (recommended)

Using a raw Gmail address as `MAIL_FROM_ADDRESS` often fails or lands in spam. Use a domain you control:

1. Resend → **Domains** → **Add Domain** (e.g. `yourdomain.com`).
2. Add the **DNS records** Resend shows (SPF, DKIM) in Cloudflare or your DNS host → [05-CLOUDFLARE.md](05-CLOUDFLARE.md).
3. Wait until status is **Verified**.

Example From address: `notifications@evokegroup.in` (your domain is verified — use an address on that domain).

---

## 3. Render environment variables

Render → **evoke-api** → **Environment**:

### Required (Resend primary)

| Key | Value |
|-----|--------|
| `MAIL_MAILER` | `failover` |
| `MAIL_FAILOVER_MAILERS` | `resend,smtp` |
| `RESEND_API_KEY` | `re_xxxxxxxx` |
| `MAIL_FROM_ADDRESS` | `notifications@evokegroup.in` |
| `MAIL_FROM_NAME` | `Evoke` |

### Optional (SMTP backup — only if you configure a provider below)

| Key | Value |
|-----|--------|
| `MAIL_HOST` | e.g. `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_SCHEME` | `smtp` |
| `MAIL_USERNAME` | SMTP login |
| `MAIL_PASSWORD` | SMTP password or app key |

If `MAIL_HOST` / `MAIL_USERNAME` / `MAIL_PASSWORD` are empty, SMTP is skipped automatically.

Save and **redeploy** the service.

Template reference: [infra/free/config/split-free.env.example](../../../infra/free/config/split-free.env.example)

---

## 4. SMTP backup (no Hostinger mailbox needed)

Hostinger **paid** email mailboxes are optional. For a **free** backup when Resend quota is hit, use one of these:

### Option A — Gmail App Password (easiest, ~500/day)

1. Google Account → [App passwords](https://myaccount.google.com/apppasswords) (2FA required).
2. Create a password for “Mail”.
3. On Render:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SCHEME=smtp
MAIL_USERNAME=evokegroup2020@gmail.com
MAIL_PASSWORD=your-16-char-app-password
```

**Note:** Fallback emails may show **From** as your Gmail address (Gmail does not send as `@evokegroup.in` reliably). Primary Resend emails still use `notifications@evokegroup.in`.

### Option B — Brevo SMTP (300/day free, better domain alignment)

1. Sign up at [brevo.com](https://www.brevo.com).
2. **SMTP & API** → create SMTP key.
3. Verify `evokegroup.in` in Brevo (similar DNS TXT records).
4. On Render:

```env
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_SCHEME=smtp
MAIL_USERNAME=your-brevo-login-email
MAIL_PASSWORD=your-brevo-smtp-key
```

### Option C — Resend paid only

If volume grows, upgrade Resend (~$20/mo for 50k emails) and skip SMTP backup.

---

## 5. Notification templates

Email only sends when a template exists for the event + `email` channel. Seed templates on Neon:

```powershell
docker build -t evoke-seed -f backend/Dockerfile.prod backend
docker run --rm -e DB_CONNECTION=pgsql -e DB_HOST=... -e DB_DATABASE=... -e DB_USERNAME=... -e DB_PASSWORD=... evoke-seed php artisan db:seed --class=NotificationTemplateSeeder
```

See [06-DATABASE-MAINTENANCE.md](06-DATABASE-MAINTENANCE.md) for full Neon connection details.

---

## 6. Test email

### Option A — Laravel tinker (Render Shell or local with prod DB)

```bash
php artisan tinker
```

```php
Mail::raw('Evoke test email', fn ($m) => $m->to('you@example.com')->subject('Evoke test'));
```

### Option B — Trigger a real notification

1. Sign in on the live site as a customer.
2. Place a test shop order, or in admin change that user’s order/enrollment status.
3. Check inbox (and spam).

---

## 7. Troubleshooting

| Problem | Fix |
|---------|-----|
| No email received | Check Render logs for mail/Resend errors |
| `notification_logs` status `failed` | Neon SQL: `SELECT * FROM notification_logs WHERE channel='email' ORDER BY created_at DESC LIMIT 10` |
| Resend rejects From address | Verify domain in Resend; From must use that domain |
| Template missing | Re-run `NotificationTemplateSeeder` |
| Resend quota exceeded | SMTP backup sends if configured; check Resend dashboard usage |
| SMTP backup not used | Confirm `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD` on Render |

| No email in inbox | Check Neon `notification_logs` — `failed` shows Resend/SMTP error; `skipped` means mail not configured |
| `Please provide a valid cache path` | Fixed in latest API: creates `storage/framework/cache/data` on boot; redeploy after pulling |
| Push not received | `skipped` + "No device tokens" → enable notifications in account; "Firebase not configured" → set Render Firebase env |

Resend dashboard → **Logs** shows delivery, bounces, and API errors.

---

## Resend-only mode (no backup)

Set `MAIL_MAILER=resend` instead of `failover` if you do not want SMTP fallback.

---

## What sends email today

| Event | Email |
|-------|-------|
| Order placed (Razorpay pending) | Yes (receipt on place) |
| Order placed (no Razorpay) | Yes |
| Payment success (Razorpay) | No (in-app + push; email already sent on place) |
| Order status updated (admin) | Yes |
| Enrollment created / status updated | Yes |
| Booking created / status updated | Yes |
| Certificate issued | Yes |
| Tour enquiry submitted | Yes (to enquirer) |
| Payment success | No (in-app + push only) |
| Attendance marked | Yes |

---

## Checklist

- [ ] Resend account + API key
- [ ] Domain `evokegroup.in` verified in Resend
- [ ] Render: `MAIL_MAILER=failover`, `RESEND_API_KEY`, `MAIL_FROM_*`
- [ ] Optional: Gmail or Brevo SMTP vars for backup
- [ ] Render redeployed (latest code with `config/mail.php`)
- [ ] `NotificationTemplateSeeder` run on Neon
- [ ] Test email received
