#!/usr/bin/env bash
# ── mq.sh — 파일 기반 메시지 큐 헬퍼 ──────────────────────────────────────────
# bash 3.2 호환 (macOS 기본 bash)
# 큐 구조:
#   .multi-agent/queue/{agent}/          ← 에이전트 수신함
#   .multi-agent/queue/archive/{agent}/  ← 처리 완료 아카이브
#
# 파일 명명 규칙:
#   {bead_id}-{status}-{YYYYMMDD-HHMMSS}-{retry_count}.json
#
# 사용법:
#   source .multi-agent/scripts/mq.sh
#   mq_send <to_agent> <bead_id> <label> <from_agent> <payload_json>
#   mq_claim <agent>
#   mq_done <processing_file_path>
#   mq_fail <processing_file_path>
#   mq_cleanup
#   mq_recover <agent>
# ─────────────────────────────────────────────────────────────────────────────

# 큐 루트 경로 (이 스크립트 기준으로 상위 디렉토리)
_MQ_ROOT="${_MQ_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/queue}"
_MQ_MAX_RETRY="${_MQ_MAX_RETRY:-3}"
_MQ_STALE_MINUTES="${_MQ_STALE_MINUTES:-30}"
_MQ_ARCHIVE_DAYS="${_MQ_ARCHIVE_DAYS:-3}"

# ── 내부 헬퍼 ─────────────────────────────────────────────────────────────────

# 현재 시각을 YYYYMMDD-HHMMSS 형식으로 반환
_mq_timestamp() {
  date +"%Y%m%d-%H%M%S"
}

# 파일명에서 필드 추출: {bead_id}-{status}-{datetime}-{retry}.json
# $1 = 파일 경로, $2 = 필드 번호 (1=bead_id, 2=status, 3=datetime, 4=retry)
_mq_field() {
  local base
  base=$(basename "$1" .json)
  # 뒤에서부터 파싱: retry(마지막), datetime(끝에서 두번째), status(끝에서 세번째)
  # bead_id는 나머지 앞부분 전체
  local retry datetime status bead_id
  retry="${base##*-}"
  base="${base%-*}"
  datetime="${base##*-}"
  # datetime은 HHMMSS 부분 — 앞 YYYYMMDD와 합쳐야 함
  base="${base%-*}"
  local date_part="${base##*-}"
  base="${base%-*}"
  datetime="${date_part}-${datetime}"
  status="${base##*-}"
  bead_id="${base%-*}"

  case "$2" in
    1) printf "%s" "$bead_id"  ;;
    2) printf "%s" "$status"   ;;
    3) printf "%s" "$datetime" ;;
    4) printf "%s" "$retry"    ;;
  esac
}

# 파일명에서 retry_count 추출
_mq_retry_count() {
  local base
  base=$(basename "$1" .json)
  printf "%s" "${base##*-}"
}

# 파일명에서 bead_id 추출 (앞부분: status/datetime/retry 제거)
_mq_bead_id() {
  local base
  base=$(basename "$1" .json)
  # 뒤 3개 필드(retry, HHMMSS, YYYYMMDD, status) 제거
  local retry datetime_h datetime_d status rest
  retry="${base##*-}"; base="${base%-*}"
  datetime_h="${base##*-}"; base="${base%-*}"
  datetime_d="${base##*-}"; base="${base%-*}"
  status="${base##*-}"; base="${base%-*}"
  printf "%s" "$base"
}

# 디렉토리 없으면 생성
_mq_ensure_dir() {
  [ -d "$1" ] || mkdir -p "$1"
}

