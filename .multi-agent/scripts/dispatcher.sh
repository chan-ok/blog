#!/bin/bash
# 중앙 집중형 파일 큐 디스패처 (v3.1.0 — 캐시 갱신 추가)
#
# opencode interactive 세션에 프롬프트 텍스트를 직접 send-keys로 전달하여
# opencode 내부 입력 버퍼가 자연스러운 큐 역할을 하도록 합니다.
#
# 특징:
#   - beads DB 비접근: bd list / bd update 호출 없음 (캐시 갱신 제외)
#   - mq.sh 파일 큐 기반 폴링 (mq_claim → tmux send-keys → mq_done)
#   - 멱등성 보장: mq.sh의 pending/processing 파일로 중복 전송 방지
#   - bash 3.2 호환 (macOS 기본 bash, declare -A 미사용)
#   - 매 순환마다 bd list --json 1회 호출 → .multi-agent/cache/state.json 갱신
#     (dashboard.sh / ma.sh는 state.json만 읽어 beads LOCK 충돌 근본 해소)
#
# 환경변수 (선택):
#   MULTI_AGENT_SESSION  : tmux 세션 이름 (기본값: multi-agent)
#   POLL_INTERVAL        : 전체 순환 주기 초 (기본값: 5)
#   AGENT_GAP            : 에이전트 간 간격 초 (기본값: 1)
#   STALE_TIMEOUT        : stale processing 임계값 초 (기본값: 1800 = 30분)
#
# 변경 내역 (v3.1.0):
#   - update_cache() 함수 추가: bd list --json 1회 호출 → state.json 갱신
#   - CACHE_DIR / CACHE_FILE 상수 추가
#   - 메인 루프에 update_cache 호출 추가
#
# 변경 내역 (v3.0.0):
#   - bd_poll(), bd_update_status(), check_stale() 제거
#   - LOCK_DIR, RETRY_DIR, BD_MAX_RETRY, _stale_count 제거
#   - source mq.sh 로드 + mq_claim/mq_done 기반 폴링으로 전면 교체
#   - _mq_json_field() JSON 파싱 헬퍼 추가
#   - _MQ_STALE_MINUTES 환경변수로 stale 임계값 전달
#
# 변경 내역 (v2.0.0):
#   - is_agent_busy() 제거 (pane_current_command 오감지 문제 근본 해결)
#   - opencode run 트리거 → opencode interactive에 프롬프트 텍스트 직접 전달
#   - bd update --status in_progress 마킹 추가 (중복 전송 방지)
#   - stale in_progress 자동 복구 기능 추가
#   - 재시도 횟수 추적 및 프롬프트에 재시도 컨텍스트 추가
#
# 변경 내역 (v1.1.0):
#   - declare -A 제거 → eval + ${!var} 간접 참조로 대체 (bash 3.2 호환)

# ── mq.sh 로드 ──────────────────────────────────────────────────────────────
source "$(dirname "${BASH_SOURCE[0]}")/mq.sh"

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
STALE_TIMEOUT="${STALE_TIMEOUT:-$(_cfg stale_timeout 1800)}"           # stale processing 임계값 (초)

# ── 캐시 설정 ───────────────────────────────────────────────────────────────
CACHE_DIR="$PROJECT_ROOT/.multi-agent/cache"
CACHE_FILE="$CACHE_DIR/state.json"

# mq.sh stale 임계값 환경변수로 전달 (분 단위)
_MQ_STALE_MINUTES=$(( STALE_TIMEOUT / 60 ))
export _MQ_STALE_MINUTES

AGENTS=(task-manager spec-manager worker-1 worker-2)

# ── 색상 ────────────────────────────────────────────────────────────────────
RESET='\033[0m'
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
RED='\033[0;31m'

