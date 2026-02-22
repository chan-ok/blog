#!/bin/bash
# 에이전트 대시보드 - Window 0 (monitor)의 각 pane에서 실행
# 사용법: bash .multi-agent/scripts/dashboard.sh <agent-name>
#
# 레이아웃:
#   좌(50%) — overview     : 전체 높이, 전체 진행 현황
#   우(50%) — 에이전트 4개 : 1/4 높이씩, 역할별 특화 표시
#
# 에이전트 pane 구성 (역할별):
#   task-manager : 할당 bd + 현재 분해 중 태스크
#   spec-manager : 할당 bd + 검증 대기/진행 spec
#   worker-1/2   : 할당 bd + 현재 작업 + 최근 로그

AGENT=${1:-"unknown"}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$PROJECT_ROOT/.multi-agent/logs"

# spec 필터 전역 상태 (빈 문자열 = 전체 표시)
# /tmp/multi-agent-active-spec 파일에서 초기값 로드
ACTIVE_SPEC_FILE="/tmp/multi-agent-active-spec"
if [ -f "$ACTIVE_SPEC_FILE" ]; then
  ACTIVE_SPEC=$(cat "$ACTIVE_SPEC_FILE" 2>/dev/null || true)
else
  ACTIVE_SPEC=""
fi

# 색상
R='\033[0m'
B='\033[1m'
D='\033[2m'
RED='\033[0;31m'
GRN='\033[0;32m'
YLW='\033[1;33m'
BLU='\033[0;34m'
CYN='\033[0;36m'
WHT='\033[1;37m'
GRY='\033[0;37m'

# ── 깜빡임 없는 갱신 ─────────────────────────────────────────────────────────
_FIRST_DRAW=1
begin_frame() {
  if [ "$_FIRST_DRAW" -eq 1 ]; then
    printf '\033[2J\033[H'
    _FIRST_DRAW=0
  else
    printf '\033[H'
  fi
}
# 줄 출력 + 줄 끝 잔상 제거
pln() { printf "$@"; printf '\033[K\n'; }
# 구분선
sep() { local w=${1:-60}; printf "${D}"; printf '─%.0s' $(seq 1 "$w"); printf "${R}\033[K\n"; }

# ── 에이전트별 설정 ───────────────────────────────────────────────────────────
case "$AGENT" in
  task-manager) LABEL="TASK-MGR"  ; CLR=$YLW ; ASSIGNEE="task-manager" ; ROLE="태스크 분해·할당·추적"    ;;
  spec-manager) LABEL="SPEC-MGR"  ; CLR=$BLU ; ASSIGNEE="spec-manager" ; ROLE="명세서 검증·품질 게이트"  ;;
  worker-1)     LABEL="WORKER-1"  ; CLR=$GRN ; ASSIGNEE="worker-1"     ; ROLE="코드 작성·테스트"         ;;
  worker-2)     LABEL="WORKER-2"  ; CLR=$GRN ; ASSIGNEE="worker-2"     ; ROLE="코드 작성·테스트"         ;;
  overview)     LABEL="OVERVIEW"  ; CLR=$WHT ; ASSIGNEE=""              ; ROLE=""                         ;;
  *)            LABEL="UNKNOWN"   ; CLR=$GRY ; ASSIGNEE=""              ; ROLE=""                         ;;
esac

count_lines() {
  # 주어진 문자열에서 비어있지 않은 줄 수를 안전하게 반환
  local text="$1"
  if [ -z "$text" ]; then
    echo 0
    return
  fi
  local cnt
  cnt=$(printf "%s\n" "$text" | grep -c "." 2>/dev/null || echo 0)
  cnt=$(printf "%s" "$cnt" | head -1 | tr -dc '0-9')
  printf "%d" "${cnt:-0}"
}

# ── 공통: 전체 통계 ───────────────────────────────────────────────────────────
get_stats() {
  local ip_raw op_raw bl_raw cl_raw
  ip_raw=$(bd list -s in_progress 2>/dev/null | grep "^◐" || true)
  op_raw=$(bd list -s open        2>/dev/null | grep "^○"  || true)
  bl_raw=$(bd list -s blocked     2>/dev/null | grep "^●"  || true)
  cl_raw=$(bd list -s closed      2>/dev/null | grep "^✓"  || true)
  local ip op bl cl
  ip=$(count_lines "$ip_raw")
  op=$(count_lines "$op_raw")
  bl=$(count_lines "$bl_raw")
  cl=$(count_lines "$cl_raw")
  echo "${ip} ${op} ${bl} ${cl}"
}