# ── mq_send ───────────────────────────────────────────────────────────────────
# 수신 에이전트 inbox에 pending 메시지 파일 생성
#
# 사용법: mq_send <to_agent> <bead_id> <label> <from_agent> <payload_json>
#   to_agent     : 수신 에이전트명 (task-manager, spec-manager, worker-1, ...)
#   bead_id      : 연동된 beads 태스크 ID
#   label        : 메시지 유형 (assign_task, task_completed, blocker_found, ...)
#   from_agent   : 송신 에이전트명
#   payload_json : 메시지 본문 JSON 문자열
#
# 반환: 생성된 파일 경로 (stdout)
mq_send() {
  local to_agent="$1"
  local bead_id="$2"
  local label="$3"
  local from_agent="$4"
  local payload_json="$5"

  if [ -z "$to_agent" ] || [ -z "$bead_id" ] || [ -z "$label" ] || [ -z "$from_agent" ]; then
    printf "mq_send: 필수 인자 누락 (to_agent, bead_id, label, from_agent)\n" >&2
    return 1
  fi

  local inbox_dir="$_MQ_ROOT/$to_agent"
  _mq_ensure_dir "$inbox_dir"

  local ts; ts=$(_mq_timestamp)
  local idempotency_key="${bead_id}-${label}-${to_agent}"
  local filename="${bead_id}-pending-${ts}-0.json"
  local filepath="$inbox_dir/$filename"

  # 멱등성 체크: 동일 idempotency_key의 pending/processing 파일이 있으면 skip
  local existing
  existing=$(ls "$inbox_dir"/${bead_id}-pending-*.json 2>/dev/null | head -1 || true)
  if [ -n "$existing" ]; then
    printf "%s" "$existing"
    return 0
  fi

  # JSON 파일 작성
  printf '{\n  "bead_id": "%s",\n  "label": "%s",\n  "from": "%s",\n  "to": "%s",\n  "payload": %s,\n  "created_at": "%s",\n  "retry_count": 0,\n  "idempotency_key": "%s"\n}\n' \
    "$bead_id" \
    "$label" \
    "$from_agent" \
    "$to_agent" \
    "${payload_json:-{}}" \
    "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
    "$idempotency_key" \
    > "$filepath"

  printf "%s" "$filepath"
}

