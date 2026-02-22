#!/bin/bash
# 중앙 집중형 beads 디스패처 (v2.0.0 — interactive queue 방식)
#
# opencode interactive 세션에 프롬프트 텍스트를 직접 send-keys로 전달하여
# opencode 내부 입력 버퍼가 자연스러운 큐 역할을 하도록 합니다.
#
# 특징:
#   - opencode interactive 상시 실행 모드 (headless run 방식 탈피)
#   - pane_current_command 체크 불필요 (is_agent_busy 제거)
#   - beads in_progress 마킹으로 중복 전송 방지
#   - stale in_progress 자동 복구: STALE_TIMEOUT 초과 시 open으로 리셋
#   - 재시도 횟수 추적 및 프롬프트에 재시도 컨텍스트 자동 추가
#   - bash 3.2 호환 (macOS 기본 bash, declare -A 미사용)
#
# 환경변수 (선택):
#   MULTI_AGENT_SESSION  : tmux 세션 이름 (기본값: multi-agent)
#   POLL_INTERVAL        : 전체 순환 주기 초 (기본값: 5)
#   AGENT_GAP            : 에이전트 간 bd 접근 간격 초 (기본값: 1)
#   BD_MAX_RETRY         : bd panic 재시도 횟수 (기본값: 3)
#   STALE_TIMEOUT        : in_progress 최대 허용 시간 초 (기본값: 1800 = 30분)
#
# 변경 내역 (v2.0.0):
#   - is_agent_busy() 제거 (pane_current_command 오감지 문제 근본 해결)
#   - opencode run 트리거 → opencode interactive에 프롬프트 텍스트 직접 전달
#   - bd update --status in_progress 마킹 추가 (중복 전송 방지)
#   - stale in_progress 자동 복구 기능 추가 (LOCK_DIR, RETRY_DIR)
#   - 재시도 횟수 추적 및 프롬프트에 재시도 컨텍스트 추가
#   - permission_needed label 추가
#
# 변경 내역 (v1.1.0):
#   - declare -A 제거 → eval + ${!var} 간접 참조로 대체 (bash 3.2 호환)

# ── 설정 ────────────────────────────────────────────────────────────────────
SESSION_NAME="${MULTI_AGENT_SESSION:-multi-agent}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# config.json 값 읽기 헬퍼 (jq 미설치 또는 파일 없을 시 기본값 반환)
_cfg() {
  local key="$1" default="$2"
  if command -v jq >/dev/null 2>&1 && [ -f "$PROJECT_ROOT/.multi-agent/config.json" ]; then
    local val
    val=$(jq -r ".$key // empty" "$PROJECT_ROOT/.multi-agent/config.json" 2>/dev/null)
    [ -n "$val" ] && echo "$val" && return
  fi
  echo "$default"
}
POLL_INTERVAL="${POLL_INTERVAL:-$(_cfg dispatcher_poll_interval 10)}"  # 전체 순환 주기 (초)
AGENT_GAP="${AGENT_GAP:-$(_cfg agent_gap 1)}"                          # 에이전트 간 bd 접근 간격 (초)
BD_MAX_RETRY="${BD_MAX_RETRY:-$(_cfg bd_max_retry 3)}"                 # bd panic 재시도 횟수
STALE_TIMEOUT="${STALE_TIMEOUT:-$(_cfg stale_timeout 1800)}"           # stale in_progress 임계값 (초)

LOCK_DIR="/tmp/dispatcher_inprogress"   # 마킹 시각 저장 (태스크 ID별 파일)
RETRY_DIR="/tmp/dispatcher_retry"       # 재시도 횟수 저장 (태스크 ID별 파일)
mkdir -p "$LOCK_DIR" "$RETRY_DIR"

AGENTS=(task-manager spec-manager worker-1 worker-2)

# ── 색상 ────────────────────────────────────────────────────────────────────
RESET='\033[0m'
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
RED='\033[0;31m'

