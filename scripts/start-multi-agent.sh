#!/bin/bash
# tmux 기반 멀티 에이전트 시스템 시작 스크립트
# 6개 pane에 에이전트를 배치합니다.

set -e

SESSION_NAME="multi-agent"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 사전 요구사항 확인
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
  echo "   생성: mkdir -p .multi-agent/{specs,queue,status,config,templates}"
  exit 1
fi

echo -e "${GREEN}✅ 모든 사전 요구사항이 충족되었습니다.${NC}"

# 기존 세션 종료
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
  echo -e "${YELLOW}⚠️  기존 세션 '$SESSION_NAME'을 종료합니다.${NC}"
  tmux kill-session -t $SESSION_NAME
fi

echo "🚀 tmux 세션 생성 중..."

# 새 세션 생성 (Pane 0: 컨설턴트)
tmux new-session -d -s $SESSION_NAME -c $PROJECT_ROOT

# Pane 1, 2: 작업관리자, 명세서관리자 (수평 분할)
tmux split-window -h -t $SESSION_NAME:0 -c $PROJECT_ROOT
tmux split-window -v -t $SESSION_NAME:0.0 -c $PROJECT_ROOT

# Pane 3, 4, 5: 작업자 (3분할)
tmux split-window -v -t $SESSION_NAME:0.1 -c $PROJECT_ROOT
tmux split-window -h -t $SESSION_NAME:0.3 -c $PROJECT_ROOT
tmux split-window -h -t $SESSION_NAME:0.4 -c $PROJECT_ROOT

# 레이아웃 조정
tmux select-layout -t $SESSION_NAME:0 main-horizontal

# 각 pane에 레이블 설정
tmux select-pane -t 0 -T "Consultant"
tmux select-pane -t 1 -T "TaskManager"
tmux select-pane -t 2 -T "SpecManager"
tmux select-pane -t 3 -T "Worker-1"
tmux select-pane -t 4 -T "Worker-2"
tmux select-pane -t 5 -T "Worker-3"

echo "📝 에이전트 시작 안내 메시지 표시 중..."

# 각 pane에 시작 안내 메시지 (opencode 자동 실행 제거)
tmux send-keys -t 0 "echo '🤖 Consultant Pane - opencode 실행 후 consultant 에이전트를 선택하세요'" C-m
tmux send-keys -t 1 "echo '🤖 TaskManager Pane - opencode 실행 후 task-manager 에이전트를 선택하세요'" C-m
tmux send-keys -t 2 "echo '🤖 SpecManager Pane - opencode 실행 후 spec-manager 에이전트를 선택하세요'" C-m
tmux send-keys -t 3 "echo '🤖 Worker-1 Pane - 필요 시 opencode 실행 후 worker 에이전트를 선택하세요'" C-m
tmux send-keys -t 4 "echo '🤖 Worker-2 Pane - 필요 시 opencode 실행 후 worker 에이전트를 선택하세요'" C-m
tmux send-keys -t 5 "echo '🤖 Worker-3 Pane - 필요 시 opencode 실행 후 worker 에이전트를 선택하세요'" C-m

# Pane 0으로 포커스
tmux select-pane -t 0

echo -e "${GREEN}✅ tmux 세션이 생성되었습니다!${NC}"
echo ""
echo "📌 사용 방법:"
echo "   - 각 pane에서 'opencode' 명령을 실행하고 해당 에이전트를 선택하세요"
echo "   - Pane 간 이동: Ctrl-b [0-5]"
echo "   - 세션 detach: Ctrl-b d"
echo "   - 세션 종료: tmux kill-session -t multi-agent"
echo ""
echo "📚 다음 단계:"
echo "   1. watchman 트리거 설정: bash scripts/setup-watchman.sh"
echo "   2. Pane 0 (Consultant)에서 요구사항 입력"
echo ""

# 세션 연결
tmux attach-session -t $SESSION_NAME
