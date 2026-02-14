#!/usr/bin/env bash
set -euo pipefail

# ========================================
# 🔒 의존성 취약점 검사
# ========================================
# pnpm audit로 의존성 라이브러리의 알려진
# 보안 취약점을 검사합니다.
#
# 사용처: pre-push hook, CI/CD, pnpm dependency-audit
# ========================================

echo "🔍 Checking for dependency vulnerabilities..."

# pnpm audit 실행 (High 이상만 체크)
AUDIT_OUTPUT=$(pnpm audit --audit-level=high --json 2>/dev/null || echo '{}')

# Critical 또는 High 취약점 개수 확인
CRITICAL_COUNT=$(echo "$AUDIT_OUTPUT" | grep -o '"severity":"critical"' | wc -l)
HIGH_COUNT=$(echo "$AUDIT_OUTPUT" | grep -o '"severity":"high"' | wc -l)

CRITICAL_COUNT=$(echo "$CRITICAL_COUNT" | xargs)
HIGH_COUNT=$(echo "$HIGH_COUNT" | xargs)

if [ "$CRITICAL_COUNT" != "0" ] || [ "$HIGH_COUNT" != "0" ]; then
  echo "🚨 WARNING: Dependency vulnerabilities detected!"
  echo ""
  echo "Critical: $CRITICAL_COUNT"
  echo "High: $HIGH_COUNT"
  echo ""
  
  if [ "$CRITICAL_COUNT" != "0" ]; then
    echo "❌ Push blocked: Critical vulnerabilities must be fixed."
    echo ""
    echo "💡 Fix:"
    echo "  pnpm audit fix"
    echo "  # or"
    echo "  pnpm update <package-name>"
    echo ""
    echo "Run 'pnpm audit' to see detailed vulnerability report."
    exit 1
  fi
  
  if [ "$HIGH_COUNT" -ge "3" ]; then
    echo "⚠️  Push blocked: Too many High severity vulnerabilities ($HIGH_COUNT)."
    echo ""
    echo "💡 Fix:"
    echo "  pnpm audit fix"
    echo "  # or"
    echo "  pnpm update <package-name>"
    echo ""
    echo "Run 'pnpm audit' to see detailed vulnerability report."
    exit 1
  fi
  
  echo "⚠️  Push allowed, but please consider fixing these vulnerabilities soon."
  echo "Run 'pnpm audit' to see detailed vulnerability report."
else
  echo "✅ No critical or high severity vulnerabilities found."
fi