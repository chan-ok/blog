#!/bin/bash
# watchman 트리거 설정 스크립트
# 파일 변경을 감지하여 에이전트에게 알립니다.

PROJECT_ROOT="/Users/chanhokim/myFiles/0_Project/blog"

# specs 디렉토리 감시
watchman watch-project "$PROJECT_ROOT/.multi-agent/specs"
watchman -- trigger "$PROJECT_ROOT/.multi-agent/specs" spec-changed '*.yaml' -- \
  bash -c 'echo "Spec changed" | tmux send-keys -t multi-agent:0.2 C-m'

# queue 디렉토리 감시 (에이전트별)
watchman watch-project "$PROJECT_ROOT/.multi-agent/queue"

# 작업관리자 메시지
watchman -- trigger "$PROJECT_ROOT/.multi-agent/queue" task-mgr-msg 'task-manager-*.json' -- \
  bash -c 'echo "New task-manager message" | tmux send-keys -t multi-agent:0.1 C-m'

# 명세서관리자 메시지
watchman -- trigger "$PROJECT_ROOT/.multi-agent/queue" spec-mgr-msg 'spec-manager-*.json' -- \
  bash -c 'echo "New spec-manager message" | tmux send-keys -t multi-agent:0.2 C-m'

# 컨설턴트 메시지
watchman -- trigger "$PROJECT_ROOT/.multi-agent/queue" consultant-msg 'consultant-*.json' -- \
  bash -c 'echo "New consultant message" | tmux send-keys -t multi-agent:0.0 C-m'

# 작업자 메시지 (Worker 1, 2, 3)
watchman -- trigger "$PROJECT_ROOT/.multi-agent/queue" worker-1-msg 'worker-1-*.json' -- \
  bash -c 'echo "New worker-1 message" | tmux send-keys -t multi-agent:0.3 C-m'

watchman -- trigger "$PROJECT_ROOT/.multi-agent/queue" worker-2-msg 'worker-2-*.json' -- \
  bash -c 'echo "New worker-2 message" | tmux send-keys -t multi-agent:0.4 C-m'

watchman -- trigger "$PROJECT_ROOT/.multi-agent/queue" worker-3-msg 'worker-3-*.json' -- \
  bash -c 'echo "New worker-3 message" | tmux send-keys -t multi-agent:0.5 C-m'

echo "Watchman triggers configured successfully"
