> 이 문서의 상위 문서: [agents.md](./agents.md)

# 에이전트 시스템 상세

이 프로젝트는 멀티 에이전트 시스템을 사용하여 복잡한 기능을 개발합니다. 각 에이전트는 특정 작업을 자율적으로 수행하는 전문화된 AI 도우미입니다.

## 에이전트 호출 제약사항

1. ❌ master-orchestrator는 master-orchestrator를 서브에이전트로 호출할 수 없습니다.

- 현재 위치가 master-orchestrator인 경우, 다른 서브에이전트만 호출 가능

2. ❌ 서브에이전트는 .agents/agents/ 내의 다른 서브에이전트를 호출할 수 없습니다

## 사용 가능한 에이전트

### master-orchestrator

멀티 에이전트 시스템의 프로젝트 관리자이자 조율자. **코드를 직접 작성하지 않고** 적절한 에이전트에게 작업을 분배합니다.

- 요구사항 분석 및 작업 분해, 에이전트 선택 및 역할 할당
- 진행 상황 모니터링, 오류 처리 및 재할당, 결과 통합

**사용 시기**: 복잡한 기능 개발, 여러 독립 작업 병렬 처리, 대규모 시스템 구축

**사용 예시**:

```
"다크 모드를 지원하는 태그 필터 컴포넌트를 개발해줘"
"블로그 포스트 필터링 기능을 추가하고, 동시에 Contact 폼의 보안을 강화해줘"
```

**작업 프로세스**: 요구사항 분석 → Git Flow 준비 (develop → feature branch → worktrees) → Subagent 병렬/순차 실행 → Worktrees 통합 → PR 생성

| 작업 유형           | 할당 에이전트     | 우선순위 |
| ------------------- | ----------------- | -------- |
| feature-development | feature-developer | HIGH     |
| test-writing        | test-specialist   | HIGH     |
| doc-validation      | doc-manager       | LOW      |
| quality+security    | tech-architect    | MEDIUM   |
| retrospective       | retrospector      | LOW      |

---

### feature-developer

새로운 기능을 개발하는 전문 에이전트. **테스트 코드는 작성하지 않습니다** (test-specialist 담당).

- 기능 개발 및 품질 보장, 엣지 케이스 사전 식별
- FSD 아키텍처 준수, 보안 및 접근성 고려

**사용 시기**: UI 컴포넌트 개발, 비즈니스 로직 구현, Form 검증 및 보안 기능

**사용 예시**:

```
"다크 모드를 지원하는 태그 필터 컴포넌트를 만들어줘"
"Contact 폼에 이메일 검증과 XSS 방지 기능을 추가해줘"
```

---

### test-specialist

포괄적인 테스트 코드를 작성하고 코드 품질을 보장하는 전문 에이전트.

- Unit, Integration, E2E, Property-based 테스트 및 Storybook 스토리 작성
- 다양한 입력값, 경계 조건, 예외 상황 검증
- 실패한 테스트 분석 및 수정, 커버리지 목표 달성

**사용 시기**: 컴포넌트/함수 테스트 작성, Storybook 스토리, E2E 테스트, 커버리지 개선

**사용 예시**:

```
"Button 컴포넌트에 대한 테스트 코드를 작성해줘"
"Contact 폼 제출 플로우에 대한 E2E 테스트를 작성해줘"
```

**검증 항목**: 정상 케이스, 경계 조건, 엣지 케이스, 에러 케이스, 접근성, UI/UX (다크 모드/반응형)

---

### doc-manager

프로젝트 문서 및 에이전트 프롬프트의 정확성과 최신성을 관리.

- 문서-코드 일관성 검증, 오류 및 오래된 내용 탐지
- Git 변경사항 추적하여 문서 업데이트 제안, 에이전트 프롬프트 관리

**사용 시기**: 문서 정확성 확인, 코드 변경 후 문서 업데이트, 의존성 업데이트 후 버전 확인

**사용 예시**:

```
"docs/agents.md 문서가 현재 프로젝트와 일치하는지 검증해줘"
"최근 코드 변경사항을 확인해서 문서를 업데이트해야 할 부분이 있는지 알려줘"
```

---

### lint-formatter

포매팅과 린트 에러만 수정하는 전문 에이전트. **코드 동작을 변경하지 않습니다**.

