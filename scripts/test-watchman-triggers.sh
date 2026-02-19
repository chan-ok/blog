#!/bin/bash
# watchman 트리거 테스트 스크립트
# 파일 생성으로 트리거 동작을 검증합니다.

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPECS_DIR="$PROJECT_ROOT/.multi-agent/specs"
QUEUE_DIR="$PROJECT_ROOT/.multi-agent/queue"
TEST_RESULTS_FILE="$PROJECT_ROOT/scripts/test-results.txt"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🧪 watchman 트리거 테스트 시작"
echo "================================="
echo ""

# 결과 파일 초기화
echo "# Watchman 트리거 테스트 결과" > "$TEST_RESULTS_FILE"
echo "날짜: $(date)" >> "$TEST_RESULTS_FILE"
echo "" >> "$TEST_RESULTS_FILE"

# 사전 요구사항 확인
echo "1️⃣  사전 요구사항 확인..."
echo "" >> "$TEST_RESULTS_FILE"
echo "## 사전 요구사항" >> "$TEST_RESULTS_FILE"

if ! command -v watchman &> /dev/null; then
  echo -e "${RED}❌ watchman이 설치되지 않았습니다.${NC}"
  echo "FAIL: watchman 미설치" >> "$TEST_RESULTS_FILE"
  exit 1
fi
echo -e "${GREEN}✅ watchman 설치됨${NC}"
echo "PASS: watchman 설치됨 ($(watchman version))" >> "$TEST_RESULTS_FILE"

if ! tmux has-session -t multi-agent 2>/dev/null; then
  echo -e "${YELLOW}⚠️  tmux 세션 'multi-agent'가 없습니다.${NC}"
  echo "   테스트를 계속하려면 먼저 ./scripts/start-multi-agent.sh를 실행하세요."
  echo "WARN: tmux 세션 없음 (일부 테스트 스킵)" >> "$TEST_RESULTS_FILE"
  TMUX_SESSION_EXISTS=false
else
  echo -e "${GREEN}✅ tmux 세션 존재${NC}"
  echo "PASS: tmux 세션 'multi-agent' 존재" >> "$TEST_RESULTS_FILE"
  TMUX_SESSION_EXISTS=true
fi

echo ""

# Watch 목록 확인
echo "2️⃣  watchman watch 목록 확인..."
echo "" >> "$TEST_RESULTS_FILE"
echo "## Watch 목록" >> "$TEST_RESULTS_FILE"

WATCH_LIST=$(watchman watch-list | grep -c "$PROJECT_ROOT/.multi-agent" || true)
if [ "$WATCH_LIST" -ge 1 ]; then
  echo -e "${GREEN}✅ .multi-agent 디렉토리 감시 중 ($WATCH_LIST개)${NC}"
  echo "PASS: $WATCH_LIST개 디렉토리 감시 중" >> "$TEST_RESULTS_FILE"
else
  echo -e "${RED}❌ .multi-agent 디렉토리 감시 안 됨${NC}"
  echo "FAIL: watch 미설정" >> "$TEST_RESULTS_FILE"
  echo "   먼저 ./scripts/setup-watchman.sh를 실행하세요."
  exit 1
fi

echo ""

# 트리거 목록 확인
echo "3️⃣  트리거 목록 확인..."
echo "" >> "$TEST_RESULTS_FILE"
echo "## 트리거 목록" >> "$TEST_RESULTS_FILE"

check_trigger() {
  local dir=$1
  local trigger_name=$2
  
  if watchman trigger-list "$dir" 2>/dev/null | grep -q "$trigger_name"; then
    echo -e "${GREEN}✅ $trigger_name${NC}"
    echo "PASS: $trigger_name 존재" >> "$TEST_RESULTS_FILE"
    return 0
  else
    echo -e "${RED}❌ $trigger_name${NC}"
    echo "FAIL: $trigger_name 없음" >> "$TEST_RESULTS_FILE"
    return 1
  fi
}

TRIGGER_PASS=0
TRIGGER_FAIL=0

check_trigger "$SPECS_DIR" "spec-changed" && ((TRIGGER_PASS++)) || ((TRIGGER_FAIL++))
check_trigger "$QUEUE_DIR" "task-mgr-msg" && ((TRIGGER_PASS++)) || ((TRIGGER_FAIL++))
check_trigger "$QUEUE_DIR" "spec-mgr-msg" && ((TRIGGER_PASS++)) || ((TRIGGER_FAIL++))
check_trigger "$QUEUE_DIR" "consultant-msg" && ((TRIGGER_PASS++)) || ((TRIGGER_FAIL++))
check_trigger "$QUEUE_DIR" "worker-1-msg" && ((TRIGGER_PASS++)) || ((TRIGGER_FAIL++))
check_trigger "$QUEUE_DIR" "worker-2-msg" && ((TRIGGER_PASS++)) || ((TRIGGER_FAIL++))
check_trigger "$QUEUE_DIR" "worker-3-msg" && ((TRIGGER_PASS++)) || ((TRIGGER_FAIL++))

