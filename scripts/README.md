# 멀티 에이전트 스크립트

이 디렉토리에는 tmux 기반 멀티 에이전트 시스템을 실행하기 위한 스크립트가 포함되어 있습니다.

## start-multi-agent.sh

tmux 세션을 시작하고 6개 pane에 에이전트를 배치합니다.

### 레이아웃

```
┌──────────────────────────────────────────────────┐
│  Pane 0: 컨설턴트 (opencode)                      │
│  — 사람과 대면, 요구사항 수집 및 최종 보고        │
├─────────────────────┬────────────────────────────┤
│  Pane 1: 작업관리자  │  Pane 2: 명세서관리자      │
│  (opencode)         │  (opencode)                │
│  — beads 태스크 관리│  — spec 파일 검증          │
├───────┬─────────────┼────────────────────────────┤
│  W1   │  W2         │  W3                        │
│(open) │  (opencode) │  (opencode)                │
│코드   │  테스트     │  리팩토링                  │
└───────┴─────────────┴────────────────────────────┘
```

### 실행

```bash
./scripts/start-multi-agent.sh
```

### 종료

tmux 세션 내에서:
- `Ctrl-b d` — 세션 detach (백그라운드 유지)
- `tmux kill-session -t multi-agent` — 세션 완전 종료

## setup-watchman.sh

watchman 트리거를 설정하여 파일 변경을 감지합니다.

### 감시 대상

- `.multi-agent/specs/*.yaml` — 명세서 파일 변경
- `.multi-agent/queue/{agent}-*.json` — 에이전트별 메시지

### 실행

```bash
./scripts/setup-watchman.sh
```

### 트리거 확인

```bash
# 설정된 watch 목록
watchman watch-list

# 특정 디렉토리의 트리거 목록
watchman trigger-list /Users/chanhokim/myFiles/0_Project/blog/.multi-agent/queue
```

### 트리거 삭제

```bash
watchman trigger-del /path/to/watch trigger-name
```

## 사전 요구사항

### macOS

```bash
# tmux 설치
brew install tmux

# watchman 설치
brew install watchman

# beads 설치
cargo install beads
# 또는
brew tap jamsocket/beads
brew install beads
```

### Linux (Ubuntu/Debian)

```bash
# tmux 설치
sudo apt install tmux

# watchman 설치 (공식 빌드 사용 권장)
# https://facebook.github.io/watchman/docs/install.html

# beads 설치
cargo install beads
```

## 사용 예시

```bash
# 1. 프로젝트 루트에서 beads 초기화 (최초 1회)
bd init

# 2. 멀티 에이전트 디렉토리 생성 (최초 1회)
mkdir -p .multi-agent/{specs,queue,status}
mkdir -p .multi-agent/specs/archive
mkdir -p .multi-agent/queue/processed

# 3. tmux 세션 시작
./scripts/start-multi-agent.sh

# 4. watchman 트리거 설정 (다른 터미널에서)
./scripts/setup-watchman.sh

# 5. Pane 0 (컨설턴트)에 요구사항 입력
# "다크 모드를 지원하는 태그 필터 컴포넌트를 만들어줘"
```

## 트러블슈팅

### tmux 세션이 시작되지 않음

```bash
# tmux 버전 확인 (3.0 이상 권장)
tmux -V

# 기존 세션 강제 종료
tmux kill-server

# 재시작
./scripts/start-multi-agent.sh
```

### watchman 트리거가 동작하지 않음

```bash
# watchman 상태 확인
watchman watch-list

# watchman 재시작
watchman shutdown-server
./scripts/setup-watchman.sh

# 로그 확인
watchman --log-level=2
```

### opencode 명령어가 실행되지 않음

스크립트의 `opencode --agent` 명령어는 예시입니다. 실제 opencode CLI 옵션에 맞게 수정하세요.

```bash
# 현재 스크립트 (예시)
tmux send-keys -t 0 "opencode --agent consultant" C-m

# 실제 명령어로 변경 필요 (예시)
# tmux send-keys -t 0 "opencode" C-m
```

## 참고 문서

- [tmux 기반 멀티 에이전트 시스템 아키텍처](../docs/architecture/multi-agent-system.md)
- [beads 공식 문서](https://github.com/jamsocket/beads)
- [watchman 공식 문서](https://facebook.github.io/watchman/)
- [tmux 공식 문서](https://github.com/tmux/tmux/wiki)