# ── 진행도 바 ─────────────────────────────────────────────────────────────────
draw_bar() {
  local ip=$1 cl=$2 total=$3 bw=$4
  [ "$total" -le 0 ] && printf "${D}[%-${bw}s] --%% ${R}" "" && return
  [ $bw -lt 4 ] && bw=4
  local dl=$(( bw * cl / total ))
  local pl=$(( bw * ip / total ))
  local rl=$(( bw - dl - pl ))
  [ $rl -lt 0 ] && rl=0
  local pct=$(( cl * 100 / total ))
  printf "${D}[${R}"
  [ $dl -gt 0 ] && printf "${GRN}%${dl}s${R}" | tr ' ' '█'
  [ $pl -gt 0 ] && printf "${YLW}%${pl}s${R}" | tr ' ' '▓'
  [ $rl -gt 0 ] && printf "${D}%${rl}s${R}"   | tr ' ' '░'
  printf "${D}]${R} ${B}%3d%%${R}" "$pct"
}

# ── OVERVIEW (좌 전체) ────────────────────────────────────────────────────────
draw_overview() {
  local W H
  W=$(tput cols  2>/dev/null || echo 50)
  H=$(tput lines 2>/dev/null || echo 30)
  begin_frame

  # ① 헤더
  if [ -z "$ACTIVE_SPEC" ]; then
    pln "${CLR}${B} OVERVIEW${R}  ${D}$(date '+%H:%M:%S')${R}"
  else
    pln "${CLR}${B} OVERVIEW${R}  ${D}$(date '+%H:%M:%S')  [${CYN}${ACTIVE_SPEC}${R}${D}]${R}"
  fi
  sep "$W"

  # ① - spec 헤더: ACTIVE_SPEC 설정 시 spec 제목 + functional 항목 표시
  if [ -n "$ACTIVE_SPEC" ]; then
    local spec_path="$PROJECT_ROOT/.multi-agent/specs/$ACTIVE_SPEC"
    if [ -f "$spec_path" ]; then
      # metadata.title 파싱
      local spec_title
      spec_title=$(grep "^  title:" "$spec_path" | head -1 \
        | sed "s/^  title: *//" | tr -d "'\"")
      [ -n "$spec_title" ] && pln "  ${CYN}${B}%s${R}" "$(trunc_title "$spec_title" $(( W - 4 )))"

      # requirements.functional 항목 최대 3줄 파싱
      local func_items
      func_items=$(awk '/^  functional:/,/^  [a-z_]+:/' "$spec_path" \
        | grep "^    - " | head -3 | sed "s/^    - //" | tr -d "'\"")
      if [ -n "$func_items" ]; then
        while IFS= read -r item; do
          [ -z "$item" ] && continue
          pln "  ${D}· %s${R}" "$(trunc_title "$item" $(( W - 6 )))"
        done <<< "$func_items"
      fi
      sep "$W"
    fi
  fi

  # ② 통계 수치 (2줄)
  read -r ip op bl cl <<< "$(get_stats)"
  local total=$(( ip + op + bl + cl ))
  pln ""
  pln "  ${YLW}${B}■ 진행  %-3s${R}   ${D}□ 대기  %-3s${R}" "$ip" "$op"
  pln "  ${RED}${B}■ 블록  %-3s${R}   ${GRN}■ 완료  %-3s${R}" "$bl" "$cl"
  pln ""

  # ③ 진행도 바
  local bw=$(( W - 8 ))
  printf "  "
  draw_bar "$ip" "$cl" "$total" "$bw"
  printf '\033[K\n'
  pln ""
  sep "$W"

  # ④ 에이전트별 현재 상태
  pln "${B} Agents${R}"
  local agents="task-manager spec-manager worker-1 worker-2 consultant"
  for ag in $agents; do
    local ag_ip ag_bl icon task_title
    local _ip_raw _bl_raw
    _ip_raw=$(bd list --assignee "$ag" -s in_progress 2>/dev/null | grep "^◐" || true)
    _bl_raw=$(bd list --assignee "$ag" -s blocked     2>/dev/null | grep "^●" || true)
    ag_ip=$(count_lines "$_ip_raw")
    ag_bl=$(count_lines "$_bl_raw")

    if   [ "$ag_bl" -gt 0 ]; then icon="${RED}■${R}"
    elif [ "$ag_ip" -gt 0 ]; then icon="${YLW}■${R}"
    else                           icon="${D}□${R}"
    fi

    # " - " 이후 순수 제목만 추출 + 멀티바이트 안전 자르기
    local raw_ag_title
    task_title=""
    if [ "$ag_ip" -gt 0 ]; then
      raw_ag_title=$(printf "%s" "$_ip_raw" | head -1 \
        | sed 's/.*[[:space:]]-[[:space:]]//' || true)
      task_title=$(trunc_title "$raw_ag_title" $(( W - 22 )))
    fi

    local ag_pad
    ag_pad=$(printf "%-14s" "$ag")
    if [ -n "$task_title" ]; then
      pln "  %b ${D}${ag_pad}${R} ${D}%s${R}" "$icon" "$task_title"
    else
      pln "  %b ${D}${ag_pad}${R} ${D}idle${R}" "$icon"
    fi
  done
  sep "$W"

  # ⑤ Todos (in_progress + pending)
  pln "${B} Todos${R}"
  local todo_shown=0
  local _todo_ip _todo_pd
  # ACTIVE_SPEC 필터: 설정된 경우 --label 옵션으로 해당 spec 태스크만 표시
  if [ -n "$ACTIVE_SPEC" ]; then
    _todo_ip=$(bd list -s in_progress --label "$ACTIVE_SPEC" 2>/dev/null | grep "^◐" || true)
    _todo_pd=$(bd list -s open        --label "$ACTIVE_SPEC" 2>/dev/null | grep "^○" || true)
  else
    _todo_ip=$(bd list -s in_progress 2>/dev/null | grep "^◐" || true)
    _todo_pd=$(bd list -s open        2>/dev/null | grep "^○" || true)
  fi
  if [ -n "$_todo_ip" ]; then
    while IFS= read -r line; do
      [ -z "$line" ] && continue
      local t; t=$(printf "%s" "$line" | sed 's/.*[[:space:]]-[[:space:]]//')
      t=$(trunc_title "$t" $(( W - 6 )))
      pln "  ${YLW}■${R} ${D}%s${R}" "$t"
      todo_shown=$(( todo_shown + 1 ))
    done <<< "$_todo_ip"
  fi
  if [ -n "$_todo_pd" ]; then
    while IFS= read -r line; do
      [ -z "$line" ] && continue
      local t; t=$(printf "%s" "$line" | sed 's/.*[[:space:]]-[[:space:]]//')
      t=$(trunc_title "$t" $(( W - 6 )))
      pln "  ${D}□ %s${R}" "$t"
      todo_shown=$(( todo_shown + 1 ))
    done <<< "$_todo_pd"
  fi
  [ "$todo_shown" -eq 0 ] && pln "  ${D}없음${R}"
  sep "$W"

  # ⑥ 블로커 강조 (있을 때만)
  local blocked_list
  blocked_list=$(bd list -s blocked 2>/dev/null | grep "^●" | head -3 || true)
  if [ -n "$blocked_list" ]; then
    pln "${RED}${B} ■ BLOCKED${R}"
    while IFS= read -r line; do
      [ -z "$line" ] && continue
      local t; t=$(printf "%s" "$line" | sed 's/.*[[:space:]]-[[:space:]]//')
      t=$(trunc_title "$t" $(( W - 6 )))
      pln "  ${RED}■ %s${R}" "$t"
    done <<< "$blocked_list"
    sep "$W"
  fi

  # ⑦ 최근 완료 (남은 화면에 맞게 동적 표시)
  local n_done=$(( H - 20 ))
  [ $n_done -lt 1 ] && n_done=1
  [ $n_done -gt 5 ] && n_done=5
  pln "${B} Done${R}"
  local recent
  # ACTIVE_SPEC 필터: 설정된 경우 --label 옵션으로 해당 spec 태스크만 표시
  if [ -n "$ACTIVE_SPEC" ]; then
    recent=$(bd list -s closed --sort updated -r -n "$n_done" --label "$ACTIVE_SPEC" 2>/dev/null | grep "^✓" || true)
  else
    recent=$(bd list -s closed --sort updated -r -n "$n_done" 2>/dev/null | grep "^✓" || true)
  fi
  if [ -z "$recent" ]; then
    pln "  ${D}없음${R}"
  else
    while IFS= read -r line; do
      [ -z "$line" ] && continue
      local t; t=$(printf "%s" "$line" | sed 's/.*[[:space:]]-[[:space:]]//')
      t=$(trunc_title "$t" $(( W - 6 )))
      pln "  ${GRN}■${R} ${D}%s${R}" "$t"
    done <<< "$recent"
  fi

  printf '\033[J'
}

