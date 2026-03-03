#!/bin/bash
# tmux 기반 멀티 에이전트 시스템 시작 스크립트 (v4.8.0)
#
# Window 구조:
#   Window 0 (monitor)     : 5-pane 모니터링 대시보드 — 좌우 2분할
#                            좌: Overview (전체 높이, 60%)
#                            우: Task-Manager / Spec-Manager / Worker-1 / Worker-2 (40%)
#   Window 1 (consultant)  : opencode TUI — 사용자가 직접 대화하는 창
#   Window 2 (task-manager): opencode run 로그 + 자동 재대기 루프
#   Window 3 (spec-manager): opencode run 로그 + 자동 재대기 루프
#   Window 4 (worker-1)    : opencode run 로그 + 자동 재대기 루프
#   Window 5 (worker-2)    : opencode run 로그 + 자동 재대기 루프
#
# 변경 내역 (v4.8.0):
#   - 스크립트 위치 .multi-agent/scripts/ 로 이동
#   - 로그 날짜 폴더 구조 적용: logs/YYYY-MM-DD/<agent>-HHMMSS.log
#   - pipe-pane ANSI 이스케이프 실시간 제거 + UTF-8 인코딩 고정
#   - 시작 시 cleanup.sh 자동 호출 (1년 초과 파일 정리)
#
# 변경 내역 (v4.7.0):
#   - overview/에이전트 너비 비율 60/40 조정 (main-vertical 이후 resize)
#
# 변경 내역 (v4.6.0):
#   - worker-3 제거 (맥북 M1 13인치 메모리 제약)
#   - 레이아웃: main-vertical (좌측 Overview 60%, 우측 4-pane 균등)
#   - 깜빡임 없는 대시보드 갱신 (커서 홈 방식)

set -e

SESSION_NAME="multi-agent"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPTS_DIR="$PROJECT_ROOT/.multi-agent/scripts"
TODAY=$(date +%Y-%m-%d)
LOG_TS=$(date +%H%M%S)
LOG_DIR="$PROJECT_ROOT/.multi-agent/logs/${TODAY}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 사전 요구사항 확인 중..."

if ! command -v tmux &> /dev/null; then
  echo -e "${RED}❌ tmux가 설치되지 않았습니다.${NC}"
  echo "   설치: brew install tmux"
  exit 1
fi

if ! command -v opencode &> /dev/null; then
  echo -e "${RED}❌ opencode가 설치되지 않았습니다.${NC}"
  echo "   설치: https://opencode.ai"
  exit 1
fi

if [ ! -d "$PROJECT_ROOT/.multi-agent" ]; then
  echo -e "${RED}❌ .multi-agent 디렉토리가 없습니다.${NC}"
  echo "   생성: mkdir -p .multi-agent/{specs,queue,status,config,templates,scripts}"
  exit 1
fi

# 날짜별 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

echo -e "${GREEN}✅ 모든 사전 요구사항이 충족되었습니다.${NC}"
