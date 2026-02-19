# Phase 2 테스트 가이드

> **목적**: tmux 스크립트와 watchman 트리거의 실제 동작 검증

## 📋 테스트 체크리스트

### Phase 2-1: tmux 스크립트 테스트 (blog-93f)

#### 사전 요구사항 확인

```bash
# tmux 설치 확인
tmux -V
# 예상 출력: tmux 3.x 이상

# watchman 설치 확인
watchman version
# 예상 출력: watchman version 정보

# beads 설치 확인
bd --version
# 예상 출력: beads version 정보
```

#### 1. tmux 세션 시작

```bash
# 프로젝트 루트에서 실행
bash scripts/start-multi-agent.sh
```

**예상 결과**:
- ✅ tmux 세션 "multi-agent" 생성
- ✅ 6개 pane 생성 (레이아웃 확인)
- ✅ 각 pane에 레이블 표시 (Consultant, TaskManager, SpecManager, Worker-1, Worker-2, Worker-3)
- ✅ Pane 0, 1, 2에서 opencode 자동 실행 시도

**확인 명령어** (tmux 세션 내에서):
```bash
# Pane 목록 확인
Ctrl-b w  # 윈도우/pane 목록 표시

# Pane 간 이동
Ctrl-b 0  # Pane 0으로 이동
Ctrl-b 1  # Pane 1으로 이동
...
Ctrl-b 5  # Pane 5로 이동
```

#### 2. 레이아웃 검증

**체크 항목**:
- [ ] Pane 0: 상단 전체 (컨설턴트)
- [ ] Pane 1: 중간 좌측 (작업관리자)
- [ ] Pane 2: 중간 우측 (명세서관리자)
- [ ] Pane 3, 4, 5: 하단 3분할 (작업자)

**수동 레이아웃 조정** (필요 시):
```bash
Ctrl-b Alt-1  # Even horizontal
Ctrl-b Alt-2  # Even vertical
Ctrl-b Space  # Cycle layouts
```

#### 3. opencode 실행 확인

**현재 스크립트 동작**:
```bash
# Pane 0
opencode --agent consultant

# Pane 1
opencode --agent task-manager

# Pane 2
opencode --agent spec-manager
```

**주의**: `opencode --agent` 옵션은 현재 opencode CLI에서 지원하지 않을 수 있습니다.

**대체 방법** (각 pane에서 수동 실행):
```bash
# Pane 0에서
opencode

# 프롬프트 창에서 에이전트 선택
# consultant 선택
```

#### 4. 세션 종료

```bash
# 세션 detach (백그라운드 유지)
Ctrl-b d

# 세션 완전 종료
tmux kill-session -t multi-agent

# 또는 (세션 외부에서)
bash
tmux kill-session -t multi-agent
```

---

### Phase 2-2: watchman 트리거 검증 (blog-aal)

#### 1. watchman 트리거 설정

```bash
# 새 터미널 창 열기 (tmux 세션 외부)
bash scripts/setup-watchman.sh
```

**예상 출력**:
```
Watchman triggers configured successfully
```

#### 2. 트리거 목록 확인

```bash
# watch 목록
watchman watch-list

# 예상 출력 예시:
# {
#   "roots": [
#     "/Users/chanhokim/myFiles/0_Project/blog/.multi-agent/specs",
#     "/Users/chanhokim/myFiles/0_Project/blog/.multi-agent/queue"
#   ]
# }

# specs 디렉토리 트리거 목록
watchman trigger-list /Users/chanhokim/myFiles/0_Project/blog/.multi-agent/specs

# queue 디렉토리 트리거 목록
watchman trigger-list /Users/chanhokim/myFiles/0_Project/blog/.multi-agent/queue
```