# ── 도트 진행도 아이콘 ───────────────────────────────────────────────────────
# 사용법: draw_dots <완료수> <전체수> [최대도트수=8]
# 출력 예: ■ ■ ■ □ □  3/5
draw_dots() {
  local done_n=$1 total=$2 max=${3:-8}
  [ "$total" -le 0 ] && printf "${D}─${R}" && return
  # 전체가 max 초과 시 비율로 축소
  local filled=0 empty=0
  if [ "$total" -le "$max" ]; then
    filled=$done_n
    empty=$(( total - done_n ))
  else
    filled=$(( done_n * max / total ))
    empty=$(( max - filled ))
  fi
  local i=0
  while [ $i -lt $filled ]; do printf "${GRN}■ ${R}"; i=$(( i + 1 )); done
  while [ $i -lt $(( filled + empty )) ]; do printf "${D}□ ${R}"; i=$(( i + 1 )); done
  printf "${D}%d/%d${R}" "$done_n" "$total"
}

# ── 스펙 선택 TUI 모달 ───────────────────────────────────────────────────────
# s/f/스페이스/엔터 키 입력 시 overview에서 호출
# ↑↓ 이동, Enter 확정, q/ESC 취소
# 확정 시 /tmp/multi-agent-active-spec 에 선택된 spec 파일명 저장 (전체=빈 문자열)
show_spec_modal() {
  local W H
  W=$(tput cols  2>/dev/null || echo 60)
  H=$(tput lines 2>/dev/null || echo 30)

  # spec 파일 목록 수집 (archive 제외)
  local specs=""
  local sf
  for sf in "$PROJECT_ROOT/.multi-agent/specs/"spec-*.yaml; do
    [ -f "$sf" ] || continue
    case "$sf" in *archive*) continue ;; esac
    if [ -z "$specs" ]; then
      specs="$(basename "$sf")"
    else
      specs="$specs
