#!/usr/bin/env bash
set -euo pipefail
# CodeDeploy BeforeInstall — ensure deploy tooling exists.
EVOKE_ROOT="/opt/evoke"
mkdir -p "$EVOKE_ROOT"
chmod +x "${EVOKE_ROOT}/infra/aws/scripts/"*.sh 2>/dev/null || true
