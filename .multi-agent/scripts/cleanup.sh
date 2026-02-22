#!/bin/bash
# 오래된 로그/큐 파일 자동 정리 스크립트
# 사용법: bash .multi-agent/scripts/cleanup.sh
#   - 1년(365일) 초과 logs/YYYY-MM-DD/ 날짜 폴더 삭제
#   - 1년(365일) 초과 queue/processed/ 파일 삭제
# start.sh 실행 시 자동 호출됨

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_BASE="$PROJECT_ROOT/.multi-agent/logs"
QUEUE_PROCESSED="$PROJECT_ROOT/.multi-agent/queue/processed"
CUTOFF_DAYS=365

GREEN='\033[0;32m'
DIM='\033[2m'
NC='\033[0m'

removed=0

# ── logs/YYYY-MM-DD/ 날짜 폴더 정리 ──────────────────────────────────────────
if [ -d "$LOG_BASE" ]; then
  while IFS= read -r dir; do
    rm -rf "$dir"
    removed=$(( removed + 1 ))
    printf "  ${DIM}삭제: %s${NC}\n" "$dir"
  done < <(find "$LOG_BASE" -maxdepth 1 -type d -name '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]' -mtime +"$CUTOFF_DAYS" 2>/dev/null)
fi

# ── queue/processed/ 파일 정리 ───────────────────────────────────────────────
if [ -d "$QUEUE_PROCESSED" ]; then
  while IFS= read -r file; do
    rm -f "$file"
    removed=$(( removed + 1 ))
    printf "  ${DIM}삭제: %s${NC}\n" "$file"
  done < <(find "$QUEUE_PROCESSED" -maxdepth 1 -type f -mtime +"$CUTOFF_DAYS" 2>/dev/null)
fi

if [ "$removed" -eq 0 ]; then
  printf "  ${DIM}정리할 파일 없음 (${CUTOFF_DAYS}일 기준)${NC}\n"
else
  printf "  ${GREEN}✓ ${removed}개 항목 삭제 완료${NC}\n"
fi
