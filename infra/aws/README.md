# Evoke — AWS build & deploy pipelines

Free-tier friendly CI/CD: **GitHub Actions** (recommended) or **AWS CodeBuild**, deploying Docker images to **ECR** and running on a **t3.micro EC2** instance via **SSM**.

**Step-by-step production guide:** [docs/deploy/OPTION-G-AWS.md](../../docs/deploy/OPTION-G-AWS.md)

All public endpoints are configurable — no hard-coded domains.

---

## Architecture

```
GitHub push / manual dispatch
        │
        ▼
┌───────────────────┐     ┌─────────────┐     ┌─────────────────────────┐
│  Build pipeline   │────►│  Amazon ECR │────►│  EC2 (docker compose)   │
│  GHA or CodeBuild │     │  frontend   │     │  nginx → Next + Laravel │
└───────────────────┘     │  backend    │     │  MySQL + Redis          │
                          └─────────────┘     └─────────────────────────┘
```

| Component | Free tier notes |
|-----------|-----------------|
| EC2 `t3.micro` | 750 hrs/month (12 months) |
| ECR | Pay per GB stored — keep few tags |
| CodeBuild | 100 build min/month |
| GitHub Actions | 2,000 min/month (private repos) |

**MySQL** (not Postgres) is the default on EC2 to fit 1 GB RAM. AI/RAG is disabled on this stack.

---

## 1. One-time AWS setup

### A. Deploy CloudFormation stacks

```bash
aws cloudformation deploy \
  --template-file infra/aws/cloudformation/evoke-cicd.yaml \
  --stack-name evoke-cicd \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    NextPublicApiUrl=https://yourdomain.com/api/v1 \
    GitHubRepoUrl=https://github.com/YOUR_ORG/Evoke.git \
    GitHubBranch=master \
    CreateEc2Host=true

aws cloudformation deploy \
  --template-file infra/aws/cloudformation/github-oidc.yaml \
  --stack-name evoke-github-oidc \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    GitHubOrg=YOUR_ORG \
    GitHubRepo=Evoke
```

Note the outputs: `EcrRegistry`, `Ec2InstanceId`, `RoleArn`.

### B. Connect GitHub to CodeBuild (optional)

If using **CodeBuild** with GitHub source directly:

1. AWS Console → Developer Tools → Connections → Create GitHub connection
2. Update the CodeBuild project source to use that connection

Or skip this and use **GitHub Actions** only (`deploy-aws.yml`).

### C. Configure EC2

SSH or **Session Manager** into the instance:

```bash
sudo nano /opt/evoke/deploy.env
```

Copy from `infra/aws/config/deploy.env.example` and set:

| Variable | Example |
|----------|---------|
| `APP_URL` | `https://yourdomain.com` |
| `FRONTEND_URL` | `https://yourdomain.com` |
| `NEXT_PUBLIC_API_URL` | `https://yourdomain.com/api/v1` |
| `ECR_REGISTRY` | From CloudFormation output |
| `APP_KEY` | `php artisan key:generate --show` |
| `DB_PASSWORD` | Strong password |

Point your domain **A record** to the EC2 public IP. Add HTTPS with Caddy/Certbot on the host or an ALB (not included in free tier by default).

---

## 2. GitHub repository variables

Settings → Secrets and variables → Actions → **Variables**:

| Variable | Description |
|----------|-------------|
| `AWS_REGION` | e.g. `ap-south-1` |
| `ECR_REGISTRY` | `123456789012.dkr.ecr.ap-south-1.amazonaws.com` |
| `AWS_DEPLOY_ROLE_ARN` | From `github-oidc.yaml` output |
| `NEXT_PUBLIC_API_URL` | Public API URL for frontend build |
| `EC2_INSTANCE_ID` | From `evoke-cicd` stack |
| `AUTO_DEPLOY_ON_PUSH` | Set `true` to deploy on every push to main |
| `CODEBUILD_PROJECT_NAME` | `evoke-build` (if using CodeBuild workflow) |

Optional **Environment** `production` with protection rules for deploy approval.

