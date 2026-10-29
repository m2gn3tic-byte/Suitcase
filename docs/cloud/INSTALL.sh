#!/usr/bin/env bash
set -euo pipefail
cd /workspace/Suitcase
npm ci --no-audit --no-fund
npm run build:standalone
npx --no-install cap sync android