$(basename "$sf")"
    fi
  done

  # 항목 수 계산 (0번 = ALL 포함)
  local n_specs
  n_specs=$(printf "%s\n" "$specs" | grep -c "." 2>/dev/null || echo 0)
  n_specs=$(printf "%s" "$n_specs" | tr -dc '0-9')
  local total_items=$(( n_specs + 1 ))   # 0=ALL, 1..n=spec 파일

  # 현재 선택 인덱스 초기화
  local cur=0
  local i sf_name
  if [ -n "$ACTIVE_SPEC" ]; then
    i=1
    while IFS= read -r sf_name; do
      [ -z "$sf_name" ] && continue
      if [ "$sf_name" = "$ACTIVE_SPEC" ]; then
        cur=$i
        break
      fi
      i=$(( i + 1 ))
    done <<< "$specs"
  fi

  # 모달 너비/위치 계산
  local mw=50
  [ "$mw" -gt "$W" ] && mw=$W
  local ml=$(( (W - mw) / 2 ))
  [ "$ml" -lt 0 ] && ml=0
  local mt=$(( (H - total_items - 6) / 2 ))
  [ "$mt" -lt 2 ] && mt=2

  # raw mode 진입: bash 3.2 호환 (stty -icanon min 0 time 1 -echo)
  stty -icanon min 0 time 1 -echo 2>/dev/null || true

  # 모달 렌더 함수 (내부)
  _render_modal() {
    local row=$mt
    local pad; pad=$(printf "%${ml}s" "")
    # 상단 테두리
    printf '\033[%d;1H' "$row"
    printf "${pad}${D}┌"; printf '─%.0s' $(seq 1 $(( mw - 2 ))); printf "┐${R}\033[K"
    row=$(( row + 1 ))

    # 제목 행
    local title=" SPEC 필터 선택  [↑↓ 이동  Enter 확정  q/ESC 취소]"
    printf '\033[%d;1H' "$row"
    printf "${pad}${D}│${R}${B}%-$(( mw - 2 ))s${R}${D}│${R}\033[K" "$title"
    row=$(( row + 1 ))

    # 구분선
    printf '\033[%d;1H' "$row"
    printf "${pad}${D}├"; printf '─%.0s' $(seq 1 $(( mw - 2 ))); printf "┤${R}\033[K"
    row=$(( row + 1 ))

    # ALL 항목 (index 0)
    local mark; mark="  "
    [ "$cur" -eq 0 ] && mark="${YLW}▶${R} " || mark="${D}  ${R}"
    local all_label="  ALL (전체 표시)"
    printf '\033[%d;1H' "$row"
    if [ "$cur" -eq 0 ]; then
      printf "${pad}${D}│${R}${YLW}${B}%-$(( mw - 2 ))s${R}${D}│${R}\033[K" "$all_label"
    else
      printf "${pad}${D}│${R}${D}%-$(( mw - 2 ))s${R}${D}│${R}\033[K" "$all_label"
    fi
    row=$(( row + 1 ))

    # spec 파일 목록
    local idx=1
    while IFS= read -r sf_name; do
      [ -z "$sf_name" ] && continue
      local item_label="  $sf_name"
      printf '\033[%d;1H' "$row"
      if [ "$cur" -eq "$idx" ]; then
        printf "${pad}${D}│${R}${YLW}${B}%-$(( mw - 2 ))s${R}${D}│${R}\033[K" "$item_label"
      else
        printf "${pad}${D}│${R}${D}%-$(( mw - 2 ))s${R}${D}│${R}\033[K" "$item_label"
      fi
      row=$(( row + 1 ))
      idx=$(( idx + 1 ))
    done <<< "$specs"

    # 하단 테두리
    printf '\033[%d;1H' "$row"
    printf "${pad}${D}└"; printf '─%.0s' $(seq 1 $(( mw - 2 ))); printf "┘${R}\033[K"
  }

  # 모달 루프
  local _result=""
  local _modal_exit=0
  while [ "$_modal_exit" -eq 0 ]; do
    _render_modal

    # ESC 시퀀스 읽기: bash 3.2 호환 방식
    # stty min 0 time 2 → read 1바이트 → 화살표 시퀀스면 추가 읽기
    stty min 0 time 2 2>/dev/null || true
    local _k1="" _k2="" _k3=""
    read -rn1 _k1 2>/dev/null || true
    stty min 1 time 0 2>/dev/null || true

    case "$_k1" in
      # ESC or ESC 시퀀스
      $'\033')
        # ESC 뒤에 추가 바이트 확인 (화살표 키)
        stty min 0 time 1 2>/dev/null || true
        read -rn1 _k2 2>/dev/null || true
        if [ "$_k2" = "[" ]; then
          read -rn1 _k3 2>/dev/null || true
          case "$_k3" in
            A) cur=$(( cur - 1 )); [ "$cur" -lt 0 ] && cur=$(( total_items - 1 )) ;;  # ↑
            B) cur=$(( cur + 1 )); [ "$cur" -ge "$total_items" ] && cur=0 ;;           # ↓
          esac
        else
          # ESC 단독 → 취소
          _modal_exit=1
        fi
        stty min 1 time 0 2>/dev/null || true
        ;;
      # Enter (CR or LF)
      $'\r'|$'\n'|"")
        # 확정
        if [ "$cur" -eq 0 ]; then
          _result=""
        else
          local _sel=1
          while IFS= read -r sf_name; do
            [ -z "$sf_name" ] && continue
            if [ "$_sel" -eq "$cur" ]; then
              _result="$sf_name"
              break
            fi
            _sel=$(( _sel + 1 ))
          done <<< "$specs"
        fi
        # /tmp/multi-agent-active-spec 에 저장
        printf "%s" "$_result" > "$ACTIVE_SPEC_FILE"
        ACTIVE_SPEC="$_result"
        _modal_exit=1
        ;;
      # q → 취소
      q|Q)
        _modal_exit=1
        ;;
      # k → ↑ (vim 스타일)
      k)
        cur=$(( cur - 1 ))
        [ "$cur" -lt 0 ] && cur=$(( total_items - 1 ))
        ;;
      # j → ↓ (vim 스타일)
      j)
        cur=$(( cur + 1 ))
        [ "$cur" -ge "$total_items" ] && cur=0
        ;;
    esac
  done

  # raw mode 복원
  stty icanon min 1 time 0 echo 2>/dev/null || true

  # 모달 영역 지우기 (화면 전체 재렌더 전 잔상 제거)
  local row=$mt
  local pad; pad=$(printf "%${ml}s" "")
  local clear_row=$(( mt + total_items + 3 ))
  while [ "$row" -le "$clear_row" ]; do
    printf '\033[%d;1H\033[K' "$row"
    row=$(( row + 1 ))
  done
  # 커서를 상단으로 복귀 (다음 draw_overview가 \033[H 로 시작하므로 OK)
}

