# 자체 멀티 에이전트 시스템 vs 상용 제품 정리

## 1. 의도와 배경

### 1.1 왜 멀티 에이전트를 시도했는가

- AI 관련 글을 읽다가 **멀티 에이전트** 개념에 흥미를 느껴 직접 사용해보고 싶었다.
- **Claude Code**는 토큰 제한 없이 쓰려면 100달러 이상 요금제가 필요해 비용 부담이 컸다.
- **GitHub Copilot**이 비교적 저렴해, Copilot 기반 **opencode**를 이용해 멀티 에이전트를 활용해보려 했다.

### 1.2 기존 AI 툴에서 느꼈던 문제들

멀티 에이전트를 통해 다음 문제를 해결하려 했다:

| 문제 | 설명 |
|------|------|
| **토큰 사용량 최적화** | 한 세션에서 불필요하게 많은 컨텍스트가 쌓여 비용·속도 모두 악화 |
| **한 세션 여러 지시 → 혼동** | 여러 지시를 한꺼번에 주면 모델이 혼란스러워져 성능 저하 |
| **장기 세션 → 망각** | 세션이 길어지면 이전 대화·결정을 잊어버림 |
| **응답 검증 부재** | 생성된 코드·결과에 대한 자동 검증(테스트, 린트 등)이 없음 |

---

## 2. 시도한 것들

### 2.1 여러 터미널에서 opencode 동시 실행

- 여러 터미널을 켜고 opencode를 동시에 실행해 보았다.
- 각 창이 독립 세션이라 서로 통신·협업이 되지 않았고, 작업이 중복되거나 충돌했다.

### 2.2 자체 에이전트 구축 및 역할 분리

- 각 에이전트가 **지정된 작업만** 수행하도록 역할을 분리했다.
- consultant, task-manager, spec-manager, worker 등으로 구성해 **AI 개발팀** 형태의 멀티 에이전트 시스템으로 전환을 시도했다.

### 2.3 tmux로 백그라운드 유지

- 에이전트가 백그라운드에서도 멈추지 않고 돌아가게 하려고 **tmux**를 선택했다.
- 터미널을 닫아도 세션이 유지되고, 필요할 때 다시 attach할 수 있다.

### 2.4 에이전트 간 통신 방식 탐색

- opencode 세션끼리 **어떻게 통신할지** 여러 방식을 고민했다:
  - **JSON 파일 기반**: `.multi-agent/queue/`에 JSON 메시지 저장 → 읽기/쓰기 충돌 발생
  - **Markdown 파일 기반**: 유사한 충돌·동기화 문제
  - **beads 기반**: Dolt DB 기반 이슈 트래커로, 태스크+메시지를 하나의 DB에 통합 → 최종 선택

### 2.5 구축된 구조와 남은 문제점

- 어느 정도 돌아가는 구조는 만들 수 있었으나, 아래 문제들이 남았다.

---

## 3. 남아 있는 문제점과 상용 제품 대응

### 3.1 보고 체계 정립

**문제**: 에이전트 간 통신 시 "누가 누구에게 무엇을 보고하는가"가 명확하지 않다. 메시지 형식, 라우팅, 완료 기준이 일관되지 않다.

**자체 시스템의 시도**:
- beads 메시지에 `tag`, `assign`을 사용해 `validate_spec` → spec-manager, `assign_task` → worker 등 라우팅 규칙을 정의했다.
- dispatcher의 `make_prompt`가 label별로 자연어 지시를 생성해 전달한다.

**상용 제품 대응**:

