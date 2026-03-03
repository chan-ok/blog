#!/bin/bash
# 에이전트 재시작 스크립트
# 사용법: bash .multi-agent/scripts/resume.sh

set -e

SESSION_NAME="multi-agent"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPTS_DIR="$PROJECT_ROOT/.multi-agent/scripts"
PAUSE_MARKER="/tmp/multi-agent-paused"
PAUSE_STATE="/tmp/multi-agent-pause-state.json"
AGENTS="task-manager spec-manager worker-1 worker-2"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ── Step 1: pause 마커 파일 존재 확인 ────────────────────────────────────────
if [ ! -f "$PAUSE_MARKER" ]; then
  echo -e "${RED}❌ 에이전트가 일시중단 상태가 아닙니다. 먼저 pause.sh를 실행하세요.${NC}"
  exit 1
fi

# ── Step 2: tmux 세션 존재 확인 ───────────────────────────────────────────────
if ! tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  echo -e "${RED}❌ tmux 세션 '$SESSION_NAME'이 없습니다. 먼저 start.sh를 실행하세요.${NC}"
  exit 1
fi

echo "▶️  멀티 에이전트 재시작 중..."

# ── Step 3: /tmp/multi-agent-pause-state.json 읽어 stash 대상 worktree 파악 ──
echo "  📂 pause 상태 파일 읽는 중..."
stashed_paths=""
if [ -f "$PAUSE_STATE" ]; then
  if command -v jq >/dev/null 2>&1; then
    stashed_paths=$(jq -r '.stashed_worktrees[]' "$PAUSE_STATE" 2>/dev/null || true)
  else
    stashed_paths=$(grep -oE '"[^"]*"' "$PAUSE_STATE" \
      | grep '/' \
      | tr -d '"')
  fi
fi

# ── Step 4: 각 worktree에서 git stash pop 실행 ───────────────────────────────
if [ -n "$stashed_paths" ]; then
  echo "  💾 stash 복원 중..."
  for wt_path in $stashed_paths; do
    echo -e "    ${YELLOW}↳ stash pop: $wt_path${NC}"
    git -C "$wt_path" stash pop || true
  done
fi

# ── Step 5: 에이전트 창에서 opencode 재시작 ──────────────────────────────────
echo "  🚀 에이전트 재시작 중 (task-manager / spec-manager / worker-1 / worker-2)..."
for agent in $AGENTS; do
  case "$agent" in
    worker-*) oc_agent="worker" ;;
    *)        oc_agent="$agent"  ;;
  esac
  tmux send-keys -t "${SESSION_NAME}:${agent}" -l "opencode --agent ${oc_agent}" C-m
done

# ── Step 6: 3초 대기 후 dispatcher 재시작 ────────────────────────────────────
echo "  ⏳ 3초 대기 후 dispatcher 재시작..."
sleep 3
tmux send-keys -t "${SESSION_NAME}:dispatcher" \
  -l "bash $SCRIPTS_DIR/dispatcher.sh" C-m

# ── Step 7: 마커 파일 및 state 파일 삭제 ─────────────────────────────────────
rm -f "$PAUSE_MARKER"
rm -f "$PAUSE_STATE"

# ── Step 8: 완료 메시지 출력 ─────────────────────────────────────────────────
echo ""
echo -e "${GREEN}✅ 멀티 에이전트가 재시작되었습니다.${NC}"
echo ""
echo "💡 tmux 창 전환 방법:"
echo "   tmux attach -t $SESSION_NAME   — 세션 진입"
echo "   Ctrl+b, n                       — 다음 창으로 이동"
echo "   Ctrl+b, p                       — 이전 창으로 이동"
echo "   Ctrl+b, 숫자                    — 특정 창으로 이동"
