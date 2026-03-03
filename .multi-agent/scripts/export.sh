#!/bin/bash
# opencode 세션 대화 기록 내보내기 스크립트 (v1.0.0)
# 사용법: bash .multi-agent/scripts/export.sh [export_dir]
#
# 기본 저장 위치: .multi-agent/logs/<오늘날짜>/exports/
# 인자로 경로를 지정하면 해당 경로에 저장합니다.

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TODAY=$(date +%Y-%m-%d)
DEFAULT_EXPORT_DIR="$PROJECT_ROOT/.multi-agent/logs/${TODAY}/exports"
EXPORT_DIR="${1:-$DEFAULT_EXPORT_DIR}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

mkdir -p "$EXPORT_DIR"

EXPORT_TS=$(date +%Y%m%d-%H%M%S)

echo "💾 opencode 세션 대화 기록 내보내는 중..."
echo "   저장 위치: $EXPORT_DIR"

SESSION_LIST=$(opencode session list 2>/dev/null || true)

if [ -n "$SESSION_LIST" ]; then
  export_count=0
  while IFS= read -r line; do
    session_id=$(echo "$line" | awk '{print $1}' | tr -d '[:space:]')
    [ -z "$session_id" ] && continue
    [ "$session_id" = "ID" ] && continue  # 헤더 스킵

    export_file="$EXPORT_DIR/session-${session_id}-${EXPORT_TS}.json"
    if opencode export "$session_id" > "$export_file" 2>/dev/null; then
      echo -e "  ${GREEN}✓${NC} 세션 $session_id → $(basename "$export_file")"
      export_count=$((export_count + 1))
    else
      rm -f "$export_file"
    fi
  done <<< "$SESSION_LIST"

  if [ "$export_count" -gt 0 ]; then
    echo -e "${GREEN}✅ 대화 기록 저장 완료 (${export_count}건): $EXPORT_DIR${NC}"
  else
    echo -e "  ${YELLOW}⚠️  내보낼 opencode 세션이 없습니다.${NC}"
  fi
else
  echo -e "  ${YELLOW}⚠️  내보낼 opencode 세션이 없습니다.${NC}"
fi