| 제품 | 대응 방식 | 사용 기능 |
|------|-----------|-----------|
| **Claude Code** | **Shared Task List** (`~/.claude/tasks/{team-name}/`)에 태스크 상태·소유자·의존성을 저장하고, **Mailbox System** (`SendMessage` 툴)로 teammate 간 직접 메시징. Team Lead가 태스크를 생성·할당하고, teammate가 완료 시 Task List를 갱신. | Agent Teams, Shared Task List, Mailbox |
| **Cursor** | Subagent가 작업 완료 시 메인 에이전트에 **요약 결과만** 반환. 멀티 에이전트 간 직접 통신은 없고, 메인 세션이 조율. | Subagents |
| **OpenAI Codex** | **Multi-Agent Workflows**: monitor, explorer, worker, default 역할로 병렬 에이전트 spawn. 결과를 한 응답으로 수집. Slack, GitHub Actions, Linear 연동. | Multi-Agent, 내장 역할 |
| **Gemini Code Assist** | Agent 모드에서 MCP 서버로 외부 도구 연동. 단일 에이전트 중심. 멀티 에이전트 간 직접 통신은 없음. | Agent 모드, MCP |
| **opencode** | **단독**에는 세션 간 통신 없음. MCP로 외부 서비스 연동 가능. beads·파일 기반 보고 체계는 **자체 멀티 에이전트 시스템**에서 구현. | MCP (연동만, 보고 체계는 자체 구현) |

---

### 3.2 파일/beads 큐의 읽기·쓰기 충돌

**문제**: JSON·Markdown 파일 기반 큐를 쓰면 여러 프로세스가 동시에 읽기/쓰기할 때 LOCK·충돌이 발생한다. beads도 Dolt DB 기반이라 동시 접근 시 `panic: nil pointer dereference` 등 오류가 난다.

**자체 시스템의 시도**:
- **dispatcher 단일 호출**: `bd list`를 호출하는 주체를 dispatcher 하나로 제한.
- **state.json 캐시**: dispatcher가 `bd list` 결과를 `cache/state.json`에 쓰고, dashboard·ma status는 이 파일만 읽어 beads LOCK을 피한다.
- AGENTS.md에 LOCK 재시도 규칙, 단일 명령어 원칙을 문서화했다.

**상용 제품 대응**:

| 제품 | 대응 방식 | 사용 기능 |
|------|-----------|-----------|
| **Claude Code** | 각 teammate가 **독립 프로세스**로 동작. Shared Task List는 파일 시스템 기반이지만, Claude Code가 내부적으로 동기화·락을 처리. Agent Teams는 "여러 Claude 인스턴스"이지, 단일 DB를 동시에 두드리는 구조가 아님. | Agent Teams (프로세스 분리) |
| **Cursor** | Subagent는 **별도 컨텍스트 창**에서 실행되고, 메인 세션과 **직접 파일/DB를 공유하지 않음**. 결과만 요약해서 전달. | Subagents (컨텍스트 분리) |
| **OpenAI Codex** | Sub-agent가 부모 sandbox 정책을 상속. 프로세스별 독립 실행. | Multi-Agent Sandbox |
| **Gemini Code Assist** | 단일 에이전트 모드. 동시성 제어는 IDE·MCP 통합 수준. | Agent 모드 |
| **opencode** | **단독**에는 동시성 제어 없음. dispatcher·state.json 캐시·LOCK 회피는 **자체 멀티 에이전트 시스템**에서 구현. | 없음 (자체 시스템에서 구현) |

---

### 3.3 백그라운드 에이전트 상태 확인 및 중간 결과 시각화

**문제**: 백그라운드에서 돌아가는 에이전트의 **현재 동작 상태**를 보기 어렵고, **지금까지 진행된 내용·중간 결과**를 시각적으로 확인하기 힘들다.

**자체 시스템의 시도**:
- **dashboard.sh** overview pane: Specs 진행률, Todos, Agents 상태, BLOCKED, Activity Feed를 한 화면에 표시.
- state.json 기반으로 "어느 에이전트가 어떤 태스크를 진행 중인지" 읽기 전용 요약.
- tmux pane으로 각 에이전트 창을 항상 눈에 보이게 배치.

**상용 제품 대응**:

| 제품 | 대응 방식 | 사용 기능 |
|------|-----------|-----------|
| **Claude Code** | IDE UI에 **변경 파일**, **진행 중인 명령**, **테스트 결과**, **Subagent/Agent Team 활동 로그** 패널 제공. Agent Teams 사용 시 `~/.claude/tasks/{team-name}/`에 태스크가 저장되어, 어떤 teammate가 무엇을 하고 있는지 확인 가능. | IDE 패널, Task List, Agent Teams 로그 |
| **Cursor** | **동적 컨텍스트 발견**으로 관련 파일·에러만 선택적으로 로드. 채팅 패널에서 진행 상황·Subagent 요약을 확인. 장기 세션 시 **자동 요약**으로 컨텍스트를 압축해 이전 작업을 유지. | Dynamic Context, Subagent 요약, 자동 요약 |
| **OpenAI Codex** | Admin 대시보드, 모니터링·분석. monitor 역할로 장기 실행 태스크 추적 (최대 1시간). 실행 중 sub-agent 조정·중단 가능. | Admin 대시보드, monitor 역할 |
| **Gemini Code Assist** | Agent 모드에서 코드 미리보기 패널, 멀티 채팅. @ 기호로 파일 컨텍스트 선택. | Agent 모드, 코드 미리보기 |
| **opencode** | **단독**에는 TUI만. 백그라운드 에이전트 상태·중간 결과 시각화 없음. dashboard.sh overview는 **자체 멀티 에이전트 시스템**에서 구현. | 없음 (자체 시스템에서 구현) |

---

### 3.4 16GB RAM으로 여러 에이전트 동시 실행의 어려움

**문제**: 16GB RAM 환경에서 opencode를 여러 개 동시에 돌리면 메모리 부족으로 느려지거나 크래시가 난다.

**자체 시스템의 시도**:
- worker를 3명에서 **2명**으로 줄였다 (v4.6.0).
- tmux + opencode 조합 자체가 가벼운 편이지만, opencode 인스턴스당 메모리 사용량은 그대로다.

**상용 제품 대응**:

| 제품 | 대응 방식 | 사용 기능 |
|------|-----------|-----------|
| **Claude Code** | Agent Teams는 **teammate당 별도 Claude 인스턴스**를 띄우므로, 2~16명 구성 시 **토큰 비용이 3~7배**로 늘어남. 메모리보다 **비용**이 제약. Pro 요금제($20/월) 이상에서 무제한 사용 가능하나, Agent Teams는 실험 기능. | Agent Teams (비용·리소스 트레이드오프) |
| **Cursor** | **Subagent**는 같은 프로세스 내 **별도 컨텍스트 창**에서 동작. 완전히 독립된 프로세스가 아니라, **메모리 공유**가 가능해 Agent Teams보다 가벼울 수 있음. | Subagents |
| **OpenAI Codex** | Multi-agent spawn 시 인스턴스당 리소스 사용. 클라우드 기반이라 로컬 RAM 부담은 상대적으로 적음. | Multi-Agent (클라우드) |
| **Gemini Code Assist** | 단일 에이전트 모드. 로컬 IDE 플러그인 형태라 인스턴스당 메모리 사용. | Agent 모드 |
| **opencode** | Copilot 기반. 여러 터미널에서 동시 실행 시 **각각 독립 프로세스**라 RAM 선형 증가. worker 2명으로 제한한 것은 **자체 시스템** 설계. | 없음 (자체 시스템에서 인스턴스 수 제한) |

---

### 3.5 지정 범위 외 명령 시도 및 허가 요청으로 인한 멈춤

**문제**: 에이전트가 **지정된 역할·권한 밖**의 명령을 자꾸 시도하고, 허가를 받기 위해 **멈춘다**. 예: worker가 `git push`를 시도하거나, spec-manager가 `src/`를 수정하려 함.

**자체 시스템의 시도**:
- `config/agents.yaml`에 에이전트별 `read`, `write`, `code`, `git` 권한을 정의.
- `.opencode/agent/*.md` 프롬프트에 "절대 X 금지" 규칙을 명시.
- opencode 자체의 **권한 시스템**이 이 설정을 완전히 강제하지는 못해, 모델이 여전히 시도하고 멈출 수 있다.

**상용 제품 대응**:

| 제품 | 대응 방식 | 사용 기능 |
|------|-----------|-----------|
| **Claude Code** | **계층적 권한**: `deny` → `ask` → `allow` 순으로 평가. `deny`가 최우선. 읽기만 `allow`, 파일 수정·bash는 `ask` 또는 `deny`로 제한. **Subagent별 툴 제한**: Explore·Plan은 **읽기 전용**, General-purpose만 전체 툴. **샌드박스 bash**: 파일시스템·네트워크 격리. | Permissions, Custom Subagents (tool access), Sandboxed bash |
| **Cursor** | Subagent별로 **컨텍스트·도구 접근**을 제한 가능. 메인 에이전트가 "이 Subagent는 읽기만" 등으로 위임. | Subagents (설정에 따라 제한) |
| **OpenAI Codex** | **Sandbox 정책**으로 파일 쓰기·네트워크 제어. Sub-agent는 부모 sandbox 상속. **역할별 제한**: explorer는 읽기 위주, worker는 실행. `read_only` 모드로 개별 역할 제한 가능. | Sandbox, 역할별 read_only |
| **Gemini Code Assist** | Agent 모드에서 도구 사용·계획 승인(plan approval)으로 제어. | Plan approval |
| **opencode** | **opencode.json(c)** 에 `permissions` 정의 가능. **실제 enforcement**는 모델 의존. consultant/task-manager/worker 역할 분리와 agents.yaml은 **자체 멀티 에이전트 시스템** 구현. | opencode.json (역할 분리는 자체 시스템) |

---

### 3.6 진행 중 새 지시·갱신 지시 반영 안 됨

**문제**: 진행 중인 작업에 **새로운 지시**나 **갱신된 추가 지시**가 있어도 반영되지 않는다. dispatcher가 한 번 보낸 프롬프트 이후로는 "도중에 수정된 요구사항"을 에이전트에게 전달할 방법이 없다.

**자체 시스템의 시도**:
- beads에 새 메시지를 만들면 dispatcher가 다음 폴링에서 감지해 전달한다.
- 하지만 **이미 진행 중인 태스크**에 "추가로 이렇게 해줘"를 붙이는 **인라인 갱신** 메커니즘은 없다.
- 사람이 해당 pane에 직접 입력하거나, beads에 새 메시지를 만들어 "기존 태스크에 추가 지시"를 명시해야 한다.

**상용 제품 대응**:

| 제품 | 대응 방식 | 사용 기능 |
|------|-----------|-----------|
| **Claude Code** | **언제든 인터럽트 가능**: `Ctrl+C`로 현재 입력/생성 취소, `Esc`+`Esc`로 이전 시점으로 되돌리기. 에이전트 루프가 **사용자 입력에 반응**하도록 설계되어, 진행 중에도 **새 지시를 입력**하면 그걸 반영한다. `--append-system-prompt`로 런타임에 지시 추가 가능. | Interactive mode, Ctrl+C, Esc+Esc, append-system-prompt |
| **Cursor** | 채팅 창에서 **진행 중에도 새 메시지**를 보낼 수 있고, 에이전트가 이를 반영해 방향을 바꿀 수 있다. | 채팅 인터페이스 |
| **OpenAI Codex** | 실행 중 sub-agent **조정·중단** 가능. monitor 역할로 장기 폴링. | Sub-agent steering |
| **Gemini Code Assist** | Agent 모드에서 plan approval로 단계별 제어. 채팅으로 추가 지시 가능. | Plan approval, 채팅 |
| **opencode** | **단독**에는 진행 중 지시 추가 메커니즘 없음. beads에 새 메시지 → dispatcher 폴링 → 전달은 **자체 멀티 에이전트 시스템**에서 구현. | 없음 (자체 시스템에서 구현) |

---

### 3.7 진행 중인 내용과 새 지시가 다를 때의 세션 분리·안정장치 부재

**문제**: 진행 중인 작업과 **완전히 다른** 새 지시가 들어오면, **새 세션에서 진행해 내용이 섞이지 않게** 해야 하는데, 그런 **안정장치**가 없다. 같은 pane에서 두 맥락이 뒤섞이면 모델이 혼란스러워진다.

**자체 시스템의 시도**:
- spec 필터(overview에서 `s` 키로 선택)로 "이 spec에 속한 태스크만" 보이게 할 수 있다.
- 하지만 **에이전트 pane 하나**에서 "지금 하던 작업"과 "새로 들어온 다른 작업"을 **물리적으로 분리**하는 메커니즘은 없다.
- worker-1이 태스크 A를 하다가, 태스크 B가 할당되면 **같은 세션**에서 B를 시작하게 되고, A와 B 컨텍스트가 섞일 수 있다.

