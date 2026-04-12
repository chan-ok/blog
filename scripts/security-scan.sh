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
  # 규칙: "패턴 = '실제값'" 형태만 검사 (변수명·타입 선언·null 체크 제외)
  # - 범용 패턴: key/secret/password 뒤에 따옴표로 감싼 값이 있는 경우만 매칭
  # - 특수 패턴: 포맷 자체가 시크릿인 것 (값 형식으로 판별 가능한 것들)
  SENSITIVE_PATTERNS="(\
api[_-]?key\s*[=:]\s*['\"][^'\"]{8,}|\
apikey\s*[=:]\s*['\"][^'\"]{8,}|\
api[_-]?secret\s*[=:]\s*['\"][^'\"]{8,}|\
auth[_-]?token\s*[=:]\s*['\"][^'\"]{8,}|\
access[_-]?token\s*[=:]\s*['\"][^'\"]{8,}|\
password\s*[=:]\s*['\"][^'\"]{4,}|\
passwd\s*[=:]\s*['\"][^'\"]{4,}|\
AKIA[0-9A-Z]{16}|\
BEGIN.*PRIVATE KEY|\
mongodb://[^@'\"\s]+:[^@'\"\s]+@|\
postgres://[^@'\"\s]+:[^@'\"\s]+@|\
mysql://[^@'\"\s]+:[^@'\"\s]+@|\
gh[pousr]_[0-9a-zA-Z]{36}|\
sk-[a-zA-Z0-9]{20,}|\
sk-ant-api[0-9]{2}-[a-zA-Z0-9_-]{90,}|\
AIza[0-9A-Za-z_-]{35}|\
hf_[a-zA-Z0-9]{30,}|\
r8_[a-zA-Z0-9]{30,}|\
xai-[a-zA-Z0-9]{30,}|\
['\"]mistral-[a-zA-Z0-9]{30,}['\"])"

  # 제외 패턴 (False Positive 방지)
  EXCLUDE_PATTERNS="(process\.env\.|NEXT_PUBLIC_|test\.|spec\.|mock|fixture|stories\.|example\.com|your-api-key|\*\*\*|xxx|REPLACE_ME|-tokens@|-token@|/tokens:|/token:|comma-separated-tokens|space-separated-tokens|pnpm-lock\.yaml)"
  
  # 스테이징된 변경사항에서 민감 정보 검색 (lock 파일·스크립트 제외)
  # 주의: 스크립트 파일(.sh) 제외 — 보안 패턴 문자열 자체가 오탐될 수 있음
  SENSITIVE_MATCHES=$(git diff --cached -- '*.ts' '*.tsx' '*.mts' '*.js' '*.jsx' '*.mjs' '*.env' '*.json' '*.yaml' '*.yml' ':(exclude)pnpm-lock.yaml' ':(exclude)package-lock.json' ':(exclude)yarn.lock' | grep -iE "$SENSITIVE_PATTERNS" | grep -ivE "$EXCLUDE_PATTERNS" | grep -E '^\+[^+]' || true)
  
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