- Prettier/ESLint 자동 수정 가능한 스타일 문제 해결
- import 순서, 들여쓰기, 줄바꿈, 공백 등 코드 스타일 통일
- 로직 변경이 필요한 에러는 feature-developer에게 위임

**사용 시기**: ESLint/Prettier 에러 수정, 코드 스타일 통일, import 순서 정리

**사용 예시**:

```
"린트 에러가 발생했어, 수정해줘"
"import 순서를 정리해줘"
```

---

### git-guardian

Git 워크플로우 관리 및 안전한 버전 관리 담당.

- Git 안전성 보장 (main 브랜치 보호, 충돌 방지, 최신 상태 유지)
- 표준화된 커밋 메시지, 충돌 해결 지원, Git Flow 브랜치 전략 준수

**사용 시기**: 커밋, 푸시, Git 충돌 발생, 새 feature 브랜치 생성

**주요 기능**: 커밋 생성 (main 차단, fetch 후 변경사항 분석), 충돌 해결 (ours/theirs/manual), 브랜치 생성 (develop 기준, 타임스탬프 포함)

**Git Flow**: `main ← develop ← feature/[name]-[timestamp]`

---

### github-helper

GitHub CLI (gh)를 사용한 GitHub 통합 작업 담당.

- PR 관리 (생성, 리뷰, 머지), CI/CD 모니터링, Issue 관리
- Squash merge 기본 사용, 원격 브랜치 자동 삭제

**사용 시기**: PR 생성, CI 상태 확인, PR 코멘트 확인, Issue 생성/관리

**브랜치 보호**: main은 직접 푸시 금지 (PR + 리뷰 필수), develop은 PR 권장

---

### tech-architect

서브에이전트 결과물의 품질과 보안 취약점을 검증하는 읽기 전용 에이전트. **코드를 수정하지 않고** 검증 보고서만 제출합니다.

- FSD 아키텍처 준수 여부, 코드 스타일, 타입 안전성, 보안 취약점 검증
- 오버엔지니어링, 중복 코드, 요구사항 정확성 검증
- ✅ 통과 / ⚠️ 개선 필요 / 🚨 차단 3단계 보고서 출력

**사용 시기**: 각 Phase 완료 후 결과물 품질 검증, PR 전 코드 리뷰

**사용 예시**:

```
"feature-developer가 만든 컴포넌트를 검증해줘"
"이 변경사항이 FSD 아키텍처를 준수하는지 확인해줘"
"보안 취약점이 있는지 확인해줘"
```

---

### retrospector

PR/커밋에 대한 회고 분석을 수행하고 에이전트 프롬프트 개선을 제안하는 에이전트.

- "잘한 점 / 개선점 / 에이전트 프롬프트 개선 제안" 3축 분석
- `docs/retrospective/` 디렉토리에 회고 문서 작성
- Serena 메모리에 회고 결과 이중 저장

**사용 시기**: PR 생성 후 회고 분석, 에이전트 시스템 개선점 파악

**사용 예시**:

```
"이번 PR의 회고 분석을 해줘"
"최근 작업에서 에이전트 프롬프트 개선점을 찾아줘"
```

## 에이전트 사용 방법

**기본 사용**: master-orchestrator가 자동으로 요구사항 분석 → 작업 분해 → Git Flow 준비 → 에이전트 병렬/순차 실행 → 결과 통합 및 PR 생성

**Git Flow + Worktree**: 각 subagent를 격리된 worktree 환경에서 실행하여 병렬 안전성 보장, Git 충돌 방지, 작업 완료 후 자동 정리.

**병렬 실행** (독립적인 작업 - 다른 파일 수정 시):

```
"태그 필터 컴포넌트를 만들고, 동시에 보안 취약점을 검사해줘"
→ feature-developer + tech-architect 동시 실행
```

**순차 실행** (의존적인 작업 - 같은 파일 수정 시):

```
"다크 모드 버튼을 만들고, 그 다음 E2E 테스트를 작성해줘"
→ feature-developer 완료 후 → test-specialist 실행
```

**명시적 지정**: `"feature-developer 에이전트를 사용하여 [기능]을 구현해줘"`

## 에이전트 검증 및 개발

에이전트 파일 검증:

```bash
bash ../.agents/skills/agent-identifier/scripts/validate-agent.sh feature-developer.md
```

새로운 에이전트 추가: Agent Development 스킬 (`/Agent Development`) 또는 `.agents/skills/agent-identifier/SKILL.md` 참고.