# ── 제목 안전 자르기 (멀티바이트 보호) ──────────────────────────────────────
# awk로 출력 너비 기준 자르기 (한글 2칸, ASCII 1칸)
trunc_title() {
  local text="$1" maxw="$2"
  printf "%s" "$text" | awk -v mw="$maxw" 'BEGIN{FS=""}{
    out=""; w=0
    for(i=1;i<=NF;i++){
      c=$i
      # 한글·전각 문자 범위: 2칸
      cw = (c ~ /[가-힣ㄱ-ㅎㅏ-ㅣ！-～、。]/) ? 2 : 1
      if(w+cw > mw) break
      out=out c; w+=cw
    }
    print out
  }'
}

# ── ACTIVE_SPEC 조회 헬퍼 ────────────────────────────────────────────────────
# /tmp/multi-agent-active-spec 파일이 있으면 그 내용을, 없으면 전역변수 ACTIVE_SPEC 반환
get_active_spec() {
  if [ -f "$ACTIVE_SPEC_FILE" ]; then
    cat "$ACTIVE_SPEC_FILE" 2>/dev/null || true
  else
    printf "%s" "$ACTIVE_SPEC"
  fi
}

# ── 공통 에이전트 pane 렌더러 ────────────────────────────────────────────────
# 표시 구조:
#   LABEL  아이콘  역할  시각
#   ─────────────────────────
#   현재 작업 제목 (최대 2줄 자동 줄바꿈)
#   ■ ■ □ □ □  완료/전체   ← 도트 진행도
#   [BLOCKED: 제목]          ← 블로커 있을 때만
#   [▸ spec 파일명]          ← spec-manager 전용
draw_agent_pane() {
  local W
  W=$(tput cols 2>/dev/null || echo 40)
  begin_frame

  # ① 상태 집계 (ACTIVE_SPEC 필터 적용)
  local _active_spec; _active_spec=$(get_active_spec)
  local _spec_filter=""
  [ -n "$_active_spec" ] && _spec_filter="--label $_active_spec"
  local _ip_raw _op_raw _bl_raw _cl_raw
  _ip_raw=$(bd list --assignee "$ASSIGNEE" -s in_progress $_spec_filter 2>/dev/null | grep "^." || true)
  _op_raw=$(bd list --assignee "$ASSIGNEE" -s open        $_spec_filter 2>/dev/null | grep "^." || true)
  _bl_raw=$(bd list --assignee "$ASSIGNEE" -s blocked     $_spec_filter 2>/dev/null | grep "^." || true)
  _cl_raw=$(bd list --assignee "$ASSIGNEE" -s closed      $_spec_filter 2>/dev/null | grep "^." || true)
  local ag_ip ag_op ag_bl ag_cl
  ag_ip=$(count_lines "$_ip_raw")
  ag_op=$(count_lines "$_op_raw")
  ag_bl=$(count_lines "$_bl_raw")
  ag_cl=$(count_lines "$_cl_raw")
  local ag_total=$(( ag_ip + ag_op + ag_bl + ag_cl ))

  # ② 헤더 아이콘
  local icon
  if   [ "$ag_bl" -gt 0 ]; then icon="${RED}■${R}"
  elif [ "$ag_ip" -gt 0 ]; then icon="${YLW}■${R}"
  elif [ "$ag_op" -gt 0 ]; then icon="${D}□${R}"
  else                           icon="${D}□${R}"
  fi
  pln "${CLR}${B}%-10s${R} %b  ${D}%s${R}  ${D}%s${R}" \
    "$LABEL" "$icon" "$ROLE" "$(date '+%H:%M')"
  sep "$W"

  # ③ 현재 작업 제목 (순수 제목만, 최대 2줄 자동 줄바꿈)
  local raw_title=""
  if [ -n "$_ip_raw" ]; then
    raw_title=$(printf "%s" "$_ip_raw" | head -1 | sed 's/.*[[:space:]]-[[:space:]]//')
  elif [ -n "$_op_raw" ]; then
    raw_title=$(printf "%s" "$_op_raw" | head -1 | sed 's/.*[[:space:]]-[[:space:]]//')
  fi

  local inner=$(( W - 4 ))
  if [ -n "$raw_title" ]; then
    # 첫 줄
    local line1; line1=$(trunc_title "$raw_title" "$inner")
    pln "  ${D}%s${R}" "$line1"
    # 제목이 남으면 두 번째 줄 (첫 줄 글자 수 이후)
    local rest; rest=$(printf "%s" "$raw_title" | awk -v l="$line1" 'BEGIN{n=length(l)}{print substr($0,n+1)}')
    if [ -n "$rest" ]; then
      local line2; line2=$(trunc_title "$rest" "$inner")
      [ -n "$line2" ] && pln "  ${D}%s${R}" "$line2"
    fi
  else
    pln "  ${D}idle${R}"
  fi

  # ④ 도트 진행도
  local _dots_max=$(( W / 3 ))
  [ "$_dots_max" -lt 4  ] && _dots_max=4
  [ "$_dots_max" -gt 20 ] && _dots_max=20
  printf "  "
  draw_dots "$ag_cl" "$ag_total" "$_dots_max"
  printf '\033[K\n'

  # ⑤ 블로커 (있을 때만)
  if [ "$ag_bl" -gt 0 ]; then
    local bl_title; bl_title=$(printf "%s" "$_bl_raw" | head -1 \
      | sed 's/.*[[:space:]]-[[:space:]]//')
    bl_title=$(trunc_title "$bl_title" $(( W - 6 )))
    pln "  ${RED}■ %s${R}" "$bl_title"
  fi

  # ⑥ spec-manager 전용: 검증 대기 수 + 최신 spec 파일
  if [ "$AGENT" = "spec-manager" ]; then
    local spec_pending_raw
    spec_pending_raw=$(bd list --label request_spec --assignee spec-manager 2>/dev/null | grep "^○" || true)
    local spec_pending; spec_pending=$(count_lines "$spec_pending_raw")
    [ "$spec_pending" -gt 0 ] && \
      pln "  ${BLU}▸${R} ${D}검증 대기 ${spec_pending}건${R}"
    local spec_file
    spec_file=$(ls -t "$PROJECT_ROOT/.multi-agent/specs/"*.yaml 2>/dev/null \
      | grep -v archive | head -1 | xargs basename 2>/dev/null || true)
    [ -n "$spec_file" ] && pln "  ${D}spec: %s${R}" "$(trunc_title "$spec_file" $(( W - 10 )))"
  fi

  printf '\033[J'
}