---

## 3. Pipelines

### Build (CI) — `.github/workflows/build.yml`

Runs on every PR and push:

- Frontend lint + `next build`
- Backend Composer install + route list
- Docker smoke build (on push only)

### Deploy AWS — `.github/workflows/deploy-aws.yml`

- **Manual**: Actions → Deploy AWS → set API URL override and tag
- **Automatic**: push to `master`/`main` when `AUTO_DEPLOY_ON_PUSH=true`

Builds images with configurable `NEXT_PUBLIC_API_URL`, pushes to ECR, runs `deploy.sh` on EC2 via SSM.

### CodeBuild AWS — `.github/workflows/codebuild-aws.yml`

Starts the AWS CodeBuild project (uses `infra/aws/buildspec.yml`). Useful when you want builds to run entirely inside AWS.

### AWS CodeBuild only (no GitHub Actions deploy)

```bash
aws codebuild start-build \
  --project-name evoke-build \
  --environment-variables-override \
    name=NEXT_PUBLIC_API_URL,value=https://yourdomain.com/api/v1,type=PLAINTEXT
```

Set `EC2_INSTANCE_ID` on the CodeBuild project to auto-deploy after push.

---

## 4. Manual deploy on EC2

```bash
cd /opt/evoke
git pull
export IMAGE_TAG=latest   # or a specific git SHA tag
./infra/aws/scripts/deploy.sh
```

---

## 5. Changing endpoints

Update **three places** when your domain changes:

1. **GitHub variable** `NEXT_PUBLIC_API_URL` (frontend rebuild required)
2. **`/opt/evoke/deploy.env`** on EC2 (`APP_URL`, `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`)
3. **CodeBuild parameter** `NextPublicApiUrl` (if using CloudFormation/CodeBuild)

Then redeploy so the frontend image is rebuilt with the new API URL.

---

## 6. S3 media storage (optional)

For production, store CMS uploads, avatars, and certificates on **Amazon S3** instead of the EC2 disk:

1. Create a bucket (e.g. `evoke-media-prod`) in the same region as EC2.
2. Enable **Block Public Access** off only if using direct bucket URLs, or front the bucket with **CloudFront**.
3. Bucket policy — allow public `GetObject` on `cms/*`, `avatars/*`, `academy/*` (or use CloudFront OAC).
4. IAM user or instance role with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on the bucket.
5. Set in `deploy.env`:

```bash
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=ap-south-1
AWS_BUCKET=evoke-media-prod
AWS_URL=https://evoke-media-prod.s3.ap-south-1.amazonaws.com
NEXT_PUBLIC_MEDIA_BASE_URL=https://evoke-media-prod.s3.ap-south-1.amazonaws.com
```

6. Set GitHub variable `NEXT_PUBLIC_MEDIA_BASE_URL` (same value) and **rebuild the frontend**.
7. Run `./infra/aws/scripts/render-env.sh` and redeploy.

Demo seed data uses external Unsplash URLs; admin uploads after go-live go to S3 automatically when `FILESYSTEM_DISK=s3`.

---

## Files

| Path | Purpose |
|------|---------|
| `infra/aws/buildspec.yml` | CodeBuild build + optional SSM deploy |
| `infra/aws/docker-compose.aws.yml` | EC2 production stack |
| `infra/aws/config/deploy.env.example` | Configurable endpoints template |
| `infra/aws/scripts/deploy.sh` | Pull ECR + migrate + restart |
| `infra/aws/scripts/bootstrap-ec2.sh` | Manual EC2 bootstrap |
| `infra/aws/cloudformation/evoke-cicd.yaml` | ECR + CodeBuild + EC2 |
| `infra/aws/cloudformation/github-oidc.yaml` | GitHub Actions IAM role |
| `backend/Dockerfile.prod` | Production API image |
| `.github/workflows/build.yml` | CI |
| `.github/workflows/deploy-aws.yml` | Deploy |

See also [docs/DEPLOYMENT.md](../../docs/DEPLOYMENT.md) for general hosting guidance.
