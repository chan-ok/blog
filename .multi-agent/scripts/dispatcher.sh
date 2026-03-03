#!/bin/bash
# 중앙 집중형 beads 직접 폴링 디스패처 (v4.0.0)
#
# opencode interactive 세션에 프롬프트 텍스트를 직접 send-keys로 전달하여
# opencode 내부 입력 버퍼가 자연스러운 큐 역할을 하도록 합니다.
#
# 특징:
#   - beads 직접 폴링: bd list --json으로 에이전트별 open 메시지 조회
#   - 중복 전송 방지: 전송 전 bd update --status in_progress 마킹
#   - 파일 큐 제거: mq.sh / queue/ 디렉토리 완전 불필요
#   - bash 3.2 호환 (macOS 기본 bash, declare -A 미사용)
#   - 매 순환마다 bd list --json 1회 호출 → .multi-agent/cache/state.json 갱신
#     (dashboard.sh / ma.sh는 state.json만 읽어 beads LOCK 충돌 근본 해소)
#
# 환경변수 (선택):
#   MULTI_AGENT_SESSION  : tmux 세션 이름 (기본값: multi-agent)
#   POLL_INTERVAL        : 전체 순환 주기 초 (기본값: 10)
#   AGENT_GAP            : 에이전트 간 간격 초 (기본값: 1)
#
# 변경 내역 (v4.0.0):
#   - mq.sh / 파일 큐 완전 제거
#   - 메인 루프: bd list --json --type message --status open --assignee <agent> 직접 폴링
#   - 전송 전 bd update <id> --status in_progress (중복 전송 방지)
#   - _MQ_STALE_MINUTES, _MQ_ROOT 등 mq 관련 변수 전부 제거
#   - print_status(): retry_count 로직 제거, 마지막 전송 메시지 ID만 표시
#   - 버전 v4.0.0 갱신

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
AGENT_GAP="${AGENT_GAP:-$(_cfg agent_gap 1)}"                          # 에이전트 간 간격 (초)

# ── 캐시 설정 ───────────────────────────────────────────────────────────────
CACHE_DIR="$PROJECT_ROOT/.multi-agent/cache"
CACHE_FILE="$CACHE_DIR/state.json"

AGENTS=(task-manager spec-manager worker-1 worker-2)

# ── 색상 ────────────────────────────────────────────────────────────────────
RESET='\033[0m'
BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
DIM='\033[2m'

# ── 캐시 갱신 ───────────────────────────────────────────────────────────────
# bd list --json 1회 호출로 전체 태스크 데이터를 취득하여 state.json에 기록합니다.
# dashboard.sh / ma.sh는 beads DB에 직접 접근하지 않고 이 파일만 읽습니다.
#
# state.json 구조:
#   {
#     "updated_at": "<ISO8601>",
#     "summary": { "in_progress": N, "open": N, "blocked": N, "closed": N },
#     "agents": {
#       "<agent>": {
#         "in_progress": [ { "id": "...", "title": "...", "labels": [...] }, ... ],
#         "open":        [ ... ],
#         "blocked":     [ ... ],
#         "closed":      [ ... ]
#       }
#     },
#     "all_tasks": [ ... ]   ← bd list --json 원본 (open/in_progress/blocked)
#   }
update_cache() {
  # jq 없으면 캐시 불가 — 조용히 건너뜀
  if ! command -v jq >/dev/null 2>&1; then
    return 0
  fi

  mkdir -p "$CACHE_DIR"

  # 1) 활성 태스크 (open + in_progress + blocked) 1회 호출
  local active_json
  active_json=$(bd list --json 2>/dev/null) || { return 0; }

  # 2) 최근 완료 10건 (closed)
  local closed_json
  closed_json=$(bd list --json -s closed --sort updated -r -n 10 2>/dev/null) || closed_json="[]"

  # 3) jq로 요약 통계 + 에이전트별 분류 → state.json 생성
  if [ -z "$active_json" ] || [ "$active_json" = "null" ]; then
    active_json="[]"
  fi
  if [ -z "$closed_json" ] || [ "$closed_json" = "null" ]; then
    closed_json="[]"
  fi

  jq -n \
    --argjson active "$active_json" \
    --argjson closed "$closed_json" \
    --arg ts "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" \
    '
    def agents: ["task-manager","spec-manager","worker-1","worker-2","consultant"];

    ($active + $closed) as $all |

    {
      "updated_at": $ts,
      "summary": {
        "in_progress": ($active | map(select(.status=="in_progress")) | length),
        "open":        ($active | map(select(.status=="open"))        | length),
        "blocked":     ($active | map(select(.status=="blocked"))     | length),
        "closed":      ($closed | length)
      },
      "agents": (
        agents | map(. as $ag | {
          key: $ag,
          value: {
            "in_progress": ($active | map(select(.assignee==$ag and .status=="in_progress"))),
            "open":        ($active | map(select(.assignee==$ag and .status=="open"))),
            "blocked":     ($active | map(select(.assignee==$ag and .status=="blocked"))),
            "closed":      ($closed | map(select(.assignee==$ag)))
          }
        }) | from_entries
      ),
      "all_tasks": $all
    }
    ' > "$CACHE_FILE.tmp" 2>/dev/null && mv "$CACHE_FILE.tmp" "$CACHE_FILE" || true
}