**상용 제품 대응**:

| 제품 | 대응 방식 | 사용 기능 |
|------|-----------|-----------|
| **Claude Code** | **Subagent**: 각 Subagent 호출마다 **새 컨텍스트 창**에서 실행. "이건 별도 작업"이면 Plan/Explore/General-purpose를 **새로 호출**해 완전히 분리된 컨텍스트에서 진행. **Agent Teams**: teammate마다 **독립 세션**. Team Lead가 "이건 다른 스레드"로 인식하면 새 teammate를 spawn. | Subagents (컨텍스트 분리), Agent Teams (세션 분리) |
| **Cursor** | **새 채팅**을 열면 **새 컨텍스트**로 시작. "기존 작업과 다른 주제"면 새 채팅에서 진행해 **이전 대화와 분리**. Composer에서도 새 세션 시작 가능. | 새 채팅, 새 Composer 세션 |
| **OpenAI Codex** | **역할별 에이전트** spawn. monitor/explorer/worker가 각각 독립 컨텍스트. "별도 작업"이면 새 agent spawn. | Multi-Agent (역할별 분리) |
| **Gemini Code Assist** | **멀티 채팅** 지원. 새 채팅으로 주제 분리. | 멀티 채팅 |
| **opencode** | **단독**에는 새 터미널 = 새 세션(수동)만. worker pane 고정·spec 필터는 **자체 멀티 에이전트 시스템** 구현. 동적 "작업 A 전용 pane" 분리는 없음. | 새 터미널 (수동, 자체 시스템에서 pane 고정) |

---

### 3.8 백그라운드 실행

**문제**: 에이전트가 작업하는 동안 터미널·IDE를 닫거나 다른 작업을 하려면, 에이전트가 **백그라운드에서 계속 실행**되어야 한다. 터미널 종료 시 세션이 끊기면 안 된다.

**핵심 기준: 터미널 종료 후에도 실행 가능한가?**

| 제품/시스템 | 터미널 종료 후 실행 가능? |
|-------------|---------------------------|
| **Claude Code** | ❌ 불가. 터미널을 닫으면 프로세스가 종료됨. |
| **Cursor Cloud Agents** | ✅ 가능. 클라우드에서 실행되므로 로컬 터미널과 무관. |
| **자체 시스템 (tmux + opencode)** | ✅ 가능. tmux 서버가 별도 프로세스로 떠 있어 터미널을 닫아도 유지됨. |

**자체 시스템의 시도**:
- **tmux**로 세션 유지. 터미널을 닫아도 tmux 세션(`multi-agent`)은 살아 있고, `ma attach`로 재진입 가능.
- opencode 인스턴스가 tmux pane 안에서 실행되므로, 터미널만 닫으면 pane도 함께 종료되는 것은 아님 (tmux 서버가 살아 있는 한).

**상용 제품 대응**:

| 제품 | 대응 방식 | 사용 기능 |
|------|-----------|-----------|
| **Claude Code** | **Ctrl+B**로 Subagent를 백그라운드로 전환. **같은 세션 내**에서 UI 블로킹 없이 다른 작업 가능. 단, **터미널을 닫으면 프로세스가 종료**되므로 터미널 종료 후 실행은 불가. `--resume`은 저장된 상태에서 새 세션을 여는 것이지, 기존 프로세스가 살아 있는 것은 아님. `/tasks`로 실행 중 에이전트 상태·토큰 사용량 확인. | Ctrl+B, Background agents, /tasks |
| **Cursor** | **Cloud Agents**(구 Background Agents): 로컬이 아닌 **클라우드**에서 실행. 로컬 PC를 끄거나 네트워크를 끊어도 에이전트는 계속 동작. Desktop·Web·GitHub·Slack·Linear·API에서 실행·관리. 완료 시 PR 생성. | Cloud Agents |
| **OpenAI Codex** | **Background mode**(API `background: true`): 장기 태스크를 비동기로 실행, 폴링으로 상태 조회. **monitor 역할**: 최대 1시간 대기·반복 상태 체크에 최적화. Long-horizon: 25시간+ 연속 실행 스트레스 테스트 지원. 클라우드 기반이라 로컬 터미널 종료와 무관. | Background mode, monitor 역할 |
| **Gemini Code Assist** | **순수 백그라운드 실행 미지원**. Agent 모드는 plan approval·단계별 승인으로 **사용자 감독 하에** 실행. 실행 중 사용자가 계속 화면에 있어야 함. | 없음 (감독 모드 전제) |
| **opencode** | **단독**에는 백그라운드 실행 기능 없음. tmux + opencode 조합으로 pane 유지는 **자체 멀티 에이전트 시스템**에서 구현. 터미널 종료 시 tmux 서버가 살아 있으면 세션 유지. | 없음 (자체 시스템에서 tmux 활용) |

