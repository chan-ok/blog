#!/bin/bash
# watchman spec 파일 변경 감지 → 명세서관리자에 알림 (v1.0.0)

SESSION_NAME="multi-agent"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

BLUE='\\033[0;34m'
GREEN='\\033[0;32m'
NC='\\033[0m'

echo -e "${BLUE}[watchman]${NC} spec 파일 변경 감지 - 명세서관리자에 알림 전송..."

if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  tmux send-keys -t "${SESSION_NAME}:spec-manager" "bd list --tag validate_spec --assign spec-manager --status open" C-m
  echo -e "  ${GREEN}→${NC} spec-manager (명세서 검증 요청)"
else
  echo -e "  ✗ 세션 없음"
fi

echo -e "${BLUE}[watchman]${NC} 알림 전송 완료"

exit 0
