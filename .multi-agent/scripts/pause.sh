#!/bin/bash
# 에이전트 일시중단 스크립트
# 사용법: bash .multi-agent/scripts/pause.sh

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

# ── Step 1: tmux 세션 존재 확인 ───────────────────────────────────────────────
if ! tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  echo -e "${RED}❌ tmux 세션 '$SESSION_NAME'이 없습니다. 먼저 start.sh를 실행하세요.${NC}"
  exit 1
fi

echo "⏸️  멀티 에이전트 일시중단 중..."

# ── Step 2: dispatcher 창 중단 (Ctrl+C 전송) ─────────────────────────────────
echo "  🛑 dispatcher 중단 중..."
tmux send-keys -t "${SESSION_NAME}:dispatcher" C-c
sleep 1

# ── Step 3: 에이전트 창 중단 (consultant 제외) ───────────────────────────────
echo "  🛑 에이전트 창 중단 중 (task-manager / spec-manager / worker-1 / worker-2)..."
for agent in $AGENTS; do
  tmux send-keys -t "${SESSION_NAME}:${agent}" C-c
done
sleep 2

# ── Step 4: git worktree 목록 수집 ───────────────────────────────────────────
echo "  📂 git worktree 목록 수집 중..."
worktree_list=$(git worktree list --porcelain | awk '/^worktree /{print $2}')

# ── Step 5: 각 worktree uncommitted changes stash ─────────────────────────────
echo "  💾 uncommitted 변경사항 stash 중..."
stashed_list=""
for wt_path in $worktree_list; do
  changes=$(git -C "$wt_path" status --porcelain 2>/dev/null || true)
  if [ -n "$changes" ]; then
    echo -e "    ${YELLOW}↳ stash: $wt_path${NC}"
    if git -C "$wt_path" stash push -m "multi-agent-pause" 2>/dev/null; then
      if [ -z "$stashed_list" ]; then
        stashed_list="$wt_path"
      else
        stashed_list="$stashed_list $wt_path"
      fi
    fi
  fi
done

# ── Step 6: /tmp/multi-agent-pause-state.json 생성 ────────────────────────────
echo "  📝 pause 상태 파일 저장 중..."
if [ -z "$stashed_list" ]; then
  printf '{\n  "stashed_worktrees": []\n}\n' > "$PAUSE_STATE"
else
  printf '{\n  "stashed_worktrees": [\n' > "$PAUSE_STATE"
  first=1
  for wt_path in $stashed_list; do
    [ "$first" -eq 1 ] && first=0 || printf ',\n' >> "$PAUSE_STATE"
    printf '    "%s"' "$wt_path" >> "$PAUSE_STATE"
  done
  printf '\n  ]\n}\n' >> "$PAUSE_STATE"
fi

# ── Step 7: /tmp/multi-agent-paused 마커 파일 생성 ───────────────────────────
touch "$PAUSE_MARKER"

# ── Step 8: 완료 메시지 출력 ─────────────────────────────────────────────────
echo ""
echo -e "${GREEN}✅ 멀티 에이전트가 일시중단되었습니다.${NC}"
echo ""
echo "   마커 파일:  $PAUSE_MARKER"
echo "   상태 파일:  $PAUSE_STATE"
echo ""
echo "💡 재시작하려면: bash .multi-agent/scripts/resume.sh"
