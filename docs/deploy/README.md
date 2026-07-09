# Production deployment runbooks

Step-by-step guides to go live with Evoke.

| Path | Guide | Best for |
|------|-------|----------|
| **Option C** | [OPTION-C-FREE.md](OPTION-C-FREE.md) | **Free testing** — Oracle Cloud, Vercel + Render |
| **Option A** | [OPTION-A-VPS.md](OPTION-A-VPS.md) | Single VPS (~₹450–750/mo), Hostinger / Hetzner |
| **Option G** | [OPTION-G-AWS.md](OPTION-G-AWS.md) | AWS free tier, ECR + GitHub Actions |

Both guides assume you have completed a **local production smoke test** first:

```powershell
# Windows
$env:NEXT_PUBLIC_API_URL = "https://yourdomain.com/api/v1"
.\scripts\run.ps1 prod up mysql --migrate
.\scripts\run.ps1 prod health
```

```bash
# Linux / macOS
export NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
./scripts/run.sh prod up mysql --migrate
./scripts/run.sh prod health
```

Overview of all hosting options: [DEPLOYMENT.md](../DEPLOYMENT.md).

---

## Which path should I choose?

| Choose **Option C (free)** if… | Choose **Option A (VPS)** if… | Choose **Option G (AWS)** if… |
|-------------------------------|-------------------------------|-------------------------------|
| You want ₹0 for demos / stakeholder testing | You want one simple monthly bill | You already use AWS or want free-tier EC2 |
| Oracle Always Free or Vercel+Render is OK | You prefer SSH + Docker on one box | You want automated CI/CD on every push |
| Cold starts and upload limits are acceptable | Indian/EU VPS providers are fine | You're OK with AWS console + IAM setup |

---

## Shared checklist (both paths)

Before either runbook:

- [ ] Domain registered
- [ ] `APP_KEY` generated (`php artisan key:generate --show`)
- [ ] Production URLs decided (single domain vs split API subdomain)
- [ ] Optional: Razorpay, Resend, MSG91 keys if those features go live on day one
- [ ] Local `prod up` + `prod health` passes

After either runbook:

- [ ] HTTPS working (Caddy, Certbot, or Cloudflare)
- [ ] `GET /api/v1/health` returns OK
- [ ] Admin login works
- [ ] Queue worker and scheduler running
- [ ] `APP_DEBUG=false`, backups configured

See [Post-deploy checklist](../DEPLOYMENT.md#post-deploy-checklist) in DEPLOYMENT.md.
