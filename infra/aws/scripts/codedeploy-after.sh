#!/usr/bin/env bash
set -euo pipefail
# CodeDeploy AfterInstall — pull latest images and restart stack.
EVOKE_ROOT="/opt/evoke"
export EVOKE_ROOT
export IMAGE_TAG="${IMAGE_TAG:-latest}"
bash "${EVOKE_ROOT}/infra/aws/scripts/deploy.sh"
