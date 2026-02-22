#!/bin/bash
# ma — 멀티 에이전트 CLI 툴 (v1.2.0)
#
# 사용법:
#   ma <command> [options]
#
# 명령어:
#   start       tmux 세션 시작 및 모든 에이전트 실행
#   stop        tmux 세션 종료
#   export      opencode 세션 대화 기록 내보내기
#   pause       에이전트 일시중단 (dispatcher + 에이전트 창 정지)
#   resume      일시중단된 에이전트 재시작
#   attach      실행 중인 tmux 세션에 진입
#   status      현재 세션 및 beads 태스크 상태 조회
#   logs        오늘의 로그 파일 목록 출력
#   install     'ma' 명령어를 시스템에 등록 (symlink 또는 alias)
#   uninstall   등록된 'ma' 명령어를 안전하게 제거
#   help        이 도움말 출력

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SESSION_NAME="multi-agent"

RESET='\033[0m'
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
DIM='\033[2m'

# ── 설치 정보 파일 경로 ──────────────────────────────────────────────────────
# install 시 등록 방식(symlink/alias)과 경로를 기록해두고,
# uninstall 시 이 파일을 참조해 정확하게 제거합니다.
INSTALL_RECORD="$SCRIPT_DIR/.ma-install-record"

# ── 도움말 ───────────────────────────────────────────────────────────────────
usage() {
  printf "${CYAN}${BOLD}ma${RESET} — 멀티 에이전트 CLI 툴\n\n"
  printf "${BOLD}사용법:${RESET}\n"
  printf "  ma <command>\n\n"
  printf "${BOLD}명령어:${RESET}\n"
  printf "  ${GREEN}start${RESET}       tmux 세션 시작 및 모든 에이전트 실행\n"
  printf "  ${RED}stop${RESET}        tmux 세션 종료\n"
  printf "  ${CYAN}export${RESET}      opencode 세션 대화 기록 내보내기\n"
  printf "  ${YELLOW}pause${RESET}       에이전트 일시중단\n"
  printf "  ${GREEN}resume${RESET}      일시중단된 에이전트 재시작\n"
  printf "  ${CYAN}attach${RESET}      실행 중인 tmux 세션에 진입\n"
  printf "  ${CYAN}status${RESET}      세션 및 beads 태스크 상태 조회\n"
  printf "  ${DIM}logs${RESET}        오늘의 로그 파일 목록 출력\n"
  printf "  ${DIM}install${RESET}     'ma' 명령어를 시스템에 등록\n"
  printf "  ${DIM}uninstall${RESET}   등록된 'ma' 명령어를 안전하게 제거\n"
  printf "  ${DIM}help${RESET}        이 도움말 출력\n\n"
  printf "${BOLD}예시:${RESET}\n"
  printf "  ma start\n"
  printf "  ma export\n"
  printf "  ma stop\n"
  printf "  ma pause\n"
  printf "  ma resume\n"
}

# ── 세션 상태 확인 헬퍼 ──────────────────────────────────────────────────────
is_session_running() {
  tmux has-session -t "$SESSION_NAME" 2>/dev/null
}

# ── 명령어 처리 ──────────────────────────────────────────────────────────────
CMD="${1:-help}"