# ── JSON 필드 추출 헬퍼 ──────────────────────────────────────────────────────
# jq 우선 사용, 없으면 grep/sed fallback (bash 3.2 호환)
_mq_json_field() {
  local file="$1" field="$2"
  if command -v jq >/dev/null 2>&1; then
    jq -r ".$field // empty" "$file" 2>/dev/null
  else
    grep -o "\"$field\": *\"[^\"]*\"" "$file" | sed 's/.*": *"\(.*\)"/\1/'
  fi
}

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
#
# 설계 원칙:
#   - bd list --json 은 현재 open/in_progress/blocked 태스크만 반환 (기본 동작)
#   - closed는 별도 1회 호출 (최근 N건만: --sort updated -r -n 10)
#   - jq 없을 경우 state.json 생성 건너뜀 (dashboard가 graceful fallback 처리)
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
  # 빈 배열 또는 null 방어
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
    # 알려진 에이전트 목록
    def agents: ["task-manager","spec-manager","worker-1","worker-2","consultant"];

    # 전체 태스크 = 활성 + 최근 closed 합산
    ($active + $closed) as $all |

    # 요약 통계 (활성 기준)
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
extract_label() {
  local line="$1"
  echo "$line" \
    | grep -oE '\[(assign_task|task_completed|blocker_found|validate_spec|spec_validated|spec_rejected|escalate|all_tasks_done|permission_needed|request_spec|update_spec|spec_ready)\]' \
    | head -1 \
    | tr -d '[]'
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

  echo "${base}${retry_ctx}"
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

  printf "${CYAN}${BOLD}  ▶ dispatcher v3.1.0${RESET}"
  printf "  ${DIM}파일 큐 방식 · mq_claim/mq_done 기반 · state.json 캐시${RESET}\033[K\n"

  printf "${CYAN}${BOLD}"
  printf '━%.0s' $(seq 1 "$W")
  printf "${RESET}\033[K\n"

  printf "  ${DIM}%s  · poll: %ss  · gap: %ss  · stale: %ss${RESET}\033[K\n\n" \
    "$ts" "$POLL_INTERVAL" "$AGENT_GAP" "$STALE_TIMEOUT"

  for agent in "${AGENTS[@]}"; do
    local last retry_count
    last=$(get_last_sent "$agent")
    retry_count=0
    if [ "$last" != "-" ]; then
      retry_count=$(_mq_retry_count "${last}" 2>/dev/null || echo 0)
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
echo "🚀 dispatcher v3.1.0 시작 (파일 큐 방식 + state.json 캐시)"
echo "   세션: ${SESSION_NAME}"
echo "   에이전트: ${AGENTS[*]}"
echo "   폴링 간격: ${POLL_INTERVAL}s  /  에이전트 간격: ${AGENT_GAP}s  /  stale 임계값: ${STALE_TIMEOUT}s"
echo "   큐 루트: ${_MQ_ROOT}"
echo "   캐시: ${CACHE_FILE}"
echo ""
echo "⏳ opencode 세션 초기화 대기 중 (5초)..."
sleep 5

# ── 메인 루프 ────────────────────────────────────────────────────────────────
while true; do

  # 각 에이전트별 파일 큐 폴링 및 전송
  for agent in "${AGENTS[@]}"; do

    # 파일 큐에서 pending 메시지 획득 (없으면 빈 문자열)
    proc_file=$(mq_claim "$agent")
    if [ -z "$proc_file" ]; then
      sleep "$AGENT_GAP"
      continue
    fi

    # JSON 파일에서 bead_id, label 추출
    bead_id=$(_mq_json_field "$proc_file" "bead_id")
    label=$(_mq_json_field "$proc_file" "label")
    retry_count=$(_mq_retry_count "$proc_file")

    if [ -z "$bead_id" ]; then
      sleep "$AGENT_GAP"
      continue
    fi

    # 프롬프트 생성
    prompt=$(make_prompt "$bead_id" "$label" "$retry_count")

    # opencode interactive 세션에 프롬프트 직접 전송
    # -l 플래그: 특수문자를 키 바인딩으로 해석하지 않고 리터럴 텍스트로 전송
    tmux send-keys -t "${SESSION_NAME}:${agent}" -l "${prompt}"
    tmux send-keys -t "${SESSION_NAME}:${agent}" "" Enter

    # 전송 완료 → processing 파일 아카이브
    mq_done "$proc_file"

    set_last_sent "$agent" "$bead_id"

    sleep "$AGENT_GAP"
  done

  # 상태 표시 후 POLL_INTERVAL 대기
  print_status
  update_cache
  sleep "$POLL_INTERVAL"
done
