#!/bin/bash
# tmux 멀티 에이전트 세션 종료 스크립트 (v4.4.0)
# 사용법: bash .multi-agent/scripts/stop.sh

SESSION_NAME="multi-agent"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$PROJECT_ROOT/.multi-agent/logs"
TODAY=$(date +%Y-%m-%d)
EXPORT_DIR="$PROJECT_ROOT/.multi-agent/logs/${TODAY}/exports"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

mkdir -p "$EXPORT_DIR"

EXPORT_TS=$(date +%Y%m%d-%H%M%S)

if ! tmux has-session -t $SESSION_NAME 2>/dev/null; then
  echo -e "${YELLOW}⚠️  세션 '$SESSION_NAME'이 없습니다. 이미 종료되었습니다.${NC}"
  exit 0
fi

echo "💾 opencode 세션 대화 기록 내보내는 중..."
echo "   저장 위치: $EXPORT_DIR"

# opencode session list로 현재 세션 목록 확인 후 export
SESSION_LIST=$(opencode session list 2>/dev/null || true)

if [ -n "$SESSION_LIST" ]; then
  while IFS= read -r line; do
    # 세션 ID 추출 (첫 번째 컬럼)
    session_id=$(echo "$line" | awk '{print $1}' | tr -d '[:space:]')
    [ -z "$session_id" ] && continue
    [ "$session_id" = "ID" ] && continue  # 헤더 스킵

    export_file="$EXPORT_DIR/session-${session_id}-${EXPORT_TS}.json"
    if opencode export "$session_id" > "$export_file" 2>/dev/null; then
      echo -e "  ${GREEN}✓${NC} 세션 $session_id → $(basename "$export_file")"
    else
      rm -f "$export_file"
    fi
  done <<< "$SESSION_LIST"
  echo -e "${GREEN}✅ 대화 기록 저장 완료: $EXPORT_DIR${NC}"
else
  echo -e "  ${YELLOW}⚠️  내보낼 opencode 세션이 없습니다.${NC}"
fi

echo ""
echo "🛑 tmux 세션 '$SESSION_NAME' 종료 중..."
tmux kill-session -t $SESSION_NAME 2>/dev/null || true

echo -e "${GREEN}✅ 세션이 종료되었습니다.${NC}"
echo ""
echo "📝 저장된 파일:"
echo "   실시간 로그: $LOG_DIR/"
echo "   대화 기록:   $EXPORT_DIR/"