case "$CMD" in

  start)
    bash "$SCRIPT_DIR/start.sh"
    ;;

  stop)
    bash "$SCRIPT_DIR/stop.sh"
    ;;

  export)
    bash "$SCRIPT_DIR/export.sh" "${2:-}"
    ;;

  pause)
    bash "$SCRIPT_DIR/pause.sh"
    ;;

  resume)
    bash "$SCRIPT_DIR/resume.sh"
    ;;

  attach)
    if ! is_session_running; then
      printf "${RED}❌ 실행 중인 세션이 없습니다. 먼저 'ma start'를 실행하세요.${RESET}\n"
      exit 1
    fi
    tmux attach-session -t "$SESSION_NAME"
    ;;

  status)
    printf "${CYAN}${BOLD}── 세션 상태 ──────────────────────────────────────${RESET}\n"
    if is_session_running; then
      printf "  tmux 세션: ${GREEN}실행 중${RESET} (%s)\n" "$SESSION_NAME"
      printf "\n  ${DIM}창 목록:${RESET}\n"
      tmux list-windows -t "$SESSION_NAME" 2>/dev/null \
        | while IFS= read -r line; do printf "    %s\n" "$line"; done
    else
      printf "  tmux 세션: ${RED}중단됨${RESET}\n"
    fi

    # state.json 캐시에서 태스크 상태 읽기 (bd list 직접 호출 없음)
    CACHE_FILE="$PROJECT_ROOT/.multi-agent/cache/state.json"
    printf "\n${CYAN}${BOLD}── 태스크 현황 ─────────────────────────────────────${RESET}\n"
    if command -v jq >/dev/null 2>&1 && [ -f "$CACHE_FILE" ]; then
      jq -r '
        "  갱신: " + (.updated_at // "알 수 없음"),
        "  진행: " + (.summary.in_progress // 0 | tostring) +
        "  대기: " + (.summary.open        // 0 | tostring) +
        "  블록: " + (.summary.blocked     // 0 | tostring) +
        "  완료: " + (.summary.closed      // 0 | tostring),
        "",
        "  에이전트별:",
        (.agents // {} | to_entries[] |
          "    " + .key + ": " +
          "진행 " + (.value.in_progress // [] | length | tostring) +
          "  대기 " + (.value.open // [] | length | tostring) +
          "  블록 " + (.value.blocked // [] | length | tostring)
        )
      ' "$CACHE_FILE" 2>/dev/null \
        || printf "  ${DIM}(캐시 읽기 실패)${RESET}\n"
      printf "\n  ${DIM}(캐시 기반 — dispatcher가 매 순환마다 갱신)${RESET}\n"
    else
      printf "  ${DIM}(state.json 없음 — dispatcher를 먼저 시작하세요)${RESET}\n"
      printf "  ${DIM}캐시 경로: %s${RESET}\n" "$CACHE_FILE"
    fi
    ;;

  logs)
    TODAY=$(date +%Y-%m-%d)
    LOG_DIR="$PROJECT_ROOT/.multi-agent/logs/${TODAY}"
    if [ -d "$LOG_DIR" ]; then
      printf "${CYAN}${BOLD}── 오늘 로그 (%s) ───────────────────────────────${RESET}\n" "$TODAY"
      ls -lh "$LOG_DIR"/*.log 2>/dev/null \
        | awk '{print "  " $NF " (" $5 ")"}' \
        || printf "  ${DIM}(로그 없음)${RESET}\n"
    else
      printf "${YELLOW}⚠️  오늘 로그 디렉토리가 없습니다: %s${RESET}\n" "$LOG_DIR"
    fi
    ;;

  install)
    MA_SH="$SCRIPT_DIR/ma.sh"

    # 이미 설치된 경우 확인
    if [ -f "$INSTALL_RECORD" ]; then
      prev_method=$(grep '^method=' "$INSTALL_RECORD" | cut -d= -f2)
      prev_target=$(grep '^target=' "$INSTALL_RECORD" | cut -d= -f2)
      printf "${YELLOW}⚠️  이미 설치되어 있습니다.${RESET}\n"
      printf "   방식: %s\n   경로: %s\n" "$prev_method" "$prev_target"
      printf "   제거하려면: ma uninstall\n"
      exit 0
    fi

    printf "${CYAN}${BOLD}ma install${RESET} — 등록 방식을 선택하세요:\n\n"
    printf "  ${BOLD}1)${RESET} symlink  — /usr/local/bin/ma 에 심볼릭 링크 생성 ${DIM}(sudo 필요)${RESET}\n"
    printf "  ${BOLD}2)${RESET} alias    — ~/.zshrc 또는 ~/.bashrc 에 alias 추가 ${DIM}(sudo 불필요)${RESET}\n\n"
    printf "선택 [1/2]: "
    read -r choice

    case "$choice" in
      1)
        SYMLINK_PATH="/usr/local/bin/ma"
        # 이미 같은 링크가 있으면 덮어쓰기 확인
        if [ -e "$SYMLINK_PATH" ]; then
          printf "${YELLOW}⚠️  %s 이 이미 존재합니다. 덮어씁니까? [y/N]: ${RESET}" "$SYMLINK_PATH"
          read -r confirm
          [ "$confirm" != "y" ] && [ "$confirm" != "Y" ] && printf "취소되었습니다.\n" && exit 0
        fi
        if ln -sf "$MA_SH" "$SYMLINK_PATH" 2>/dev/null; then
          printf "method=symlink\ntarget=%s\n" "$SYMLINK_PATH" > "$INSTALL_RECORD"
          printf "${GREEN}✅ 심볼릭 링크 생성 완료: %s → %s${RESET}\n" "$SYMLINK_PATH" "$MA_SH"
          printf "   이제 어디서든 ${BOLD}ma${RESET} 명령어를 사용할 수 있습니다.\n"
        else
          printf "${YELLOW}⚠️  권한이 없습니다. sudo로 재시도합니다...${RESET}\n"
          if sudo ln -sf "$MA_SH" "$SYMLINK_PATH"; then
            printf "method=symlink\ntarget=%s\n" "$SYMLINK_PATH" > "$INSTALL_RECORD"
            printf "${GREEN}✅ 심볼릭 링크 생성 완료 (sudo): %s → %s${RESET}\n" "$SYMLINK_PATH" "$MA_SH"
          else
            printf "${RED}❌ 심볼릭 링크 생성 실패. 수동으로 실행하세요:${RESET}\n"
            printf "   sudo ln -sf \"%s\" \"%s\"\n" "$MA_SH" "$SYMLINK_PATH"
            exit 1
          fi
        fi
        ;;
      2)
        # 셸 판별: zsh 우선, 없으면 bash
        if [ -f "$HOME/.zshrc" ]; then
          RC_FILE="$HOME/.zshrc"
        elif [ -f "$HOME/.bashrc" ]; then
          RC_FILE="$HOME/.bashrc"
        else
          RC_FILE="$HOME/.zshrc"  # 없으면 .zshrc 생성
        fi

        ALIAS_LINE="alias ma='bash \"${MA_SH}\"'  # ma-cli"

        # 중복 추가 방지
        if grep -q '# ma-cli' "$RC_FILE" 2>/dev/null; then
          printf "${YELLOW}⚠️  %s 에 이미 alias가 등록되어 있습니다.${RESET}\n" "$RC_FILE"
          printf "   기존 항목: $(grep '# ma-cli' "$RC_FILE")\n"
          exit 0
        fi

        printf "\n%s\n" "$ALIAS_LINE" >> "$RC_FILE"
        printf "method=alias\ntarget=%s\n" "$RC_FILE" > "$INSTALL_RECORD"
        printf "${GREEN}✅ alias 등록 완료: %s${RESET}\n" "$RC_FILE"
        printf "   적용하려면: ${BOLD}source %s${RESET}\n" "$RC_FILE"
        ;;
      *)
        printf "${RED}❌ 잘못된 선택입니다.${RESET}\n"
        exit 1
        ;;
    esac
    ;;

  uninstall)
    if [ ! -f "$INSTALL_RECORD" ]; then
      printf "${YELLOW}⚠️  설치 기록이 없습니다. 이미 제거되었거나 수동으로 설치된 경우입니다.${RESET}\n"
      printf "\n수동으로 제거하려면:\n"
      printf "  symlink:  sudo rm /usr/local/bin/ma\n"
      printf "  alias:    ~/.zshrc 또는 ~/.bashrc 에서 '# ma-cli' 줄 삭제\n"
      exit 0
    fi

    method=$(grep '^method=' "$INSTALL_RECORD" | cut -d= -f2)
    target=$(grep '^target=' "$INSTALL_RECORD" | cut -d= -f2)

    printf "${CYAN}${BOLD}ma uninstall${RESET}\n"
    printf "  방식: ${BOLD}%s${RESET}\n  대상: %s\n\n" "$method" "$target"
    printf "정말 제거하겠습니까? [y/N]: "
    read -r confirm
    [ "$confirm" != "y" ] && [ "$confirm" != "Y" ] && printf "취소되었습니다.\n" && exit 0

    case "$method" in
      symlink)
        # ma.sh를 가리키는 심볼릭 링크인지 검증 후 삭제
        if [ -L "$target" ] && [ "$(readlink "$target")" = "$SCRIPT_DIR/ma.sh" ]; then
          if rm -f "$target" 2>/dev/null || sudo rm -f "$target"; then
            printf "${GREEN}✅ 심볼릭 링크 제거 완료: %s${RESET}\n" "$target"
          else
            printf "${RED}❌ 제거 실패: %s${RESET}\n" "$target"
            exit 1
          fi
        else
          printf "${RED}❌ %s 이 ma.sh를 가리키는 링크가 아닙니다. 수동으로 확인하세요.${RESET}\n" "$target"
          exit 1
        fi
        ;;
      alias)
        # rc 파일에서 '# ma-cli' 마커가 있는 줄만 정확히 삭제
        if grep -q '# ma-cli' "$target" 2>/dev/null; then
          # macOS sed는 -i '' 필요
          sed -i '' '/# ma-cli/d' "$target"
          printf "${GREEN}✅ alias 제거 완료: %s${RESET}\n" "$target"
          printf "   적용하려면: ${BOLD}source %s${RESET}\n" "$target"
        else
          printf "${YELLOW}⚠️  %s 에서 ma alias를 찾을 수 없습니다. 이미 제거되었을 수 있습니다.${RESET}\n" "$target"
        fi
        ;;
      *)
        printf "${RED}❌ 알 수 없는 설치 방식: %s${RESET}\n" "$method"
        exit 1
        ;;
    esac

    rm -f "$INSTALL_RECORD"
    printf "\n${DIM}설치 기록 삭제: %s${RESET}\n" "$INSTALL_RECORD"
    ;;

  help|--help|-h)
    usage
    ;;

  *)
    printf "${RED}❌ 알 수 없는 명령어: %s${RESET}\n\n" "$CMD"
    usage
    exit 1
    ;;

esac
