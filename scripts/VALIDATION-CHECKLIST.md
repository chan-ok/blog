# Phase 2 검증 체크리스트

> **목적**: tmux 스크립트와 watchman 트리거 동작 검증 결과 기록

## 📋 Phase 2-1: tmux 스크립트 검증 (blog-93f)

### 환경 확인

- [ ] tmux 버전: `tmux -V` → _____
- [ ] watchman 설치: `watchman version` → _____
- [ ] beads 설치: `bd --version` → _____
- [ ] opencode 설치: `which opencode` → _____

### 스크립트 구조 검증

**파일 존재 확인**:
- [x] `scripts/start-multi-agent.sh` (실행 권한: rwxr-xr-x)
- [x] `scripts/setup-watchman.sh` (실행 권한: rwxr-xr-x)
- [x] `scripts/README.md` (사용 가이드)
- [x] `scripts/PHASE2-TEST-GUIDE.md` (테스트 가이드)

**opencode.json 에이전트 정의**:
- [x] `consultant` (line 696-743)
- [x] `task-manager` (line 745-791)
- [x] `spec-manager` (line 794-840)
- [x] `worker` (line 843-889)

**에이전트 프롬프트 파일**:
- [x] `.agents/agents/consultant.md` (393줄)
- [x] `.agents/agents/task-manager.md` (542줄)
- [x] `.agents/agents/spec-manager.md` (485줄)
- [x] `.agents/agents/worker.md` (557줄)

**디렉토리 구조**:
- [x] `.multi-agent/specs/` (명세서 저장)
- [x] `.multi-agent/queue/` (메시지 큐)
- [x] `.multi-agent/status/` (에이전트 상태)
- [x] `.multi-agent/config/` (agents.yaml, validation-checklist.yaml)
- [x] `.multi-agent/templates/` (spec-template.yaml)

### 실행 테스트 (수동)

**1. tmux 세션 생성**:
```bash
bash scripts/start-multi-agent.sh
```
- [ ] 세션 "multi-agent" 생성됨
- [ ] 6개 pane 생성됨
- [ ] Pane 레이블 표시됨 (Consultant, TaskManager, SpecManager, Worker-1, Worker-2, Worker-3)

**2. opencode 실행 (현재 동작)**:
```bash
# Pane 0: opencode --agent consultant
# Pane 1: opencode --agent task-manager
# Pane 2: opencode --agent spec-manager
```
- [ ] Pane 0에서 opencode 실행 시도됨
- [ ] Pane 1에서 opencode 실행 시도됨
- [ ] Pane 2에서 opencode 실행 시도됨

**주의**: `opencode --agent` 옵션이 실제로 지원되는지 확인 필요

**3. Pane 레이아웃**:
- [ ] Pane 0: 상단 전체 (컨설턴트)
- [ ] Pane 1: 중간 좌측 (작업관리자)
- [ ] Pane 2: 중간 우측 (명세서관리자)
- [ ] Pane 3, 4, 5: 하단 3분할 (작업자)

**4. Pane 간 이동**:
- [ ] `Ctrl-b 0` → Pane 0 이동
- [ ] `Ctrl-b 1` → Pane 1 이동
- [ ] `Ctrl-b 2` → Pane 2 이동
- [ ] `Ctrl-b 5` → Pane 5 이동

**5. 세션 종료**:
- [ ] `Ctrl-b d` → detach 성공
- [ ] `tmux attach -t multi-agent` → 재연결 성공
- [ ] `tmux kill-session -t multi-agent` → 종료 성공

### 개선 필요 사항

#### Issue 1: opencode CLI 옵션 확인

**현재 코드** (`scripts/start-multi-agent.sh:39-42`):
```bash
tmux send-keys -t 0 "opencode --agent consultant" C-m
tmux send-keys -t 1 "opencode --agent task-manager" C-m
tmux send-keys -t 2 "opencode --agent spec-manager" C-m
```

**확인 필요**:
- [ ] `opencode --agent <name>` 옵션이 실제로 지원되는가?
- [ ] opencode 실행 시 에이전트를 자동으로 선택할 수 있는가?

**대안**:
1. **옵션 1**: 주석 처리하고 수동 실행
   ```bash
   # tmux send-keys -t 0 "opencode --agent consultant" C-m
   # 각 pane에서 수동으로 opencode 실행 후 에이전트 선택
   ```

2. **옵션 2**: opencode 설정 파일 활용
   ```bash
   # Pane 0에서
   tmux send-keys -t 0 "cd .multi-agent && opencode" C-m
   # .multi-agent/.opencode.json에 기본 에이전트 지정
   ```

3. **옵션 3**: 환경변수 활용 (opencode가 지원하는 경우)
   ```bash
   tmux send-keys -t 0 "OPENCODE_AGENT=consultant opencode" C-m
   ```

#### Issue 2: PROJECT_ROOT 하드코딩