# ── mq_claim ──────────────────────────────────────────────────────────────────
# inbox에서 pending 파일 하나를 atomic mv로 processing으로 전환
# 소유권 획득 성공 시 processing 파일 경로를 stdout으로 반환, 없으면 빈 문자열
#
# 사용법: mq_claim <agent>
mq_claim() {
  local agent="$1"
  if [ -z "$agent" ]; then
    printf "mq_claim: agent 인자 필요\n" >&2
    return 1
  fi

  local inbox_dir="$_MQ_ROOT/$agent"
  _mq_ensure_dir "$inbox_dir"

  # pending 파일 목록을 생성 시각 순(파일명 사전순 = 시간순)으로 순회
  local f
  for f in "$inbox_dir"/*-pending-*.json; do
    # glob 미매칭 시 리터럴 문자열이 반환되므로 파일 존재 확인
    [ -f "$f" ] || continue

    # pending → processing 으로 atomic rename
    local base; base=$(basename "$f" .json)
    # retry_count 추출
    local retry; retry="${base##*-}"
    # 나머지에서 status 부분(pending)을 processing으로 교체
    # 파일명 구조: {bead_id}-pending-{datetime}-{retry}.json
    local prefix; prefix="${base%-pending-*}"
    local suffix; suffix="${base#*-pending-}"   # {datetime}-{retry}
    local new_name="${prefix}-processing-${suffix}.json"
    local new_path="$inbox_dir/$new_name"

    # mv는 POSIX atomic rename (같은 파일시스템 내)
    if mv "$f" "$new_path" 2>/dev/null; then
      printf "%s" "$new_path"
      return 0
    fi
    # mv 실패 = 다른 프로세스가 먼저 획득 → 다음 파일 시도
  done

  # 없으면 빈 문자열
  printf ""
}

# ── mq_done ───────────────────────────────────────────────────────────────────
# processing 파일을 done으로 mv 후 archive로 이동
#
# 사용법: mq_done <processing_file_path>
mq_done() {
  local proc_file="$1"
  if [ -z "$proc_file" ] || [ ! -f "$proc_file" ]; then
    printf "mq_done: 유효한 파일 경로 필요: %s\n" "$proc_file" >&2
    return 1
  fi

  local dir; dir=$(dirname "$proc_file")
  local base; base=$(basename "$proc_file" .json)

  # processing → done 으로 이름 변경
  local done_name; done_name="${base/-processing-/-done-}.json"
  local done_path="$dir/$done_name"
  mv "$proc_file" "$done_path"

  # archive/{agent}/ 로 이동
  # dir 마지막 컴포넌트 = agent명
  local agent; agent=$(basename "$dir")
  local archive_dir="$_MQ_ROOT/archive/$agent"
  _mq_ensure_dir "$archive_dir"

  mv "$done_path" "$archive_dir/$done_name"
}

# ── mq_fail ───────────────────────────────────────────────────────────────────
# processing 파일 실패 처리
#   - retry_count < MAX_RETRY: retry_count+1로 pending 파일 재생성
#   - retry_count >= MAX_RETRY: failed로 archive 이동
#
# 사용법: mq_fail <processing_file_path>
mq_fail() {
  local proc_file="$1"
  if [ -z "$proc_file" ] || [ ! -f "$proc_file" ]; then
    printf "mq_fail: 유효한 파일 경로 필요: %s\n" "$proc_file" >&2
    return 1
  fi

  local dir; dir=$(dirname "$proc_file")
  local base; base=$(basename "$proc_file" .json)
  local agent; agent=$(basename "$dir")

  # retry_count 추출 (파일명 마지막 필드)
  local retry; retry="${base##*-}"

  # 새 retry_count
  local new_retry; new_retry=$(( retry + 1 ))

  if [ "$new_retry" -gt "$_MQ_MAX_RETRY" ]; then
    # MAX_RETRY 초과 → failed로 archive 이동
    local failed_name; failed_name="${base/-processing-/-failed-}.json"
    failed_name="${failed_name%-${retry}.json}-${new_retry}.json"
    local archive_dir="$_MQ_ROOT/archive/$agent"
    _mq_ensure_dir "$archive_dir"
    mv "$proc_file" "$archive_dir/$failed_name"
  else
    # 재시도 → pending 재생성 (retry_count 증가, 새 타임스탬프)
    local ts; ts=$(_mq_timestamp)
    # 원래 bead_id와 datetime 앞부분 추출
    # 구조: {bead_id}-processing-{datetime}-{retry}.json
    local prefix; prefix="${base%-processing-*}"
    local new_name="${prefix}-pending-${ts}-${new_retry}.json"
    local new_path="$dir/$new_name"
    mv "$proc_file" "$new_path"
  fi
}

# ── mq_cleanup ────────────────────────────────────────────────────────────────
# archive 내 _MQ_ARCHIVE_DAYS일 이상 경과한 파일 삭제
# start.sh에서 호출
#
# 사용법: mq_cleanup
mq_cleanup() {
  local archive_dir="$_MQ_ROOT/archive"
  [ -d "$archive_dir" ] || return 0

  # find로 N일 이상 된 파일 삭제
  find "$archive_dir" -type f -name "*.json" -mtime +"${_MQ_ARCHIVE_DAYS}" -delete 2>/dev/null || true

  # 빈 디렉토리 정리
  find "$archive_dir" -type d -empty -delete 2>/dev/null || true
}

# ── mq_recover ────────────────────────────────────────────────────────────────
# 에이전트 inbox에서 _MQ_STALE_MINUTES분 이상 processing 상태인 파일을 pending으로 복구
# 에이전트 재시작 시 호출
#
# 사용법: mq_recover <agent>
mq_recover() {
  local agent="$1"
  if [ -z "$agent" ]; then
    printf "mq_recover: agent 인자 필요\n" >&2
    return 1
  fi

  local inbox_dir="$_MQ_ROOT/$agent"
  [ -d "$inbox_dir" ] || return 0

  local f
  for f in "$inbox_dir"/*-processing-*.json; do
    [ -f "$f" ] || continue

    # 파일 수정 시각 기준으로 경과 시간(분) 계산
    # macOS stat: stat -f %m (수정 시각 epoch)
    local mtime now elapsed
    mtime=$(stat -f "%m" "$f" 2>/dev/null || stat -c "%Y" "$f" 2>/dev/null || true)
    now=$(date +%s)
    if [ -z "$mtime" ]; then
      continue
    fi
    elapsed=$(( (now - mtime) / 60 ))

    if [ "$elapsed" -ge "$_MQ_STALE_MINUTES" ]; then
      # processing → pending 으로 복구 (타임스탬프 갱신)
      local base; base=$(basename "$f" .json)
      local prefix; prefix="${base%-processing-*}"
      local retry; retry="${base##*-}"
      local ts; ts=$(_mq_timestamp)
      local new_name="${prefix}-pending-${ts}-${retry}.json"
      mv "$f" "$inbox_dir/$new_name" 2>/dev/null || true
    fi
  done
}
