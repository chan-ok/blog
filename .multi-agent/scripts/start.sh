#!/bin/bash
# tmux 기반 멀티 에이전트 시스템 시작 스크립트 (v4.9.0)
#
# Window 구조:
#   Window 0 (monitor)     : 5-pane 모니터링 대시보드 — 좌우 2분할
#                            좌: Overview (전체 높이, 60%)
#                            우: Task-Manager / Spec-Manager / Worker-1 / Worker-2 (40%)
#   Window 1 (consultant)  : opencode TUI — 사용자가 직접 대화하는 창
#   Window 2 (task-manager): bash 대기 — dispatcher가 opencode run 트리거
#   Window 3 (spec-manager): bash 대기 — dispatcher가 opencode run 트리거
#   Window 4 (worker-1)    : bash 대기 — dispatcher가 opencode run 트리거
#   Window 5 (worker-2)    : bash 대기 — dispatcher가 opencode run 트리거
#   Window 6 (dispatcher)  : 중앙 beads 폴러 — idle 에이전트 자동 트리거
#
# 변경 내역 (v4.9.0):
#   - runner.sh 4개 인스턴스 → dispatcher.sh 단일 프로세스로 대체
#   - beads DB 동시 접근 충돌 근본 해결 (panic 방지)
#   - 에이전트 창(Window 2~5)은 bash 대기 상태로 시작
#   - Window 6 (dispatcher) 추가: 중앙 집중형 폴링 + 자동 트리거
#
# 변경 내역 (v4.8.0):
#   - 스크립트 위치 .multi-agent/scripts/ 로 이동
#   - 로그 날짜 폴더 구조 적용: logs/YYYY-MM-DD/<agent>-HHMMSS.log
#   - pipe-pane ANSI 이스케이프 실시간 제거 + UTF-8 인코딩 고정
#   - 시작 시 cleanup.sh 자동 호출 (1년 초과 파일 정리)
#
# 변경 내역 (v4.7.0):
#   - overview/에이전트 너비 비율 60/40 조정 (main-vertical 이후 resize)
#
# 변경 내역 (v4.6.0):
#   - worker-3 제거 (맥북 M1 13인치 메모리 제약)
#   - 레이아웃: main-vertical (좌측 Overview 60%, 우측 4-pane 균등)
#   - 깜빡임 없는 대시보드 갱신 (커서 홈 방식)

set -e

SESSION_NAME="multi-agent"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPTS_DIR="$PROJECT_ROOT/.multi-agent/scripts"
TODAY=$(date +%Y-%m-%d)
LOG_TS=$(date +%H%M%S)
LOG_DIR="$PROJECT_ROOT/.multi-agent/logs/${TODAY}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 사전 요구사항 확인 중..."

if ! command -v tmux &> /dev/null; then
  echo -e "${RED}❌ tmux가 설치되지 않았습니다.${NC}"
  echo "   설치: brew install tmux"
  exit 1
fi

if ! command -v opencode &> /dev/null; then
  echo -e "${RED}❌ opencode가 설치되지 않았습니다.${NC}"
  echo "   설치: https://opencode.ai"
  exit 1
fi

if [ ! -d "$PROJECT_ROOT/.multi-agent" ]; then
  echo -e "${RED}❌ .multi-agent 디렉토리가 없습니다.${NC}"
  echo "   생성: mkdir -p .multi-agent/{specs,queue,status,config,templates,scripts}"
  exit 1
fi

# 날짜별 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

echo -e "${GREEN}✅ 모든 사전 요구사항이 충족되었습니다.${NC}"

# ── 오래된 로그/큐 파일 정리 ──────────────────────────────────────────────────
echo "🧹 오래된 파일 정리 중..."
bash "$SCRIPTS_DIR/cleanup.sh" || true

# 기존 세션 종료
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
  echo -e "${YELLOW}⚠️  기존 세션 '$SESSION_NAME'을 종료합니다.${NC}"
  tmux kill-session -t $SESSION_NAME
fi

echo "🚀 tmux 세션 생성 중..."
date +%s > /tmp/multi-agent-session-start

# ── ANSI 제거 + UTF-8 고정 pipe 명령 ──────────────────────────────────────────
# sed: ANSI CSI 시퀀스([...m 등) + ESC 단독 시퀀스 제거
# tr: \r 및 남은 ESC(0x1b) 제거
# iconv: 유효하지 않은 바이트 제거하여 UTF-8 강제 변환
STRIP_CMD="sed $'s/\033\\\\[[0-9;?]*[a-zA-Z]//g' | sed $'s/\033[^\\\\[]//g' | tr -d $'\\r\033' | iconv -f UTF-8 -t UTF-8 -c"