# ── beads 폴링 (재시도 포함) ─────────────────────────────────────────────────
# 에이전트에게 할당된 open 태스크를 조회합니다.
# bd panic 발생 시 최대 BD_MAX_RETRY회 재시도.
bd_poll() {
  local agent="$1"
  local retry=0
  local result

  while [ "$retry" -lt "$BD_MAX_RETRY" ]; do
    result=$(bd list --assignee "$agent" --status open 2>/dev/null)
    if [ $? -eq 0 ]; then
      echo "$result"
      return 0
    fi
    retry=$((retry + 1))
    [ "$retry" -lt "$BD_MAX_RETRY" ] && sleep 1
  done

  return 1
}

# ── bd update 상태 변경 (재시도 포함) ────────────────────────────────────────
bd_update_status() {
  local task_id="$1"
  local status="$2"
  local retry=0

  while [ "$retry" -lt "$BD_MAX_RETRY" ]; do
    if bd update "$task_id" --status "$status" 2>/dev/null; then
      return 0
    fi
    retry=$((retry + 1))
    [ "$retry" -lt "$BD_MAX_RETRY" ] && sleep 1
  done

  return 1
}

# ── label 추출 ───────────────────────────────────────────────────────────────
# bd list 출력 한 줄에서 [label] 부분을 추출합니다.
extract_label() {
  local line="$1"
  echo "$line" \
    | grep -oE '\[(assign_task|task_completed|blocker_found|validate_spec|spec_validated|spec_rejected|escalate|all_tasks_done|permission_needed|request_spec|update_spec|spec_ready)\]' \
    | head -1 \
    | tr -d '[]'
}

# ── 재시도 횟수 관리 ──────────────────────────────────────────────────────────
get_retry_count() {
  local task_id="$1"
  local f="${RETRY_DIR}/${task_id}"
  if [ -f "$f" ]; then
    cat "$f"
  else
    echo "0"
  fi
}

inc_retry_count() {
  local task_id="$1"
  local count
  count=$(get_retry_count "$task_id")
  echo $(( count + 1 )) > "${RETRY_DIR}/${task_id}"
}

# ── 프롬프트 생성 ────────────────────────────────────────────────────────────
# label 기반으로 에이전트에게 전달할 자연어 지시를 생성합니다.
# retry_count > 0 이면 재시도 컨텍스트를 자동으로 추가합니다.
make_prompt() {
  local msg_id="$1"
  local msg_label="$2"
  local retry_count="${3:-0}"

  local retry_ctx=""
  if [ "$retry_count" -gt 0 ]; then
    retry_ctx=" ⚠️ 이 태스크는 ${retry_count}회차 재시도입니다. 시작 전 반드시 bd show ${msg_id}로 현재 상태를 확인하고, 이미 처리 중이거나 완료된 경우 무시하세요."
  fi

  local base
  case "$msg_label" in
    all_tasks_done)
      base="bd show ${msg_id} 태스크를 확인하세요. 모든 작업이 완료되었습니다. 최종 결과를 사용자에게 보고하고 git squash/push/PR을 진행하세요."
      ;;
    escalate)
      base="bd show ${msg_id} 태스크를 확인하세요. 에스컬레이션 메시지가 도착했습니다. 상세 내용 확인 후 사용자에게 상황을 보고하세요."
      ;;
    spec_rejected)
      base="bd show ${msg_id} 태스크를 확인하세요. 명세서 검증이 거부되었습니다. 이유 확인 후 명세서를 수정하세요."
      ;;
    spec_validated|spec_ready)
      base="bd show ${msg_id} 태스크를 확인하세요. 검증된 명세서가 도착했습니다. 작업을 beads 태스크로 분해하고 작업자에게 할당하세요."
      ;;
    task_completed)
      base="bd show ${msg_id} 태스크를 확인하세요. 작업자가 작업을 완료했습니다. 결과 확인 후 다음 작업을 진행하세요."
      ;;
    blocker_found)
      base="bd show ${msg_id} 태스크를 확인하세요. 블로커가 발견되었습니다. 상황 확인 후 해결 방안을 검토하세요."
      ;;
    validate_spec)
      base="bd show ${msg_id} 태스크를 확인하세요. 명세서 검증 요청이 도착했습니다. 검증 체크리스트를 적용하세요."
      ;;
    request_spec)
      base="bd show ${msg_id} 태스크를 확인하세요. 명세서 작성 요청이 도착했습니다. 지시에 따라 명세서를 작성하세요."
      ;;
    update_spec)
      base="bd show ${msg_id} 태스크를 확인하세요. 명세서 갱신 요청이 도착했습니다. 지시에 따라 명세서를 수정하세요."
      ;;
    permission_needed)
      base="bd show ${msg_id} 태스크를 확인하세요. 권한 거부 알림이 도착했습니다. 어떤 권한이 필요한지 검토하고 처리하세요."
      ;;
    assign_task)
      base="bd show ${msg_id} 태스크를 확인하고 지시사항에 따라 작업을 진행해주세요."
      ;;
    *)
      base="bd show ${msg_id} 태스크를 확인하세요. 내용 확인 후 처리하세요."
      ;;
  esac

  echo "${base}${retry_ctx}"
}