# ── label 추출 ───────────────────────────────────────────────────────────────
# beads 메시지의 labels 배열에서 알려진 워크플로우 label을 추출합니다.
# $1 = bd show 출력 또는 JSON 문자열
extract_label() {
  local text="$1"
  echo "$text" \
    | grep -oE '(assign_task|task_completed|blocker_found|validate_spec|spec_validated|spec_rejected|escalate|all_tasks_done|permission_needed|request_spec|update_spec|spec_ready)' \
    | head -1
}

# ── 프롬프트 생성 ────────────────────────────────────────────────────────────
# label 기반으로 에이전트에게 전달할 자연어 지시를 생성합니다.
make_prompt() {
  local msg_id="$1"
  local msg_label="$2"

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
      base="bd show ${msg_id} 태스크를 확인하세요. 명세서가 도착했습니다. 명세서 파일을 읽고 beads 태스크와 내용이 일치하는지 검증하세요. 검증 통과 시 작업자에게 할당하고, 실패 시 spec-manager에게 update_spec 메시지를 보내 수정을 요청하세요."
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

  echo "$base"
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

  printf "${CYAN}${BOLD}  ▶ dispatcher v4.0.0${RESET}"
  printf "  ${DIM}beads 직접 폴링 · bd list 기반 · state.json 캐시${RESET}\033[K\n"

  printf "${CYAN}${BOLD}"
  printf '━%.0s' $(seq 1 "$W")
  printf "${RESET}\033[K\n"

  printf "  ${DIM}%s  · poll: %ss  · gap: %ss${RESET}\033[K\n\n" \
    "$ts" "$POLL_INTERVAL" "$AGENT_GAP"

  for agent in "${AGENTS[@]}"; do
    local last
    last=$(get_last_sent "$agent")
    printf "  ${GREEN}▶ %-15s${RESET}  ${DIM}%s${RESET}\033[K\n" "$agent" "$last"
  done

  printf "\n  ${DIM}다음 순환까지 ${POLL_INTERVAL}s 대기 중...${RESET}\033[K\n"
}

# ── beads 폴링 헬퍼 ──────────────────────────────────────────────────────────
# 에이전트별로 open 상태 message를 조회합니다.
# 반환: 첫 번째 메시지 ID (없으면 빈 문자열)
poll_message() {
  local agent="$1"
  if ! command -v jq >/dev/null 2>&1; then
    # jq 없으면 bd list 텍스트 출력에서 파싱 시도
    bd list --type message --status open --assignee "$agent" 2>/dev/null \
      | grep -oE 'blog-[a-z0-9]+' | head -1 || true
    return
  fi
  bd list --json --type message --status open --assignee "$agent" 2>/dev/null \
    | jq -r '.[0].id // empty' 2>/dev/null || true
}

# 메시지 label 조회 (bd show 출력에서 추출)
get_message_label() {
  local msg_id="$1"
  local show_output
  show_output=$(bd show "$msg_id" 2>/dev/null) || true
  extract_label "$show_output"
}

# ── 시작 메시지 ──────────────────────────────────────────────────────────────
echo "🚀 dispatcher v4.0.0 시작 (beads 직접 폴링 방식)"
echo "   세션: ${SESSION_NAME}"
echo "   에이전트: ${AGENTS[*]}"
echo "   폴링 간격: ${POLL_INTERVAL}s  /  에이전트 간격: ${AGENT_GAP}s"
echo "   캐시: ${CACHE_FILE}"
echo ""
echo "⏳ opencode 세션 초기화 대기 중 (5초)..."
sleep 5

# ── 메인 루프 ────────────────────────────────────────────────────────────────
while true; do

  # 각 에이전트별 beads 직접 폴링 및 전송
  for agent in "${AGENTS[@]}"; do

    # open 상태 메시지 조회 (없으면 빈 문자열)
    msg_id=$(poll_message "$agent")
    if [ -z "$msg_id" ]; then
      sleep "$AGENT_GAP"
      continue
    fi

    # 중복 전송 방지: in_progress로 마킹
    bd update "$msg_id" --status in_progress 2>/dev/null || true

    # label 조회
    label=$(get_message_label "$msg_id")

    # 프롬프트 생성
    prompt=$(make_prompt "$msg_id" "$label")

    # opencode interactive 세션에 프롬프트 직접 전송
    # -l 플래그: 특수문자를 키 바인딩으로 해석하지 않고 리터럴 텍스트로 전송
    tmux send-keys -t "${SESSION_NAME}:${agent}" -l "${prompt}"
    tmux send-keys -t "${SESSION_NAME}:${agent}" "" Enter

    set_last_sent "$agent" "$msg_id"

    sleep "$AGENT_GAP"
  done

  # 상태 표시 후 POLL_INTERVAL 대기
  print_status
  update_cache
  sleep "$POLL_INTERVAL"
done