---

## 4. 토큰·세션·검증 관련 상용 제품 대응

### 4.1 토큰 사용량 최적화

| 제품 | 대응 방식 | 사용 기능 |
|------|-----------|-----------|
| **Claude Code** | Agent Teams는 **3~7배 토큰** 사용. 단순 작업은 **단일 세션 또는 Subagent**로 처리해 비용 절감. Plan 모드 시 7배 수준. | Agent Teams 비용 가이드, Subagents (저비용 대안) |
| **Cursor** | **Dynamic Context Discovery**: 필요한 컨텍스트만 선택적으로 로드해 **토큰 약 47% 절감**. 툴 응답은 파일로 저장 후 필요 시 읽기. MCP는 필요한 것만 로드. | Dynamic Context, Tool response files, Selective MCP |
| **OpenAI Codex** | WebSockets 기반 Responses API로 에이전트 호출 약 30% 저지연. 클라우드 기반. | WebSockets API |
| **Gemini Code Assist** | MCP progressive discovery로 컨텍스트 효율 개선. IDE·도구 응답·컨텍스트 파일 조합. | MCP, Agent 모드 |
| **opencode** | GitHub Copilot provider는 **128k 토큰** 컨텍스트 제한. 설정으로 `context`, `output` limit 조정 가능. 장기 세션 시 전체 히스토리 전송으로 비용·속도 악화. | provider 설정, `limit.context`, `limit.output` |

### 4.2 한 세션 여러 지시 → 혼동 방지

| 제품 | 대응 방식 | 사용 기능 |
|------|-----------|-----------|
| **Claude Code** | **Subagent**로 "지시별로 별도 컨텍스트" 분리. Plan은 계획만, Explore는 탐색만, General-purpose는 구현만. **Agent Teams**는 teammate별로 완전히 다른 작업을 맡김. | Subagents, Agent Teams |
| **Cursor** | **Subagent**로 작업을 위임해 메인 대화를 단순하게 유지. **새 채팅**으로 주제 분리. | Subagents, 새 채팅 |
| **OpenAI Codex** | monitor, explorer, worker, default **역할별 에이전트** spawn. 지시별로 별도 agent에 위임. | Multi-Agent (역할별 분리) |
| **Gemini Code Assist** | Agent 모드에서 단일 에이전트. 멀티 채팅으로 주제 분리. | Agent 모드, 멀티 채팅 |
| **opencode** | **단독**에는 멀티 에이전트·역할 분리 없음. consultant/worker 역할 분리는 **자체 멀티 에이전트 시스템**에서 구현. | 없음 (자체 시스템에서 구현) |

### 4.3 장기 세션 → 망각 방지

| 제품 | 대응 방식 | 사용 기능 |
|------|-----------|-----------|
| **Claude Code** | **자동 요약·컨텍스트 압축**. 컨텍스트가 차면 이전 대화를 요약해 창을 비우고, 채팅 히스토리 파일을 참조해 상세 복구. Agent Teams의 **Shared Task List**가 "지금까지 뭘 했는지"를 디스크에 저장. | 자동 요약, Chat history references, Task List |
| **Cursor** | **자동 요약**으로 컨텍스트 한도 도달 시 이전 작업을 압축. **동적 컨텍스트**로 "지금 필요한 것"만 유지. | 자동 요약, Dynamic Context |
| **OpenAI Codex** | monitor 역할로 장기 폴링(최대 1시간). 클라우드 세션 유지. | monitor 역할 |
| **Gemini Code Assist** | Agent 모드에서 프로젝트 컨텍스트·채팅 히스토리 유지. | Agent 모드 |
| **opencode** | 128k 제한으로 **장기 세션 어려움**. beads·spec으로 진행 상황 저장은 **자체 멀티 에이전트 시스템** 구현. opencode 단독에는 해당 메커니즘 없음. | 없음 (자체 시스템에서 beads/spec 구현) |

