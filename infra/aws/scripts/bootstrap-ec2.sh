#!/usr/bin/env bash
# First-time EC2 bootstrap for Amazon Linux 2023 (t3.micro free tier).
# Run as root: curl -fsSL ... | bash  OR  bash bootstrap-ec2.sh
set -euo pipefail

EVOKE_ROOT="${EVOKE_ROOT:-/opt/evoke}"
EVOKE_REPO="${EVOKE_REPO:-https://github.com/your-org/evoke.git}"
EVOKE_BRANCH="${EVOKE_BRANCH:-master}"

echo "==> Installing Docker..."
dnf update -y
dnf install -y docker git curl jq aws-cli
systemctl enable --now docker
usermod -aG docker ec2-user || true

if ! docker compose version >/dev/null 2>&1; then
  mkdir -p /usr/libexec/docker/cli-plugins
  curl -fsSL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
    -o /usr/libexec/docker/cli-plugins/docker-compose
  chmod +x /usr/libexec/docker/cli-plugins/docker-compose
fi

echo "==> Cloning Evoke to ${EVOKE_ROOT}..."
if [[ ! -d "${EVOKE_ROOT}/.git" ]]; then
  git clone --branch "$EVOKE_BRANCH" --depth 1 "$EVOKE_REPO" "$EVOKE_ROOT"
else
  git -C "$EVOKE_ROOT" fetch origin "$EVOKE_BRANCH"
  git -C "$EVOKE_ROOT" checkout "$EVOKE_BRANCH"
  git -C "$EVOKE_ROOT" pull --ff-only
fi

chmod +x "${EVOKE_ROOT}/infra/aws/scripts/"*.sh

if [[ ! -f "${EVOKE_ROOT}/deploy.env" ]]; then
  cp "${EVOKE_ROOT}/infra/aws/config/deploy.env.example" "${EVOKE_ROOT}/deploy.env"
  echo ""
  echo "Created ${EVOKE_ROOT}/deploy.env — edit URLs, APP_KEY, and DB passwords before deploying."
fi

echo "==> Bootstrap done."
echo "Next steps:"
echo "  1. Edit ${EVOKE_ROOT}/deploy.env (APP_URL, NEXT_PUBLIC_API_URL, secrets)"
echo "  2. Ensure this instance IAM role can pull from ECR (AmazonEC2ContainerRegistryReadOnly)"
echo "  3. Run: ${EVOKE_ROOT}/infra/aws/scripts/deploy.sh"
