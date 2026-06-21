# Option G — Production on AWS (EC2 + CI/CD)

Deploy Evoke on **AWS free tier**: EC2 `t3.micro`, **ECR** for Docker images, **GitHub Actions** for build and deploy via **SSM**.

**Budget:** ~₹0–500/month (12-month EC2 free tier + domain; small ECR charges possible)  
**Difficulty:** Medium — AWS console, CloudFormation, GitHub variables

Related: [DEPLOYMENT.md](../DEPLOYMENT.md) · [infra/aws/README.md](../../infra/aws/README.md)

---

## Architecture

```
GitHub push / manual workflow
        │
        ▼
GitHub Actions (build.yml / deploy-aws.yml)
        │
        ├── Build frontend + backend Docker images
        ├── Push to Amazon ECR
        └── SSM Run Command on EC2
                │
                ▼
        docker compose (infra/aws/docker-compose.aws.yml)
        nginx → frontend + backend + MySQL + Redis
        queue-worker + scheduler
```

All public URLs are configurable in **`/opt/evoke/deploy.env`** and GitHub repository variables.

**Default stack:** MySQL (not Postgres) to fit t3.micro RAM. AI/Ollama is disabled.

---

## Phase 0 — Local smoke test (do first)

```powershell
$env:NEXT_PUBLIC_API_URL = "https://yourdomain.com/api/v1"
.\scripts\run.ps1 prod up mysql --migrate
.\scripts\run.ps1 prod health
```

Fix any build or migration issues before creating AWS resources.

---

## Phase 1 — Prerequisites

- [ ] **AWS account** with billing enabled (free tier still requires a card)
- [ ] **AWS CLI** installed and configured: `aws configure`
- [ ] **Domain** registered
- [ ] **GitHub repo** pushed (includes `.github/workflows/` and `infra/aws/`)
- [ ] **Secrets ready** (not committed):
  - `APP_KEY` — generate with `php artisan key:generate --show`
  - Strong `DB_PASSWORD`
  - Optional: `RAZORPAY_*`, `RESEND_API_KEY`

### Decide URL layout

**Single domain (recommended for in-repo nginx):**

| Variable | Value |
|----------|-------|
| `APP_URL` | `https://yourdomain.com` |
| `FRONTEND_URL` | `https://yourdomain.com` |
| `NEXT_PUBLIC_API_URL` | `https://yourdomain.com/api/v1` |
| `SANCTUM_STATEFUL_DOMAINS` | `yourdomain.com,www.yourdomain.com` |
| `SESSION_DOMAIN` | `.yourdomain.com` |

Use the **same** `NEXT_PUBLIC_API_URL` in GitHub variables and on EC2 — the frontend image bakes this in at build time.

---

## Phase 2 — Deploy AWS infrastructure

From your machine, in the repo root:

```bash
aws cloudformation deploy \
  --template-file infra/aws/cloudformation/evoke-cicd.yaml \
  --stack-name evoke-cicd \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    NextPublicApiUrl=https://yourdomain.com/api/v1 \
    GitHubRepoUrl=https://github.com/YOUR_ORG/Evoke.git \
    GitHubBranch=master \
    CreateEc2Host=true \
    Ec2InstanceType=t3.micro

aws cloudformation deploy \
  --template-file infra/aws/cloudformation/github-oidc.yaml \
  --stack-name evoke-github-oidc \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    GitHubOrg=YOUR_ORG \
    GitHubRepo=Evoke
```

### Save stack outputs

```bash
aws cloudformation describe-stacks --stack-name evoke-cicd \
  --query "Stacks[0].Outputs" --output table

aws cloudformation describe-stacks --stack-name evoke-github-oidc \
  --query "Stacks[0].Outputs" --output table
```

You need:

| Output | Used for |
|--------|----------|
| `EcrRegistry` | GitHub var `ECR_REGISTRY`, EC2 `deploy.env` |
| `Ec2InstanceId` | GitHub var `EC2_INSTANCE_ID` |
| `Ec2PublicIp` | DNS A record |
| `RoleArn` (OIDC stack) | GitHub var `AWS_DEPLOY_ROLE_ARN` |

The EC2 instance bootstraps Docker and clones the repo to `/opt/evoke`.

---

## Phase 3 — Configure EC2

Connect via **Session Manager** (EC2 → Connect → Session Manager) or SSH.

Edit deploy configuration:

```bash
sudo nano /opt/evoke/deploy.env
```

Use [infra/aws/config/deploy.env.example](../../infra/aws/config/deploy.env.example) as reference. Minimum fields:

```env
AWS_REGION=ap-south-1
ECR_REGISTRY=123456789012.dkr.ecr.ap-south-1.amazonaws.com
IMAGE_TAG=latest

APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1

APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:YOUR_GENERATED_KEY

DB_CONNECTION=mysql
DB_PASSWORD=strong-password-here
DB_ROOT_PASSWORD=strong-root-password

SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
SESSION_DOMAIN=.yourdomain.com

RUN_MIGRATIONS=true
```

Render Laravel runtime env (used by compose):

```bash
chmod +x /opt/evoke/infra/aws/scripts/*.sh
/opt/evoke/infra/aws/scripts/render-env.sh /opt/evoke
```

---

## Phase 4 — Wire GitHub Actions

In GitHub: **Settings → Secrets and variables → Actions → Variables**