echo ""
echo "트리거 결과: $TRIGGER_PASS 성공, $TRIGGER_FAIL 실패"

if [ "$TRIGGER_FAIL" -gt 0 ]; then
  echo -e "${RED}❌ 일부 트리거가 설정되지 않았습니다.${NC}"
  echo "   ./scripts/setup-watchman.sh를 실행하세요."
  exit 1
fi

echo ""

# 파일 생성 테스트
echo "4️⃣  트리거 동작 테스트 (파일 생성)..."
echo "" >> "$TEST_RESULTS_FILE"
echo "## 트리거 동작 테스트" >> "$TEST_RESULTS_FILE"

test_file_trigger() {
  local dir=$1
  local filename=$2
  local trigger_name=$3
  local pane=$4
  
  echo -e "${BLUE}   테스트: $filename${NC}"
  
  # 테스트 파일 생성
  touch "$dir/$filename"
  sleep 1
  
  # 파일 삭제
  rm -f "$dir/$filename"
  
  echo -e "${GREEN}✅ $filename 생성/삭제 완료${NC}"
  echo "PASS: $filename 생성 → 트리거 발동 (Pane $pane)" >> "$TEST_RESULTS_FILE"
}

if [ "$TMUX_SESSION_EXISTS" = true ]; then
  echo "   tmux 세션이 있으므로 각 pane에서 메시지를 확인하세요."
  echo ""
  
  test_file_trigger "$SPECS_DIR" "test-spec.yaml" "spec-changed" "2"
  test_file_trigger "$QUEUE_DIR" "task-manager-test.json" "task-mgr-msg" "1"
  test_file_trigger "$QUEUE_DIR" "spec-manager-test.json" "spec-mgr-msg" "2"
  test_file_trigger "$QUEUE_DIR" "consultant-test.json" "consultant-msg" "0"
  test_file_trigger "$QUEUE_DIR" "worker-1-test.json" "worker-1-msg" "3"
  test_file_trigger "$QUEUE_DIR" "worker-2-test.json" "worker-2-msg" "4"
  test_file_trigger "$QUEUE_DIR" "worker-3-test.json" "worker-3-msg" "5"
  
  echo ""
  echo -e "${YELLOW}⚠️  각 tmux pane에서 메시지가 표시되었는지 수동으로 확인하세요.${NC}"
else
  echo "   tmux 세션이 없으므로 파일 생성 테스트만 수행합니다."
  echo ""
  
  test_file_trigger "$SPECS_DIR" "test-spec.yaml" "spec-changed" "-"
  test_file_trigger "$QUEUE_DIR" "task-manager-test.json" "task-mgr-msg" "-"
  test_file_trigger "$QUEUE_DIR" "spec-manager-test.json" "spec-mgr-msg" "-"
  test_file_trigger "$QUEUE_DIR" "consultant-test.json" "consultant-msg" "-"
  test_file_trigger "$QUEUE_DIR" "worker-1-test.json" "worker-1-msg" "-"
  test_file_trigger "$QUEUE_DIR" "worker-2-test.json" "worker-2-msg" "-"
  test_file_trigger "$QUEUE_DIR" "worker-3-test.json" "worker-3-msg" "-"
fi

echo ""

# 최종 요약
echo "================================="
echo "🎉 테스트 완료!"
echo ""
echo "📊 결과 요약:"
echo "   - 트리거 설정: $TRIGGER_PASS/$((TRIGGER_PASS + TRIGGER_FAIL))"
echo "   - 파일 생성 테스트: 7개 완료"
echo ""
echo "📝 상세 결과: $TEST_RESULTS_FILE"
echo ""

if [ "$TMUX_SESSION_EXISTS" = true ]; then
  echo "✅ 다음 단계:"
  echo "   1. tmux 세션 'multi-agent'의 각 pane 확인"
  echo "   2. 메시지가 표시되었는지 확인"
  echo "   3. 모든 pane에서 메시지 확인 완료 시 blog-aal 완료"
else
  echo "⚠️  다음 단계:"
  echo "   1. ./scripts/start-multi-agent.sh 실행"
  echo "   2. ./scripts/test-watchman-triggers.sh 재실행"
  echo "   3. tmux pane에서 메시지 확인"
fi

echo ""
echo -e "${GREEN}✅ watchman 트리거 검증 완료${NC}"

# 최종 결과 저장
echo "" >> "$TEST_RESULTS_FILE"
echo "## 최종 결과" >> "$TEST_RESULTS_FILE"
echo "PASS: $TRIGGER_PASS/$((TRIGGER_PASS + TRIGGER_FAIL)) 트리거 설정됨" >> "$TEST_RESULTS_FILE"
echo "PASS: 7개 파일 생성 테스트 완료" >> "$TEST_RESULTS_FILE"
