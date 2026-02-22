#!/bin/bash
# 에이전트 beads 감시 + 순차 처리 루프 (v5.1.0)
# 사용법: bash .multi-agent/scripts/runner.sh <agent-name> <opencode-agent-name>
#
# 변경 내역 (v5.1.0):
#   - [버그1] --tag → --label 수정
#   - [버그2] 태그 기반 감지 → assignee 기반 폴링으로 전환
#   - [버그3] bd list 출력 파싱 수정: grep "^id:" → awk '{print $2}'
#   - [버그4] generate_prompt() 개선: 실제 태스크 ID·제목 포함
#   - [추가] 폴링 대기 중 할당 태스크 목록 표시 (커서 홈 방식)

AGENT_NAME=${1:-"unknown"}        # bd --assignee 이름 (예: worker-1)
OC_AGENT_NAME=${2:-$AGENT_NAME}   # opencode --agent 이름 (예: worker)

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOCK_FILE="$PROJECT_ROOT/.multi-agent/queue/${AGENT_NAME}.lock"

RESET='\033[0m'
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
MAGENTA='\033[0;35m'

# 종료 시 lock 파일 정리 + 루프 탈출 플래그
_EXIT=0
cleanup() {
  _EXIT=1
  rm -f "$LOCK_FILE"
}
trap cleanup EXIT INT TERM

mkdir -p "$(dirname "$LOCK_FILE")"

# ── 헤더 출력 (최초 1회) ─────────────────────────────────────────────────────
print_header() {
  W=$(tput cols 2>/dev/null || echo 80)
  printf "${CYAN}${BOLD}"
  printf '━%.0s' $(seq 1 $W)
  printf "${RESET}\n"
  printf "${CYAN}${BOLD}  ▶ %-20s${RESET}  ${DIM}beads 감시 중 · 새 메시지 감지 시 자동 실행${RESET}\n" "$AGENT_NAME"
  printf "${CYAN}${BOLD}"
  printf '━%.0s' $(seq 1 $W)
  printf "${RESET}\n"
  printf "  ${DIM}시작 시각: %s${RESET}\n" "$(date '+%Y-%m-%d %H:%M:%S')"
  printf "  ${DIM}Ctrl+C로 종료${RESET}\n\n"
}

# ── 폴링 대기 중 할당 태스크 목록 표시 ────────────────────────────────────────
# clear 대신 커서 홈(\033[H) + 각 줄 잔상 제거(\033[K) 방식 사용
_HEADER_LINES=0  # 헤더가 차지하는 줄 수 (최초 print_header 후 계산)

print_waiting_status() {
  local task_list="$1"

  # 커서를 헤더 다음 줄로 이동 (헤더 5줄 고정)
  printf "\033[6;1H"

  printf "\033[K  ${MAGENTA}할당된 태스크:${RESET}\n"

  if [ -z "$task_list" ]; then
    printf "\033[K  ${DIM}(없음)${RESET}\n\033[K\n"
  else
    while IFS= read -r line; do
      # 형식: ○ blog-xxx [● P0] [task] @assignee - 제목
      task_id=$(echo "$line" | awk '{print $2}')
      priority=$(echo "$line" | grep -oP '\[● \K[^\]]+' | head -1)
      title=$(echo "$line" | sed 's/.*- //')
      printf "\033[K  ${BOLD}%-12s${RESET} [${YELLOW}%s${RESET}]  %s\n" "$task_id" "$priority" "$title"
    done <<< "$task_list"
    printf "\033[K\n"
  fi

  printf "\033[K  ${DIM}다음 beads 변경을 대기 중... (3초마다 폴링) %s${RESET}\033[K" "$(date '+%H:%M:%S')"
}

# ── assignee 기반 폴링 함수 ──────────────────────────────────────────────────
# [버그2] 태그 기반 → assignee 기반 폴링
# [버그1] --tag → --label (assign_task 등 label 기반 메시지 감지용)
# return: open 태스크가 있으면 결과를 stdout, return 0; 없으면 return 1
poll_beads_messages() {
  local retry=0
  local max_retry=3

  while [ $retry -lt $max_retry ]; do
    # [버그2] assignee 기반 폴링: 자신에게 할당된 open 메시지(label 포함) 조회
    result=$(bd list --assignee "$AGENT_NAME" --status open 2>/dev/null)

    if [ $? -eq 0 ] && [ -n "$result" ]; then
      echo "$result"
      return 0
    fi

    retry=$((retry + 1))
    [ $retry -lt $max_retry ] && sleep 1
  done

  return 1
}

# ── 메시지 상세 조회 함수 ───────────────────────────────────────────────────
get_message_detail() {
  local msg_id="$1"
  bd show "$msg_id" 2>/dev/null | head -20
}

# ── 메시지 라벨 조회 함수 ───────────────────────────────────────────────────
get_message_label() {
  local msg_id="$1"
  bd show "$msg_id" 2>/dev/null | grep -i "^Label" | awk '{print $2}' | head -1
}

# ── 메시지 제목 조회 함수 ───────────────────────────────────────────────────
get_message_title() {
  local msg_id="$1"
  # bd show 첫 줄: ○ blog-xxx · 제목  [● P0 · OPEN]
  bd show "$msg_id" 2>/dev/null | head -1 | sed 's/^[○●◉] [^ ]* · //' | sed 's/\s*\[.*\]$//'
}