draw_task_manager() { draw_agent_pane; }
draw_spec_manager()  { draw_agent_pane; }
draw_worker()        { draw_agent_pane; }

# ── 종료 처리 ─────────────────────────────────────────────────────────────────
_EXIT=0
trap 'stty icanon min 1 time 0 echo 2>/dev/null; _EXIT=1' INT TERM

# ── 메인 루프 ──────────────────────────────────────────────────────────────────
while [ "$_EXIT" -eq 0 ]; do
  # 논블로킹 키 입력 감지 (overview 전용 spec 필터 모달)
  if [ "$AGENT" = "overview" ]; then
    # /tmp/multi-agent-active-spec 외부 변경 반영
    if [ -f "$ACTIVE_SPEC_FILE" ]; then
      _ext_spec=$(cat "$ACTIVE_SPEC_FILE" 2>/dev/null || true)
      if [ "$_ext_spec" != "$ACTIVE_SPEC" ]; then
        ACTIVE_SPEC="$_ext_spec"
      fi
    fi
    # s / f / 스페이스 / 엔터 → 모달 오픈
    stty min 0 time 0 -echo 2>/dev/null || true
    _key=""
    read -rn1 _key 2>/dev/null || true
    stty icanon min 1 time 0 echo 2>/dev/null || true
    case "$_key" in
      s|f|" "|$'\r'|$'\n') show_spec_modal ;;
    esac
  fi

  case "$AGENT" in
    overview)     draw_overview     ;;
    task-manager) draw_task_manager ;;
    spec-manager) draw_spec_manager ;;
    worker-*)     draw_worker       ;;
    *)            draw_worker       ;;
  esac
  read -t 5 </dev/null || true
done