# ── Window 0: monitor ──────────────────────────────────────────────────────────
# 5-pane 대시보드: 좌우 2분할 레이아웃 (13인치 맥북 최적화)
#
# 레이아웃 (main-vertical):
#   ┌──────────────────────────────┬─────────────────────┐
#   │                              │  pane1 Task-Mgr     │
#   │                              ├─────────────────────┤
#   │   pane0 Overview             │  pane2 Spec-Mgr     │
#   │      (좌 60%)                ├─────────────────────┤
#   │                              │  pane3 Worker-1     │
#   │                              ├─────────────────────┤
#   │                              │  pane4 Worker-2     │
#   └──────────────────────────────┴─────────────────────┘
#
tmux new-session -d -s $SESSION_NAME -n "monitor" -c "$PROJECT_ROOT"

# pane0(좌 Overview) / pane1(우열 시작) — 수평 분할 (우측 40%)
tmux split-window -h -p 40 -t "${SESSION_NAME}:monitor.0" -c "$PROJECT_ROOT"

# 우열: pane1 → 수직 3회 분할 → 4개 균등 pane
tmux split-window -v -t "${SESSION_NAME}:monitor.1" -c "$PROJECT_ROOT"  # pane2
tmux split-window -v -t "${SESSION_NAME}:monitor.2" -c "$PROJECT_ROOT"  # pane3
tmux split-window -v -t "${SESSION_NAME}:monitor.3" -c "$PROJECT_ROOT"  # pane4

# main-vertical: pane0가 왼쪽 전체, 나머지가 오른쪽 균등 분할
tmux select-layout -t "${SESSION_NAME}:monitor" main-vertical

# overview 60% / 에이전트 40% 비율 명시적 적용
_TOTAL_W=$(tput cols 2>/dev/null || echo 220)
_OV_W=$(( _TOTAL_W * 60 / 100 ))
tmux resize-pane -t "${SESSION_NAME}:monitor.0" -x "$_OV_W"

# 각 pane에 대시보드 실행
# monitor.0 (Overview): 모든 window 생성 후 마지막에 실행 (아래로 이동)
tmux send-keys -t "${SESSION_NAME}:monitor.1" \
  "bash $SCRIPTS_DIR/dashboard.sh task-manager" C-m
tmux send-keys -t "${SESSION_NAME}:monitor.2" \
  "bash $SCRIPTS_DIR/dashboard.sh spec-manager" C-m
tmux send-keys -t "${SESSION_NAME}:monitor.3" \
  "bash $SCRIPTS_DIR/dashboard.sh worker-1" C-m
tmux send-keys -t "${SESSION_NAME}:monitor.4" \
  "bash $SCRIPTS_DIR/dashboard.sh worker-2" C-m

tmux select-pane -t "${SESSION_NAME}:monitor.0" -T "Overview"
tmux select-pane -t "${SESSION_NAME}:monitor.1" -T "Task-Manager"
tmux select-pane -t "${SESSION_NAME}:monitor.2" -T "Spec-Manager"
tmux select-pane -t "${SESSION_NAME}:monitor.3" -T "Worker-1"
tmux select-pane -t "${SESSION_NAME}:monitor.4" -T "Worker-2"

# ── Window 1: consultant ───────────────────────────────────────────────────────
# opencode TUI — 사용자가 직접 대화하는 창
tmux new-window -t "${SESSION_NAME}" -n "consultant" -c "$PROJECT_ROOT"
tmux send-keys -t "${SESSION_NAME}:consultant" \
  "opencode --agent consultant" C-m

# 실시간 로그 저장: ANSI 제거 + UTF-8 고정
tmux pipe-pane -t "${SESSION_NAME}:consultant" \
  "eval \"$STRIP_CMD\" >> '$LOG_DIR/consultant-${LOG_TS}.log'"

