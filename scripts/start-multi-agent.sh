#!/bin/bash
# tmux 기반 멀티 에이전트 시스템 시작 스크립트
# 6개 pane에 에이전트를 배치합니다.

SESSION_NAME="multi-agent"
PROJECT_ROOT="/Users/chanhokim/myFiles/0_Project/blog"

# 기존 세션 종료
tmux kill-session -t $SESSION_NAME 2>/dev/null

# 새 세션 생성 (Pane 0: 컨설턴트)
tmux new-session -d -s $SESSION_NAME -c $PROJECT_ROOT

# Pane 1, 2: 작업관리자, 명세서관리자 (수평 분할)
tmux split-window -h -t $SESSION_NAME:0 -c $PROJECT_ROOT
tmux select-pane -t 0
tmux split-window -v -t $SESSION_NAME:0.0 -c $PROJECT_ROOT

# Pane 3, 4, 5: 작업자 (3분할)
tmux select-pane -t 2
tmux split-window -v -t $SESSION_NAME:0.2 -c $PROJECT_ROOT
tmux select-pane -t 2
tmux split-window -h -t $SESSION_NAME:0.2 -c $PROJECT_ROOT
tmux select-pane -t 3
tmux split-window -h -t $SESSION_NAME:0.3 -c $PROJECT_ROOT

# 레이아웃 조정
tmux select-layout -t $SESSION_NAME:0 main-horizontal

# 각 pane에 레이블 설정
tmux select-pane -t 0 -T "Consultant"
tmux select-pane -t 1 -T "TaskManager"
tmux select-pane -t 2 -T "SpecManager"
tmux select-pane -t 3 -T "Worker-1"
tmux select-pane -t 4 -T "Worker-2"
tmux select-pane -t 5 -T "Worker-3"

# opencode 실행 (각 pane에서)
tmux send-keys -t 0 "opencode --agent consultant" C-m
tmux send-keys -t 1 "opencode --agent task-manager" C-m
tmux send-keys -t 2 "opencode --agent spec-manager" C-m
# Worker는 필요 시 수동 시작

# 세션 연결
tmux attach-session -t $SESSION_NAME
