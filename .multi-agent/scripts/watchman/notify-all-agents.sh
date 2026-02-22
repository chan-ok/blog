#!/bin/bash
# watchman beads 변경 감지 → 각 에이전트에 알림 (v1.0.0)

SESSION_NAME="multi-agent"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# 에이전트별 pane 및 태그 매핑
declare -A AGENT_PANES=(
  ["consultant"]="consultant"
  ["task-manager"]="task-manager"
  ["spec-manager"]="spec-manager"
  ["worker-1"]="worker-1"
  ["worker-2"]="worker-2"
)

declare -A AGENT_TAGS=(
  ["consultant"]="all_tasks_done,escalate,spec_rejected"
  ["task-manager"]="spec_validated,task_completed,blocker_found"
  ["spec-manager"]="validate_spec"
  ["worker-1"]="assign_task"
  ["worker-2"]="assign_task"
)

# 색상 출력
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m'

echo -e "${BLUE}[watchman]${NC} beads 변경 감지 - 각 에이전트에 알림 전송 중..."

# 각 에이전트 pane에 bd list 명령 전송
for agent in consultant task-manager spec-manager worker-1 worker-2; do
  pane="${AGENT_PANES[$agent]}"
  tags="${AGENT_TAGS[$agent]}"
  
  if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    echo -e "  ${GREEN}→${NC} $agent (pane: $pane, tags: $tags)"
  else
    echo -e "  ${RED}✗${NC} $agent (세션 없음)"
  fi
done

echo -e "${BLUE}[watchman]${NC} 알림 전송 완료"

exit 0