# ── Window 2~5: 에이전트 창 (opencode interactive 상시 실행) ──────────────────
# dispatcher.sh가 tmux send-keys로 프롬프트 텍스트를 opencode interactive에 전달합니다.
# 각 창에 opencode --agent <이름> 을 자동 실행하여 interactive 세션을 유지합니다.
#
# 주의: tmux 윈도우 이름(agent)과 opencode --agent 이름(oc_agent)은 다를 수 있습니다.
#   - worker-1, worker-2: tmux 윈도우 이름 (bd --assignee 식별자)
#   - worker            : opencode agent 이름 (AGENTS.md 등록 이름)

# 형식: "tmux윈도우이름:opencode에이전트이름"
AGENT_MAPPINGS=(
  "task-manager:task-manager"
  "spec-manager:spec-manager"
  "worker-1:worker"
  "worker-2:worker"
)

for mapping in "${AGENT_MAPPINGS[@]}"; do
  agent="${mapping%%:*}"
  oc_agent="${mapping##*:}"

  tmux new-window -t "${SESSION_NAME}" -n "$agent" -c "$PROJECT_ROOT"

  # opencode interactive 세션 자동 시작 (oc_agent: 실제 opencode 에이전트 이름)
  tmux send-keys -t "${SESSION_NAME}:${agent}" \
    "opencode --agent ${oc_agent}" C-m

  # 실시간 로그 저장: ANSI 제거 + UTF-8 고정
  tmux pipe-pane -t "${SESSION_NAME}:${agent}" \
    "eval \"$STRIP_CMD\" >> '$LOG_DIR/${agent}-${LOG_TS}.log'"
done

# ── Window 6: dispatcher ───────────────────────────────────────────────────────
# 중앙 집중형 beads 폴러: 에이전트 idle 감지 후 자동으로 opencode run 트리거
tmux new-window -t "${SESSION_NAME}" -n "dispatcher" -c "$PROJECT_ROOT"
tmux send-keys -t "${SESSION_NAME}:dispatcher" \
  "bash $SCRIPTS_DIR/dispatcher.sh" C-m
tmux pipe-pane -t "${SESSION_NAME}:dispatcher" \
  "eval \"$STRIP_CMD\" >> '$LOG_DIR/dispatcher-${LOG_TS}.log'"

# ── Window 0 (monitor)로 포커스 ───────────────────────────────────────────────
tmux select-window -t "${SESSION_NAME}:monitor"

# overview는 모든 window 생성 완료 후 마지막에 실행
# pane.0의 zsh가 완전히 초기화될 때까지 대기 (프롬프트가 나타날 때까지 폴링)
_wait_for_prompt() {
  local target="$1"
  local tries=0
  while [ $tries -lt 20 ]; do
    # capture-pane에서 프롬프트 문자(❯ 또는 $ 또는 %)가 보이면 준비 완료
    local out
    out=$(tmux capture-pane -t "$target" -p 2>/dev/null || true)
    if printf "%s" "$out" | grep -qE '[$%❯#]\s*$'; then
      return 0
    fi
    sleep 0.3
    tries=$(( tries + 1 ))
  done
  # 타임아웃: 그냥 진행
  return 0
}
_wait_for_prompt "${SESSION_NAME}:monitor.0"
tmux send-keys -t "${SESSION_NAME}:monitor.0" \
  "bash $SCRIPTS_DIR/dashboard.sh overview" C-m

echo -e "${GREEN}✅ tmux 세션이 생성되었습니다!${NC}"
echo ""
echo "📌 Window 구조:"
echo "   0 monitor      ← 좌: Overview | 우: Task-Manager / Spec-Manager / Worker-1 / Worker-2"
echo "   1 consultant   ← 사용자 대화 (opencode TUI)"
echo "   2 task-manager ← bash 대기 (dispatcher가 자동 트리거)"
echo "   3 spec-manager ← bash 대기 (dispatcher가 자동 트리거)"
echo "   4 worker-1     ← bash 대기 (dispatcher가 자동 트리거)"
echo "   5 worker-2     ← bash 대기 (dispatcher가 자동 트리거)"
echo "   6 dispatcher   ← 중앙 beads 폴러 (자동 실행 중)"
echo ""
echo "📝 오늘 로그 저장 위치: .multi-agent/logs/${TODAY}/"
echo ""
echo "💡 Window 전환: Ctrl-b 0~6  또는  Ctrl-b w (목록)"
echo "   세션 detach:   Ctrl-b d"
echo "   세션 재접속:   tmux attach-session -t multi-agent"
echo "   세션 종료:     bash .multi-agent/scripts/stop.sh"
echo ""

tmux attach-session -t $SESSION_NAME