### 4.4 응답 검증 부재

| 제품 | 대응 방식 | 사용 기능 |
|------|-----------|-----------|
| **Claude Code** | **Hooks**: 파일 저장·커밋 등 이벤트에 ESLint, 테스트, 타입체커를 **자동 실행**. 실패 시 에이전트가 수정 루프에 들어갈 수 있음. **Sandboxed bash**로 안전하게 테스트 실행. | Hooks, Sandboxed bash |
| **Cursor** | **실행 결과**를 IDE에 표시. 테스트·빌드 실패 시 에러를 컨텍스트에 포함해 수정 유도. **Hooks** 유사 기능(설정에 따라). | 실행 결과 표시, 테스트 통합 |
| **OpenAI Codex** | 코드 생성 → 테스트 실행 → 실패 시 자동 수정 루프. GitHub Actions, CI/CD 파이프라인 연동. | 자동 수정 루프, GitHub Actions |
| **Gemini Code Assist** | 코드 생성·테스트·디버깅 지원. MCP로 외부 도구 연동. | Agent 모드, MCP |
| **opencode** | **자동 검증 없음**. 사용자가 `pnpm test`, `pnpm lint` 등을 수동 실행하거나, 스크립트로 연결해야 함. | 없음 (사용자 스크립트) |

---

## 5. 요약

### 5.1 자체 멀티 에이전트 시스템이 해결한 것

- **비용**: Copilot 기반 opencode로 Claude Code Pro 대비 저렴하게 멀티 에이전트 체험.
- **역할 분리**: consultant, task-manager, spec-manager, worker로 "한 에이전트 = 한 종류의 일" 강제.
- **통신·상태**: beads + state.json으로 태스크·메시지 단일 소스, LOCK 회피.
- **가시성**: tmux + dashboard로 "누가 무엇을 하고 있는지" 눈으로 확인.

### 5.2 아직 부족한 것

- IDE·레포와의 깊은 통합, 에이전트 간 고수준 협업, 품질 게이트 자동화.
- **진행 중 새 지시 반영**, **맥락이 다른 작업의 세션 분리**, **권한 밖 명령 시도의 하드웨어적 차단**.
- **16GB RAM**에서 여러 에이전트 동시 실행의 물리적 한계.

### 5.3 상용 제품이 보완하는 지점

- **Claude Code**: Agent Teams, Subagents, Shared Task List, Mailbox, Permissions, Hooks, Interactive mode로 협업·권한·검증·중단·갱신을 IDE 안에서 통합.
- **Cursor**: Dynamic Context, Subagents, 자동 요약으로 토큰·세션·혼동을 줄임.
- **OpenAI Codex**: Multi-Agent(monitor/explorer/worker), Sandbox, GitHub Actions 연동, 자동 수정 루프.
- **Gemini Code Assist**: Agent 모드, MCP, 멀티 채팅, plan approval.
- **opencode**: 저렴하나, 멀티 에이전트·통신·검증·권한 강제는 **사용자가 직접 설계**해야 함.

---

## 참고 문서

- [multi-agent-system.md](./multi-agent-system.md) — 자체 멀티 에이전트 시스템 아키텍처
- [multi-agent-changelog.md](./multi-agent-changelog.md) — 구축 이력 (git 기반)

이 문서는 "왜 opencode 기반으로 멀티 에이전트를 만들었는지, 어떤 시도를 했고 어떤 문제가 남았는지, 그리고 Claude Code·Cursor·OpenAI Codex·Gemini Code Assist 같은 상용 제품이 각 문제를 어떻게 풀고 있는지"를 정리한 참고용 비교 문서입니다.