**현재 코드** (`scripts/start-multi-agent.sh:6`):
```bash
PROJECT_ROOT="/Users/chanhokim/myFiles/0_Project/blog"
```

**개선**:
```bash
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
```

#### Issue 3: 에러 처리 부족

**개선 필요**:
- [ ] tmux 설치 여부 확인
- [ ] opencode 설치 여부 확인
- [ ] 디렉토리 존재 여부 확인

**개선 코드**:
```bash
# 사전 요구사항 확인
if ! command -v tmux &> /dev/null; then
  echo "❌ tmux가 설치되지 않았습니다. brew install tmux"
  exit 1
fi

if ! command -v opencode &> /dev/null; then
  echo "❌ opencode가 설치되지 않았습니다."
  exit 1
fi

# 디렉토리 확인
if [ ! -d "$PROJECT_ROOT/.multi-agent" ]; then
  echo "❌ .multi-agent 디렉토리가 없습니다."
  exit 1
fi
```

---

## 📋 Phase 2-2: watchman 트리거 검증 (blog-aal)

### 스크립트 구조 검증

**트리거 정의** (`scripts/setup-watchman.sh`):
- [x] `spec-changed` — *.yaml 파일 감지 (line 9-10)
- [x] `task-mgr-msg` — task-manager-*.json (line 16-17)
- [x] `spec-mgr-msg` — spec-manager-*.json (line 20-21)
- [x] `consultant-msg` — consultant-*.json (line 24-25)
- [x] `worker-1-msg` — worker-1-*.json (line 28-29)
- [x] `worker-2-msg` — worker-2-*.json (line 31-32)
- [x] `worker-3-msg` — worker-3-*.json (line 34-35)

### 실행 테스트 (수동)

**1. watchman 설정**:
```bash
bash scripts/setup-watchman.sh
```
- [ ] "Watchman triggers configured successfully" 출력됨

**2. watch 목록 확인**:
```bash
watchman watch-list
```
- [ ] `.multi-agent/specs` 감시 중
- [ ] `.multi-agent/queue` 감시 중

**3. 트리거 목록 확인**:
```bash
watchman trigger-list /Users/chanhokim/myFiles/0_Project/blog/.multi-agent/specs
watchman trigger-list /Users/chanhokim/myFiles/0_Project/blog/.multi-agent/queue
```
- [ ] `spec-changed` 트리거 등록됨
- [ ] `task-mgr-msg` 트리거 등록됨
- [ ] `spec-mgr-msg` 트리거 등록됨
- [ ] `consultant-msg` 트리거 등록됨
- [ ] `worker-1-msg` 트리거 등록됨
- [ ] `worker-2-msg` 트리거 등록됨
- [ ] `worker-3-msg` 트리거 등록됨

**4. 트리거 동작 테스트**:

**테스트 1: spec 파일 변경**:
```bash
# tmux 세션 시작
bash scripts/start-multi-agent.sh

# Pane 2 (SpecManager) 관찰
# 새 터미널에서:
touch .multi-agent/specs/test-spec.yaml
```
- [ ] Pane 2에 "Spec changed" 메시지 표시됨

**테스트 2: task-manager 메시지**:
```bash
touch .multi-agent/queue/task-manager-test.json
```
- [ ] Pane 1에 "New task-manager message" 표시됨

**테스트 3: worker 메시지**:
```bash
touch .multi-agent/queue/worker-1-test.json
```
- [ ] Pane 3에 "New worker-1 message" 표시됨

### 개선 필요 사항

#### Issue 1: PROJECT_ROOT 하드코딩

**현재 코드** (`scripts/setup-watchman.sh:5`):
```bash
PROJECT_ROOT="/Users/chanhokim/myFiles/0_Project/blog"
```

**개선**:
```bash
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
```

#### Issue 2: 에러 처리 부족

**개선 필요**:
- [ ] watchman 설치 여부 확인
- [ ] tmux 세션 존재 여부 확인
- [ ] 디렉토리 존재 여부 확인

**개선 코드**:
```bash
# 사전 요구사항 확인
if ! command -v watchman &> /dev/null; then
  echo "❌ watchman이 설치되지 않았습니다. brew install watchman"
  exit 1
fi

# tmux 세션 확인
if ! tmux has-session -t multi-agent 2>/dev/null; then
  echo "⚠️  tmux 세션 'multi-agent'가 없습니다."
  echo "먼저 ./scripts/start-multi-agent.sh를 실행하세요."
  exit 1
fi

# 디렉토리 확인
if [ ! -d "$PROJECT_ROOT/.multi-agent/specs" ]; then
  echo "❌ .multi-agent/specs 디렉토리가 없습니다."
  exit 1
fi
```

#### Issue 3: 트리거 중복 등록 방지