# ── 에이전트별 프롬프트 생성 ─────────────────────────────────────────────────
# [버그4] 실제 태스크 ID와 제목을 포함한 프롬프트 생성
generate_prompt() {
  local msg_id="$1"
  local msg_label="$2"
  local msg_title="$3"

  case "$msg_label" in
    all_tasks_done)
      echo "bd show $msg_id 태스크를 확인하세요 (제목: $msg_title). 모든 작업이 완료되었습니다. 최종 결과를 사용자에게 보고하고 git squash/push/PR을 진행하세요."
      ;;
    escalate)
      echo "bd show $msg_id 태스크를 확인하세요 (제목: $msg_title). 에스컬레이션 메시지가 도착했습니다. 상세 내용 확인 후 사용자에게 상황 보고 및 의사결정을 요청하세요."
      ;;
    spec_rejected)
      echo "bd show $msg_id 태스크를 확인하세요 (제목: $msg_title). 명세서 검증이 거부되었습니다. 이유 확인 후 수정 요청 메시지를 작성하세요."
      ;;
    spec_validated)
      echo "bd show $msg_id 태스크를 확인하세요 (제목: $msg_title). 새로운 검증된 명세서가 도착했습니다. 명세서 확인 후 작업을 beads 태스크로 분해하고 작업자에게 할당하세요."
      ;;
    task_completed)
      echo "bd show $msg_id 태스크를 확인하세요 (제목: $msg_title). 작업자가 작업을 완료했습니다. 결과 확인 후 다음 작업 진행 또는 완료 보고를 작성하세요."
      ;;
    blocker_found)
      echo "bd show $msg_id 태스크를 확인하세요 (제목: $msg_title). 블로커가 발견되었습니다. 상황 확인 후 해결 방안을 검토하세요."
      ;;
    validate_spec)
      echo "bd show $msg_id 태스크를 확인하세요 (제목: $msg_title). 새로운 명세서 검증 요청이 도착했습니다. 명세서 확인 후 검증 체크리스트를 적용하세요."
      ;;
    assign_task)
      echo "bd show $msg_id 태스크를 확인하고 지시사항에 따라 작업을 진행해주세요. (제목: $msg_title)"
      ;;
    *)
      echo "bd show $msg_id 태스크를 확인하세요 (제목: $msg_title). 내용 확인 후 처리하세요."
      ;;
  esac
}

# ── 최초 헤더 출력 ───────────────────────────────────────────────────────────
printf "\033[2J\033[H"  # 화면 지우기 (최초 1회만)
print_header

# ── 메인 루프: beads 메시지 폴링 ───────────────────────────────────────────
# config.json에서 runner_poll_interval 읽기 (jq 미설치 또는 파일 없을 시 기본값 3)
_runner_cfg_poll() {
  if command -v jq >/dev/null 2>&1 && [ -f "$PROJECT_ROOT/.multi-agent/config.json" ]; then
    local val
    val=$(jq -r '.runner_poll_interval // empty' "$PROJECT_ROOT/.multi-agent/config.json" 2>/dev/null)
    [ -n "$val" ] && echo "$val" && return
  fi
  echo "3"
}
POLL_INTERVAL="${POLL_INTERVAL:-$(_runner_cfg_poll)}"  # 폴링 간격 (초)

while [ "$_EXIT" -eq 0 ]; do
  # lock이 없을 때만 처리
  if [ ! -f "$LOCK_FILE" ]; then
    # assignee 기반 폴링: 자신에게 할당된 open 태스크 조회
    if messages=$(poll_beads_messages); then
      # lock 획득
      touch "$LOCK_FILE"

      # [버그3] 첫 번째 메시지 ID 추출: bd list 출력 형식 "○ blog-xxx ..."
      first_msg_id=$(echo "$messages" | head -1 | awk '{print $2}')

      if [ -n "$first_msg_id" ]; then
        # 라벨 및 제목 조회
        first_msg_label=$(get_message_label "$first_msg_id")
        first_msg_title=$(get_message_title "$first_msg_id")

        timestamp=$(date +%H:%M:%S)
        printf "\n\033[K${YELLOW}[%s]${RESET} ${BOLD}새 beads 메시지 감지${RESET}: %s\n" "$timestamp" "$first_msg_id"
        printf "\033[K  ${MAGENTA}라벨:${RESET} %s\n" "$first_msg_label"
        printf "\033[K  ${MAGENTA}제목:${RESET} %s\n" "$first_msg_title"
        printf "\033[K${DIM}─────────────────────────────────────────${RESET}\n"

        # 메시지 상세 표시
        printf "\033[K  ${DIM}메시지 내용:${RESET}\n"
        get_message_detail "$first_msg_id" | while IFS= read -r line; do
          printf "\033[K    %s\n" "$line"
        done
        printf "\n"

        # 프롬프트 생성 및 opencode 실행
        prompt=$(generate_prompt "$first_msg_id" "$first_msg_label" "$first_msg_title")

        (
          cd "$PROJECT_ROOT"
          opencode run \
            --agent "$OC_AGENT_NAME" \
            "$prompt"
        ) || printf "\n${YELLOW}[경고]${RESET} opencode run 비정상 종료 (exit code: $?)\n"

        timestamp=$(date +%H:%M:%S)
        printf "\n${GREEN}[%s]${RESET} ${BOLD}실행 완료${RESET}\n" "$timestamp"
        printf "${DIM}─────────────────────────────────────────${RESET}\n"
      fi

      # lock 해제
      rm -f "$LOCK_FILE"
    else
      # 대기 중: 할당된 태스크 목록 갱신 표시
      current_tasks=$(bd list --assignee "$AGENT_NAME" --status open 2>/dev/null)
      print_waiting_status "$current_tasks"
    fi
  fi

  # 대기
  if [ "$_EXIT" -eq 0 ]; then
    sleep $POLL_INTERVAL &
    wait $!
  fi
done