| Variable | Example |
|----------|---------|
| `AWS_REGION` | `ap-south-1` |
| `ECR_REGISTRY` | `123456789012.dkr.ecr.ap-south-1.amazonaws.com` |
| `AWS_DEPLOY_ROLE_ARN` | `arn:aws:iam::123456789012:role/evoke-github-actions-deploy` |
| `NEXT_PUBLIC_API_URL` | `https://yourdomain.com/api/v1` |
| `EC2_INSTANCE_ID` | `i-0abc123def456` |

Optional:

| Variable | Purpose |
|----------|---------|
| `AUTO_DEPLOY_ON_PUSH` | Set to `true` to deploy on every push to `master`/`main` |
| `AWS_DEPLOY_ENVIRONMENT` | GitHub Environment name (e.g. `production`) for approval gates |

No long-lived AWS access keys are needed — OIDC assumes the deploy role at runtime.

---

## Phase 5 — DNS

| Record | Type | Value |
|--------|------|-------|
| `@` | A | EC2 public IP |
| `www` | A or CNAME | Same |

---

## Phase 6 — First production deploy

### Option A — GitHub Actions (recommended)

1. Push your branch to GitHub
2. **Actions → Deploy AWS → Run workflow**
   - Confirm API URL (or override in input)
   - Enable deploy
3. Watch: build → push ECR → SSM runs `deploy.sh` on EC2

### Option B — Manual on EC2

After images exist in ECR (from a successful workflow or local push):

```bash
cd /opt/evoke
export IMAGE_TAG=latest
./infra/aws/scripts/deploy.sh
```

### Option C — CodeBuild only

```bash
aws codebuild start-build \
  --project-name evoke-build \
  --environment-variables-override \
    name=NEXT_PUBLIC_API_URL,value=https://yourdomain.com/api/v1,type=PLAINTEXT
```

Requires CodeBuild GitHub connection if using source-from-GitHub (see [infra/aws/README.md](../../infra/aws/README.md)).

---

## Phase 7 — HTTPS

The AWS compose stack exposes **port 80** on EC2. Add TLS on the host before go-live:

**Caddy (simplest):**

```bash
sudo apt install -y caddy   # Amazon Linux: see caddy.com docs
sudo cp /opt/evoke/infra/vps/Caddyfile.example /etc/caddy/Caddyfile
# Edit domain; point reverse_proxy to 127.0.0.1:80 (AWS nginx, not 8080)
sudo systemctl reload caddy
```

**Alternatives:** Certbot + Nginx on host, or **Cloudflare** proxy (SSL mode: Full strict).

Admin login and Sanctum cookies require HTTPS in production.

---

## Phase 8 — Go-live verification

```bash
curl -fsS https://yourdomain.com/api/v1/health
```

Browser checklist:

- [ ] Homepage over HTTPS
- [ ] Admin sign-in
- [ ] CMS / shop flows
- [ ] Email / payments (if configured)

On EC2:

```bash
docker compose --env-file /opt/evoke/deploy.env \
  -f /opt/evoke/infra/aws/docker-compose.aws.yml ps
```

`queue-worker` and `scheduler` should be running.

---

## Subsequent deploys

| Method | When |
|--------|------|
| Push to `main` + `AUTO_DEPLOY_ON_PUSH=true` | Automatic |
| **Actions → Deploy AWS** | Manual with optional URL/tag override |
| `./infra/aws/scripts/deploy.sh` on EC2 | Emergency / no GitHub |

When **`NEXT_PUBLIC_API_URL` changes**, you must **rebuild the frontend image** (workflow does this automatically).

---

## Changing endpoints

Update all three:

1. GitHub variable `NEXT_PUBLIC_API_URL`
2. `/opt/evoke/deploy.env` on EC2
3. CloudFormation parameter `NextPublicApiUrl` (if using CodeBuild project env)

Then run **Deploy AWS** again.

---

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Workflow OIDC fails | `AWS_DEPLOY_ROLE_ARN`, repo name in `github-oidc.yaml` |
| SSM deploy skipped | `EC2_INSTANCE_ID` set; instance has SSM agent + IAM role |
| ECR pull denied | EC2 role includes `AmazonEC2ContainerRegistryReadOnly` |
| 502 / health fails | `docker compose ps`; security group allows 80 |
| Login fails | HTTPS, `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN` |
| OOM on t3.micro | MySQL only; no AI; consider t3.small |

View SSM command output in AWS Console → Systems Manager → Run Command.

---

## Security checklist

- [ ] `APP_DEBUG=false`
- [ ] EC2 security group: 80, 443 public; SSH optional (prefer Session Manager)
- [ ] OIDC role scoped to your GitHub repo
- [ ] `deploy.env` and `backend.runtime.env` not in git
- [ ] ECR lifecycle policy to prune old tags (optional cost control)
- [ ] RDS/backups: snapshot MySQL volume or `mysqldump` cron

---

## Cost notes (free tier)

| Service | Free tier |
|---------|-----------|
| EC2 t3.micro | 750 hrs/month for 12 months |
| ECR | Storage charges apply; keep 1–2 tags |
| CodeBuild | 100 build minutes/month |
| GitHub Actions | 2,000 min/month (private repos) |

After 12 months, expect ~$8–15/month for t3.micro + minimal ECR unless you migrate to Option A VPS.

---

## Related

- [Option A — VPS](OPTION-A-VPS.md) — simpler single-server deploy without AWS
- [infra/aws/README.md](../../infra/aws/README.md) — pipeline file reference
- [DEPLOYMENT.md](../DEPLOYMENT.md) — all options and budgets