**개선**:
```bash
# 기존 트리거 삭제
watchman trigger-del "$PROJECT_ROOT/.multi-agent/specs" spec-changed 2>/dev/null || true
watchman trigger-del "$PROJECT_ROOT/.multi-agent/queue" task-mgr-msg 2>/dev/null || true
# ... (나머지 트리거도 동일)

# 새 트리거 등록
watchman -- trigger "$PROJECT_ROOT/.multi-agent/specs" spec-changed '*.yaml' -- \
  bash -c 'echo "Spec changed" | tmux send-keys -t multi-agent:0.2 C-m'
```

---

## 📋 Phase 2-3: 통합 테스트 (blog-27s)

> **Note**: Phase 2-1, 2-2 완료 후 진행

### 테스트 시나리오

**목표**: consultant → spec-manager → task-manager → worker 전체 플로우 검증

**입력 요구사항**:
```
"src/shared/lib/utils/에 숫자 포맷팅 함수를 추가해줘.
- 함수명: formatNumber
- 입력: number, locale (기본값: 'ko-KR')
- 출력: 천 단위 콤마로 구분된 문자열
- 예시: formatNumber(1234567) → '1,234,567'
"
```

### 실행 단계

**1. 시스템 시작**:
```bash
bash scripts/start-multi-agent.sh
# 다른 터미널에서
bash scripts/setup-watchman.sh
```

**2. Consultant (Pane 0) - 명세서 초안 작성**:
- [ ] 요구사항 입력
- [ ] `.multi-agent/specs/format-number-{timestamp}.yaml` 생성됨
- [ ] watchman이 Pane 2에 알림

**3. SpecManager (Pane 2) - 명세서 검증**:
- [ ] spec 파일 읽기
- [ ] FSD 아키텍처 준수 확인 (`src/shared/lib/utils/`)
- [ ] 테스트 요구사항 포함 확인
- [ ] `.multi-agent/queue/task-manager-{timestamp}.json` 생성

**4. TaskManager (Pane 1) - 태스크 분해**:
- [ ] queue 메시지 수신
- [ ] beads issue 생성:
  ```bash
  bd create "formatNumber 함수 구현" --priority P0
  bd create "formatNumber 함수 테스트 작성" --priority P0
  ```
- [ ] `.multi-agent/queue/worker-1-{timestamp}.json` 생성

**5. Worker-1 (Pane 3) - 코드 구현**:
- [ ] queue 메시지 수신
- [ ] `src/shared/lib/utils/formatNumber.ts` 생성
- [ ] Git commit
- [ ] beads issue close: `bd close {issue-id}`

**6. 검증**:
```bash
# 생성된 파일 확인
ls -la src/shared/lib/utils/formatNumber.ts

# Git 로그
git log --oneline -1

# beads 상태
bd list
```

### 성공 기준

- [ ] Consultant가 명세서 생성
- [ ] SpecManager가 검증 완료
- [ ] TaskManager가 beads issue 생성
- [ ] Worker가 실제 코드 생성
- [ ] Git commit 성공
- [ ] beads issue 닫힘
- [ ] 전체 플로우 5분 이내 완료

### 실패 시 디버깅

**Consultant → SpecManager 실패**:
- [ ] `.multi-agent/specs/*.yaml` 파일 생성 확인
- [ ] watchman 트리거 동작 확인: `watchman trigger-list`
- [ ] Pane 2에서 로그 확인

**SpecManager → TaskManager 실패**:
- [ ] `.multi-agent/queue/task-manager-*.json` 생성 확인
- [ ] watchman 트리거 동작 확인
- [ ] Pane 1에서 로그 확인

**TaskManager → Worker 실패**:
- [ ] `bd list` → beads issue 생성 확인
- [ ] `.multi-agent/queue/worker-*.json` 생성 확인
- [ ] Pane 3에서 로그 확인

---

## ✅ Phase 2 최종 검증 결과

### 완료 여부

- [ ] Phase 2-1 (blog-93f): tmux 스크립트 동작 ✅ / ❌
- [ ] Phase 2-2 (blog-aal): watchman 트리거 동작 ✅ / ❌
- [ ] Phase 2-3 (blog-27s): 통합 테스트 성공 ✅ / ❌

### 발견된 문제점

1. **opencode --agent 옵션**:
   - 상태: [ ] 지원됨 / [ ] 지원 안 됨
   - 해결: _____

2. **PROJECT_ROOT 하드코딩**:
   - 상태: [ ] 수정 필요
   - 해결: _____

3. **에러 처리 부족**:
   - 상태: [ ] 개선 필요
   - 해결: _____

4. **기타**:
   - _____

### 스크립트 개선 사항

- [ ] `PROJECT_ROOT` 동적 계산
- [ ] 사전 요구사항 확인 추가
- [ ] 에러 메시지 개선
- [ ] 트리거 중복 등록 방지
- [ ] opencode CLI 옵션 수정

### 다음 단계

- [ ] 스크립트 개선 PR 생성
- [ ] 문서 업데이트 (PHASE2-TEST-GUIDE.md)
- [ ] Phase 3 계획 (v3 완전 대체)
