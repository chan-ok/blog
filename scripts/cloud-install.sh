#!/usr/bin/env bash
set -euo pipefail
node -e 'if (process.versions.node.split(".")[0] !== "24") throw new Error("Node.js 24 is required")'
export npm_config_cache=/workspace/.onboarding/npm-cache
export XDG_CACHE_HOME=/workspace/.onboarding/cache
export XDG_CONFIG_HOME=/workspace/.onboarding/config
export XDG_DATA_HOME=/workspace/.onboarding/data
export ASTRO_TELEMETRY_DISABLED=1
export NODE_USE_ENV_PROXY=1
export NODE_USE_SYSTEM_CA=1
npm install --prefix /workspace/.onboarding/tools --save-exact pnpm@11.18.0 --no-audit --no-fund
export PATH=/workspace/.onboarding/tools/node_modules/.bin:$PATH
export BLOG_CONTENT_DIR="${BLOG_CONTENT_DIR:-/workspace/blog-content}"
test -d "$BLOG_CONTENT_DIR/ko"
cd /workspace/blog
pnpm install --frozen-lockfile --store-dir /workspace/.onboarding/pnpm-store
cd /workspace/blog-content
pnpm install --frozen-lockfile --ignore-scripts --store-dir /workspace/.onboarding/pnpm-store
