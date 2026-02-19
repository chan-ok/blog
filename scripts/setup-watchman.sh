#!/bin/bash
# watchman 트리거 설정 스크립트
# 파일 변경을 감지하여 에이전트에게 알립니다.

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPECS_DIR="$PROJECT_ROOT/.multi-agent/specs"
QUEUE_DIR="$PROJECT_ROOT/.multi-agent/queue"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 사전 요구사항 확인
echo "🔍 사전 요구사항 확인 중..."

if ! command -v watchman &> /dev/null; then
  echo -e "${RED}❌ watchman이 설치되지 않았습니다.${NC}"
  echo "   설치: brew install watchman"
  exit 1
fi

if ! tmux has-session -t multi-agent 2>/dev/null; then
  echo -e "${YELLOW}⚠️  tmux 세션 'multi-agent'가 없습니다.${NC}"
  echo "   먼저 ./scripts/start-multi-agent.sh를 실행하세요."
  exit 1
fi

if [ ! -d "$SPECS_DIR" ]; then
  echo -e "${RED}❌ $SPECS_DIR 디렉토리가 없습니다.${NC}"
  exit 1
fi

if [ ! -d "$QUEUE_DIR" ]; then
  echo -e "${RED}❌ $QUEUE_DIR 디렉토리가 없습니다.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ 모든 사전 요구사항이 충족되었습니다.${NC}"

echo "🧹 기존 트리거 삭제 중..."

# 기존 트리거 삭제 (에러 무시)
watchman trigger-del "$SPECS_DIR" spec-changed 2>/dev/null || true
watchman trigger-del "$QUEUE_DIR" task-mgr-msg 2>/dev/null || true
watchman trigger-del "$QUEUE_DIR" spec-mgr-msg 2>/dev/null || true
watchman trigger-del "$QUEUE_DIR" consultant-msg 2>/dev/null || true
watchman trigger-del "$QUEUE_DIR" worker-1-msg 2>/dev/null || true
watchman trigger-del "$QUEUE_DIR" worker-2-msg 2>/dev/null || true
watchman trigger-del "$QUEUE_DIR" worker-3-msg 2>/dev/null || true

echo "📡 watchman 트리거 설정 중..."

# specs 디렉토리 감시
watchman watch-project "$SPECS_DIR"
watchman -- trigger "$SPECS_DIR" spec-changed '*.yaml' -- \
  bash -c 'echo "[$(date +%H:%M:%S)] 📄 Spec changed" | tmux send-keys -t multi-agent:0.2 C-m'

# queue 디렉토리 감시
watchman watch-project "$QUEUE_DIR"

# 작업관리자 메시지
watchman -- trigger "$QUEUE_DIR" task-mgr-msg 'task-manager-*.json' -- \
  bash -c 'echo "[$(date +%H:%M:%S)] 📨 New task-manager message" | tmux send-keys -t multi-agent:0.1 C-m'

# 명세서관리자 메시지
watchman -- trigger "$QUEUE_DIR" spec-mgr-msg 'spec-manager-*.json' -- \
  bash -c 'echo "[$(date +%H:%M:%S)] 📨 New spec-manager message" | tmux send-keys -t multi-agent:0.2 C-m'

# 컨설턴트 메시지
watchman -- trigger "$QUEUE_DIR" consultant-msg 'consultant-*.json' -- \
  bash -c 'echo "[$(date +%H:%M:%S)] 📨 New consultant message" | tmux send-keys -t multi-agent:0.0 C-m'

# 작업자 메시지 (Worker 1, 2, 3)
watchman -- trigger "$QUEUE_DIR" worker-1-msg 'worker-1-*.json' -- \
  bash -c 'echo "[$(date +%H:%M:%S)] 📨 New worker-1 message" | tmux send-keys -t multi-agent:0.3 C-m'

watchman -- trigger "$QUEUE_DIR" worker-2-msg 'worker-2-*.json' -- \
  bash -c 'echo "[$(date +%H:%M:%S)] 📨 New worker-2 message" | tmux send-keys -t multi-agent:0.4 C-m'

watchman -- trigger "$QUEUE_DIR" worker-3-msg 'worker-3-*.json' -- \
  bash -c 'echo "[$(date +%H:%M:%S)] 📨 New worker-3 message" | tmux send-keys -t multi-agent:0.5 C-m'

echo -e "${GREEN}✅ Watchman 트리거가 성공적으로 설정되었습니다!${NC}"
echo ""
echo "📌 설정된 트리거:"
echo "   - spec-changed: *.yaml 파일 변경 감지"
echo "   - task-mgr-msg: task-manager-*.json 감지"
echo "   - spec-mgr-msg: spec-manager-*.json 감지"
echo "   - consultant-msg: consultant-*.json 감지"
echo "   - worker-1-msg: worker-1-*.json 감지"
echo "   - worker-2-msg: worker-2-*.json 감지"
echo "   - worker-3-msg: worker-3-*.json 감지"
echo ""
echo "🧪 테스트:"
echo "   touch .multi-agent/specs/test.yaml"
echo "   touch .multi-agent/queue/task-manager-test.json"
echo ""
echo "🔍 트리거 확인:"
echo "   watchman trigger-list $SPECS_DIR"
echo "   watchman trigger-list $QUEUE_DIR"
echo ""
echo "🗑️  트리거 삭제:"
echo "   watchman trigger-del $SPECS_DIR spec-changed"
echo "   watchman trigger-del $QUEUE_DIR task-mgr-msg"
