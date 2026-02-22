#!/bin/bash
# tmux 멀티 에이전트 세션 종료 스크립트 (v5.0.0)
# 사용법: bash .multi-agent/scripts/stop.sh
#
# 대화 기록을 저장하려면 종료 전 'ma export'를 실행하세요.

SESSION_NAME="multi-agent"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if ! tmux has-session -t $SESSION_NAME 2>/dev/null; then
  echo -e "${YELLOW}⚠️  세션 '$SESSION_NAME'이 없습니다. 이미 종료되었습니다.${NC}"
  exit 0
fi

echo "🛑 tmux 세션 '$SESSION_NAME' 종료 중..."
tmux kill-session -t $SESSION_NAME 2>/dev/null || true

echo -e "${GREEN}✅ 세션이 종료되었습니다.${NC}"
echo ""
echo -e "  ${YELLOW}💡 대화 기록을 저장하려면 종료 전에 'ma export'를 실행하세요.${NC}"