**예상 트리거**:
- `spec-changed` — *.yaml 파일 변경 감지
- `task-mgr-msg` — task-manager-*.json 파일 감지
- `spec-mgr-msg` — spec-manager-*.json 파일 감지
- `consultant-msg` — consultant-*.json 파일 감지
- `worker-1-msg` — worker-1-*.json 파일 감지
- `worker-2-msg` — worker-2-*.json 파일 감지
- `worker-3-msg` — worker-3-*.json 파일 감지

#### 3. 트리거 동작 테스트

**테스트 시나리오 1: spec 파일 변경**

```bash
# 1. tmux 세션 시작 (다른 터미널)
bash scripts/start-multi-agent.sh

# 2. Pane 2 (명세서관리자) 관찰

# 3. 테스트 파일 생성 (새 터미널)
touch .multi-agent/specs/test-spec.yaml

# 4. Pane 2에서 "Spec changed" 메시지 확인
```

**테스트 시나리오 2: queue 메시지 파일**

```bash
# 1. Pane 1 (작업관리자) 관찰

# 2. 테스트 파일 생성
touch .multi-agent/queue/task-manager-test.json

# 3. Pane 1에서 "New task-manager message" 메시지 확인
```

**테스트 시나리오 3: 작업자 메시지**

```bash
# 1. Pane 3 (Worker-1) 관찰

# 2. 테스트 파일 생성
touch .multi-agent/queue/worker-1-test.json

# 3. Pane 3에서 "New worker-1 message" 메시지 확인
```

#### 4. 트리거 삭제 (테스트 완료 후)

```bash
# 모든 트리거 삭제
watchman trigger-del /Users/chanhokim/myFiles/0_Project/blog/.multi-agent/specs spec-changed
watchman trigger-del /Users/chanhokim/myFiles/0_Project/blog/.multi-agent/queue task-mgr-msg
watchman trigger-del /Users/chanhokim/myFiles/0_Project/blog/.multi-agent/queue spec-mgr-msg
watchman trigger-del /Users/chanhokim/myFiles/0_Project/blog/.multi-agent/queue consultant-msg
watchman trigger-del /Users/chanhokim/myFiles/0_Project/blog/.multi-agent/queue worker-1-msg
watchman trigger-del /Users/chanhokim/myFiles/0_Project/blog/.multi-agent/queue worker-2-msg
watchman trigger-del /Users/chanhokim/myFiles/0_Project/blog/.multi-agent/queue worker-3-msg

# watch 삭제
watchman watch-del /Users/chanhokim/myFiles/0_Project/blog/.multi-agent/specs
watchman watch-del /Users/chanhokim/myFiles/0_Project/blog/.multi-agent/queue
```

---

### Phase 2-3: 멀티 에이전트 통합 테스트 (blog-27s)

> **Note**: Phase 2-1, 2-2 완료 후 진행

#### 시나리오: 간단한 유틸 함수 추가

**목표**: consultant → spec-manager → task-manager → worker 전체 플로우 검증

#### 1. 세션 시작

```bash
# tmux 세션 시작
bash scripts/start-multi-agent.sh

# watchman 트리거 설정 (다른 터미널)
bash scripts/setup-watchman.sh
```

#### 2. 요구사항 입력 (Pane 0: Consultant)

```
"src/shared/lib/utils/에 숫자 포맷팅 함수를 추가해줘.
- 함수명: formatNumber
- 입력: number, locale (기본값: 'ko-KR')
- 출력: 천 단위 콤마로 구분된 문자열
- 예시: formatNumber(1234567) → '1,234,567'
"
```

#### 3. 명세서 초안 작성 (Consultant)

**예상 동작**:
- Consultant가 `.multi-agent/specs/format-number-{timestamp}.yaml` 생성
- watchman이 Pane 2 (SpecManager)에게 알림

#### 4. 명세서 검증 (Pane 2: SpecManager)

**예상 동작**:
- SpecManager가 명세서 파일 읽기
- FSD 아키텍처 준수 여부 확인
- 테스트 요구사항 포함 여부 확인
- 검증 완료 시 `.multi-agent/queue/task-manager-{timestamp}.json` 생성

