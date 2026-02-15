#!/usr/bin/env bash
set -euo pipefail

# ========================================
# 🔒 보안 취약점 스캔
# ========================================
# 스테이징된 파일에서 민감 정보를 검사합니다.
# - .env 파일 커밋 차단
# - API Key, Token, Password 등 민감 정보 패턴 검사
#
# 사용처: pre-commit hook, CI/CD, pnpm security-scan
# ========================================

echo "🔍 Scanning for security vulnerabilities..."

# 스테이징된 파일 목록
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|env)$' || true)

if [ -z "$STAGED_FILES" ]; then
  echo "✅ No relevant files to scan."
else
  echo "Scanning ${STAGED_FILES}"
  
  # 1. 환경 변수 파일 커밋 시도 차단
  ENV_FILES=$(git diff --cached --name-only | grep -E '\.env(\..*)?' || true)
  if [ -n "$ENV_FILES" ]; then
    echo "🚨 ERROR: Environment files detected in staged changes!"
    echo "$ENV_FILES"
    echo ""
    echo "❌ Commit blocked: .env files must not be committed."
    echo "Run: git reset HEAD $ENV_FILES"
    exit 1
  fi
  
  # 2. 민감 정보 패턴 검사
  SENSITIVE_PATTERNS="(api[_-]?key|apikey|api[_-]?secret|token|auth[_-]?token|password|passwd|pwd|AKIA[0-9A-Z]{16}|BEGIN.*PRIVATE KEY|mongodb://.*:.*@|postgres://.*:.*@|mysql://.*:.*@|gh[pousr]_[0-9a-zA-Z]{36})"
  
  # 제외 패턴 (False Positive 방지)
  EXCLUDE_PATTERNS="(process\.env\.|NEXT_PUBLIC_|test\.|spec\.|mock|fixture|stories\.|example\.com|your-api-key|\*\*\*|xxx|REPLACE_ME|-tokens@|-token@|/tokens:|/token:|comma-separated-tokens|space-separated-tokens|pnpm-lock\.yaml)"
  
  # 스테이징된 변경사항에서 민감 정보 검색
  SENSITIVE_MATCHES=$(git diff --cached | grep -iE "$SENSITIVE_PATTERNS" | grep -ivE "$EXCLUDE_PATTERNS" | grep -E '^\+[^+]' || true)
  
  if [ -n "$SENSITIVE_MATCHES" ]; then
    echo "🚨 ERROR: Potential sensitive data detected in staged changes!"
    echo ""
    echo "$SENSITIVE_MATCHES"
    echo ""
    echo "❌ Commit blocked: Remove hardcoded credentials before committing."
    echo ""
    echo "💡 Fix:"
    echo "  1. Move sensitive values to .env.local"
    echo "  2. Use process.env.YOUR_SECRET_KEY in code"
    echo "  3. Ensure .env.local is in .gitignore"
    exit 1
  fi
  
  echo "✅ No sensitive data detected."
fi