# ── stale in_progress 자동 복구 ──────────────────────────────────────────────
# in_progress 태스크 목록을 받아 두 가지 작업을 수행합니다:
#   1. 락 파일은 있지만 in_progress 목록에 없는 태스크 → 락 파일 정리 (완료된 태스크)
#   2. 락 파일이 있고 STALE_TIMEOUT 초과 → open으로 리셋 + 재시도 횟수 증가
# 인수: bd list --status in_progress 출력 (멀티라인 문자열)
_stale_count=0

check_stale() {
  local ip_lines="$1"
  local now
  now=$(date +%s)

  # 락 파일이 있지만 더 이상 in_progress가 아닌 태스크 정리
  for lock_file in "${LOCK_DIR}"/*; do
    [ -f "$lock_file" ] || continue
    local tid
    tid=$(basename "$lock_file")
    if ! echo "$ip_lines" | grep -q "$tid"; then
      rm -f "$lock_file"
    fi
  done

  # in_progress 태스크 중 STALE_TIMEOUT 초과한 것 복구
  [ -z "$ip_lines" ] && return

  while IFS= read -r line; do
    [ -z "$line" ] && continue
    local task_id
    task_id=$(echo "$line" | awk '{print $2}')
    [ -z "$task_id" ] && continue

    # 락 파일이 없으면 dispatcher가 보낸 태스크가 아님 → skip
    local lock_file="${LOCK_DIR}/${task_id}"
    [ -f "$lock_file" ] || continue

    local marked_at
    marked_at=$(cat "$lock_file")
    local elapsed=$(( now - marked_at ))

    if [ "$elapsed" -gt "$STALE_TIMEOUT" ]; then
      # stale! open으로 리셋
      if bd_update_status "$task_id" "open"; then
        inc_retry_count "$task_id"
        rm -f "$lock_file"
        _stale_count=$(( _stale_count + 1 ))
      fi
    fi
  done <<< "$ip_lines"
}

# ── 에이전트 마지막 전송 태스크 추적 (bash 3.2 호환) ────────────────────────
# declare -A 대신 eval + ${!var} 간접 참조 사용.
# 변수명의 '-'는 '_'로 변환: task-manager → DISP_LAST_task_manager
_agent_key() { echo "${1//-/_}"; }

get_last_sent() {
  local varname="DISP_LAST_$(_agent_key "$1")"
  echo "${!varname:--}"
}
set_last_sent() {
  eval "DISP_LAST_$(_agent_key "$1")='$2'"
}

for _a in "${AGENTS[@]}"; do
  set_last_sent "$_a" "-"
done

# ── 상태 표시 (커서 홈 방식) ─────────────────────────────────────────────────
# clear 대신 커서 홈(\033[H) + 줄 끝 소거(\033[K)로 깜빡임 없이 갱신합니다.
_FIRST_PRINT=1

print_status() {
  local ts W
  ts=$(date '+%H:%M:%S')
  W=$(tput cols 2>/dev/null || echo 80)

  if [ "$_FIRST_PRINT" -eq 1 ]; then
    printf "\033[2J\033[H"
    _FIRST_PRINT=0
  else
    printf "\033[H"
  fi

  printf "${CYAN}${BOLD}"
  printf '━%.0s' $(seq 1 "$W")
  printf "${RESET}\033[K\n"

  printf "${CYAN}${BOLD}  ▶ dispatcher v2.0.0${RESET}"
  printf "  ${DIM}interactive queue 방식 · opencode 내부 큐 활용${RESET}\033[K\n"

  printf "${CYAN}${BOLD}"
  printf '━%.0s' $(seq 1 "$W")
  printf "${RESET}\033[K\n"

  printf "  ${DIM}%s  · poll: %ss  · gap: %ss  · stale: %ss  · 누적 stale 리셋: %d${RESET}\033[K\n\n" \
    "$ts" "$POLL_INTERVAL" "$AGENT_GAP" "$STALE_TIMEOUT" "$_stale_count"

  for agent in "${AGENTS[@]}"; do
    local last retry_count
    last=$(get_last_sent "$agent")
    retry_count=0
    if [ "$last" != "-" ]; then
      retry_count=$(get_retry_count "$last")
    fi

    if [ "$retry_count" -gt 0 ]; then
      printf "  ${YELLOW}▶ %-15s${RESET}  ${DIM}%s  (재시도 %d회)${RESET}\033[K\n" \
        "$agent" "$last" "$retry_count"
    else
      printf "  ${GREEN}▶ %-15s${RESET}  ${DIM}%s${RESET}\033[K\n" "$agent" "$last"
    fi
  done

  printf "\n  ${DIM}다음 순환까지 ${POLL_INTERVAL}s 대기 중...${RESET}\033[K\n"
}

# ── 시작 메시지 ──────────────────────────────────────────────────────────────
echo "🚀 dispatcher v2.0.0 시작 (interactive queue 방식)"
echo "   세션: ${SESSION_NAME}"
echo "   에이전트: ${AGENTS[*]}"
echo "   폴링 간격: ${POLL_INTERVAL}s  /  에이전트 간격: ${AGENT_GAP}s  /  stale 임계값: ${STALE_TIMEOUT}s"
echo "   락 디렉토리: ${LOCK_DIR}"
echo ""
echo "⏳ opencode 세션 초기화 대기 중 (5초)..."
sleep 5

# ── 메인 루프 ────────────────────────────────────────────────────────────────
while true; do

  # 1. stale in_progress 체크 (사이클당 1회, bd 호출 최소화)
  _ip_tasks=""
  _ip_tasks=$(bd list --status in_progress 2>/dev/null) || true
  check_stale "$_ip_tasks"
  sleep "$AGENT_GAP"

  # 2. 각 에이전트별 open 태스크 폴링 및 전송
  for agent in "${AGENTS[@]}"; do

    # beads 폴링 (open 태스크만)
    tasks=""
    if ! tasks=$(bd_poll "$agent"); then
      sleep "$AGENT_GAP"
      continue
    fi

    # 할당된 태스크 없으면 skip
    if [ -z "$tasks" ]; then
      sleep "$AGENT_GAP"
      continue
    fi

    # 첫 번째 태스크 추출
    first_line=$(echo "$tasks" | head -1)
    task_id=$(echo "$first_line" | awk '{print $2}')
    label=$(extract_label "$first_line")

    if [ -z "$task_id" ]; then
      sleep "$AGENT_GAP"
      continue
    fi

    # 재시도 횟수 확인
    retry_count=$(get_retry_count "$task_id")

    # beads in_progress 마킹 (중복 전송 방지 — 다음 폴링에서 skip됨)
    if ! bd_update_status "$task_id" "in_progress"; then
      sleep "$AGENT_GAP"
      continue
    fi

    # 락 파일 생성 (stale 감지용 타임스탬프)
    date +%s > "${LOCK_DIR}/${task_id}"

    # 프롬프트 생성
    prompt=$(make_prompt "$task_id" "$label" "$retry_count")

    # opencode interactive 세션에 프롬프트 직접 전송
    # -l 플래그: 특수문자를 키 바인딩으로 해석하지 않고 리터럴 텍스트로 전송
    tmux send-keys -t "${SESSION_NAME}:${agent}" -l "${prompt}"
    tmux send-keys -t "${SESSION_NAME}:${agent}" "" Enter

    set_last_sent "$agent" "$task_id"

    sleep "$AGENT_GAP"
  done

  # 3. 상태 표시 후 POLL_INTERVAL 대기
  print_status
  sleep "$POLL_INTERVAL"
done