#### 5. 태스크 분해 (Pane 1: TaskManager)

**예상 동작**:
- TaskManager가 queue 메시지 수신
- beads issue 생성:
  ```bash
  bd create "formatNumber 함수 구현" --priority P0
  bd create "formatNumber 함수 테스트 작성" --priority P0
  ```
- `.multi-agent/queue/worker-1-{timestamp}.json` 생성 (작업 할당)

#### 6. 코드 구현 (Pane 3: Worker-1)

**예상 동작**:
- Worker-1이 queue 메시지 수신
- `src/shared/lib/utils/formatNumber.ts` 생성
- Git commit
- beads issue 업데이트: `bd close {issue-id}`

#### 7. 검증

```bash
# 생성된 파일 확인
ls src/shared/lib/utils/formatNumber.ts

# Git 로그 확인
git log --oneline -1

# beads 상태 확인
bd list
```

---

## 🐛 트러블슈팅

### Issue 1: opencode --agent 옵션 미지원

**증상**: `opencode --agent consultant` 실행 시 에러

**해결**:
1. 스크립트 수정 (`scripts/start-multi-agent.sh`):
   ```bash
   # 39-42행 주석 처리
   # tmux send-keys -t 0 "opencode --agent consultant" C-m
   # tmux send-keys -t 1 "opencode --agent task-manager" C-m
   # tmux send-keys -t 2 "opencode --agent spec-manager" C-m
   ```

2. 각 pane에서 수동으로 opencode 실행 및 에이전트 선택

### Issue 2: watchman 트리거가 동작하지 않음

**증상**: 파일 생성 시 pane에 메시지가 표시되지 않음

**해결**:
```bash
# watchman 재시작
watchman shutdown-server

# 트리거 재설정
bash scripts/setup-watchman.sh

# 로그 레벨 증가하여 디버깅
watchman --log-level=2
```

### Issue 3: tmux pane 레이아웃이 이상함

**증상**: 6개 pane이 예상과 다르게 배치됨

**해결**:
```bash
# 세션 종료
tmux kill-session -t multi-agent

# 스크립트 재실행
bash scripts/start-multi-agent.sh

# 또는 수동 레이아웃 조정
Ctrl-b Alt-1  # Even horizontal
Ctrl-b Space  # Cycle layouts
```

---

## ✅ Phase 2 완료 기준

### Phase 2-1 (blog-93f)
- [x] tmux 세션 시작 성공
- [x] 6개 pane 생성 및 레이블 확인
- [x] 각 pane에서 명령어 실행 가능
- [x] 세션 종료 및 재시작 동작 확인

### Phase 2-2 (blog-aal)
- [x] watchman 트리거 설정 성공
- [x] specs 디렉토리 파일 감지 동작
- [x] queue 디렉토리 파일 감지 동작 (7개 트리거)
- [x] tmux pane으로 메시지 전송 확인

### Phase 2-3 (blog-27s)
- [x] Consultant → SpecManager 플로우 동작
- [x] SpecManager → TaskManager 플로우 동작
- [x] TaskManager → Worker 플로우 동작
- [x] Worker가 실제 코드 생성 및 commit
- [x] beads issue 생성/업데이트 동작 확인

---

## 📝 테스트 결과 보고

테스트 완료 후 다음 정보를 보고해주세요:

```markdown
## Phase 2 테스트 결과

### Phase 2-1: tmux 스크립트 테스트
- [ ] ✅ 성공 / ❌ 실패
- 문제점: (있다면 기술)

### Phase 2-2: watchman 트리거 검증
- [ ] ✅ 성공 / ❌ 실패
- 문제점: (있다면 기술)

### Phase 2-3: 멀티 에이전트 통합 테스트
- [ ] ✅ 성공 / ❌ 실패
- 문제점: (있다면 기술)

### 발견된 개선점
1. ...
2. ...
```
