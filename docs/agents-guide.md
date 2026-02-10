# 에이전트 가이드

## 개요

이 프로젝트는 멀티 에이전트 시스템을 사용하여 복잡한 기능을 개발합니다. 각 에이전트는 특정 작업을 자율적으로 수행하는 전문화된 AI 도우미입니다.

## 사용 가능한 에이전트

### master-orchestrator

멀티 에이전트 시스템의 프로젝트 관리자이자 조율자입니다. 복잡한 기능 요청을 분석하고 여러 전문 에이전트에게 작업을 분배합니다.

**주요 역할**:

- 🎯 요구사항 분석 및 작업 분해
- 📋 작업 계획 수립 및 우선순위 결정
- 🤖 에이전트 선택 및 역할 할당 (동적 할당)
- 📊 진행 상황 모니터링 및 대시보드 갱신
- 🔄 오류 처리 및 재할당 전략
- ✅ 결과 통합 및 최종 보고

**중요**: 이 에이전트는 **코드를 직접 작성하지 않습니다**. 대신 작업을 분석하고 적절한 슬레이브 에이전트(feature-developer, test-specialist, security-scanner, doc-manager)에게 분배합니다.

**사용 시기**:

- 복잡한 기능 개발 (개발+테스트+보안+문서화 필요)
- 여러 독립적인 작업을 병렬 처리해야 할 때
- 대규모 시스템 구축 (인증, 결제 등)
- 여러 컴포넌트를 동시에 개발해야 할 때

**사용 예시**:

```
"다크 모드를 지원하는 태그 필터 컴포넌트를 개발해줘"
"블로그 포스트 필터링 기능을 추가하고, 동시에 Contact 폼의 보안을 강화해줘"
"사용자 인증 시스템을 구축해줘"
```

**작업 프로세스**:

1. 요구사항 분석 및 작업 분해
2. Git Flow 준비 (develop → feature branch → worktrees)
3. Subagent 병렬/순차 실행 (Task tool)
4. Worktrees → Feature branch 통합
5. PR 생성 (develop ← feature)
6. 결과 보고

**Subagent 매핑**:

| 작업 유형           | 할당 에이전트     | 우선순위 |
| ------------------- | ----------------- | -------- |
| feature-development | feature-developer | HIGH     |
| test-writing        | test-specialist   | HIGH     |
| security-check      | security-scanner  | MEDIUM   |
| doc-validation      | doc-manager       | LOW      |

---

### feature-developer

10년차 프론트엔드 개발자로서, 새로운 기능을 개발하는 전문 에이전트입니다.

**주요 역할**:

- ✅ 기능 개발 및 품질 보장
- ✅ 엣지 케이스 및 예상 버그 사전 식별
- ✅ 프로젝트 코딩 규칙 및 FSD 아키텍처 준수
- ✅ 보안 및 접근성 고려

**중요**: 이 에이전트는 **테스트 코드를 작성하지 않습니다**. 테스트는 test-specialist 에이전트가 담당합니다.

**사용 시기**:

- 새로운 UI 컴포넌트 개발
- 복잡한 비즈니스 로직 구현
- Form 검증 및 보안 기능
- 엣지 케이스가 많은 기능

**사용 예시**:

```
"다크 모드를 지원하는 태그 필터 컴포넌트를 만들어줘"
"블로그 포스트를 카테고리별로 그룹핑하고 정렬하는 기능을 추가해줘"
"Contact 폼에 이메일 검증과 XSS 방지 기능을 추가해줘"
```

**개발 프로세스**:

1. 요구사항 분석 및 엣지 케이스 식별
2. 기능 구현
3. 리팩토링 및 품질 개선
4. 통합 및 검증 (린트, 타입 체크)
5. 문서화

---

### security-scanner

보안 취약점을 탐지하고 민감 정보 노출을 방지하는 전문 에이전트입니다. **Git commit 전에 자동으로 실행**되어 코드 보안을 검증합니다.

**주요 역할**:

- 🔒 민감 정보 탐지 (API 키, 토큰, 비밀번호, 개인정보)
- 🔍 의존성 라이브러리 취약점 검사
- 🛡️ 보안 코딩 패턴 검증 (XSS, Injection 방지)
- 🚫 Critical 이슈 발견 시 Git commit/push 차단
- 💡 구체적인 수정 방법 제안

**중요: Pre-Commit vs Pre-Push**

| 단계           | 검사 항목      | 이유                                                |
| -------------- | -------------- | --------------------------------------------------- |
| **Pre-Commit** | 민감 정보 탐지 | 한 번이라도 커밋되면 Git 히스토리에 **영구 기록**됨 |
| **Pre-Push**   | 의존성 취약점  | 로컬 커밋은 되었지만 원격에 **공개되기 전** 차단    |

**사용 시기**:

- Git commit 전 자동 실행 (pre-commit hook) - **민감 정보 탐지**
- Git push 전 자동 실행 (pre-push hook) - **의존성 취약점**
- 코드 변경사항 보안 검증 (수동)
- 전체 프로젝트 보안 감사 (수동)

**사용 예시**:

```
"git commit 전에 보안 취약점 검사해줘"
"git push 전에 의존성 취약점 검사해줘"
"프로젝트 전체에 보안 취약점이 있는지 확인해줘"
"변경사항에 보안 문제가 없는지 검사해"
```

**검증 항목**:

1. **민감 정보 탐지 (Pre-Commit)**
   - API 키, 토큰, 비밀번호 하드코딩
   - AWS 키, Private 키 노출
   - 데이터베이스 연결 문자열 노출
   - 개인정보 (SSN, 신용카드 등)
   - 환경 변수 파일 (`.env`, `.env.local`) 커밋 시도

2. **환경 변수 검증**
   - `.env.local` 파일이 `.gitignore`에 포함되었는지
   - 서버/클라이언트 환경 변수 적절한 사용
   - `.env.example`에 실제 값 없는지

3. **의존성 취약점 (Pre-Push)**
   - `pnpm audit`로 알려진 취약점 확인
   - Critical/High 취약점 우선 처리
   - 대안 라이브러리 제안

4. **코드 보안 패턴**
   - XSS 방지 (dangerouslySetInnerHTML 검증)
   - Injection 방지 (사용자 입력 sanitization)
   - Zod 스키마 검증 적용 여부

**Commit/Push 차단 규칙**:

**Pre-Commit**:

- 🔴 **Critical 이슈 (민감 정보)**: 무조건 차단
- 🔴 **.env 파일 커밋 시도**: 무조건 차단

**Pre-Push**:

- 🔴 **Critical 취약점**: 무조건 차단
- 🟠 **High 취약점 (3개 이상)**: 차단 권장
- 🟡 **Moderate/Low 취약점**: 경고 표시 후 허용

**Husky Hook 통합**:

이 에이전트는 Husky를 통해 자동으로 실행됩니다:

- `.husky/pre-commit` - 민감 정보 탐지, 환경 변수 파일 차단
- `.husky/pre-push` - 의존성 취약점 검사

---

### test-specialist

10년차 테스트 엔지니어로서, 포괄적인 테스트 코드를 작성하고 코드 품질을 보장하는 전문 에이전트입니다.

**주요 역할**:

- ✅ Unit, Integration, E2E, Property-based 테스트 작성
- ✅ Storybook 스토리 작성 (UI 컴포넌트 문서화 및 시각적 테스트)
- ✅ 다양한 입력값, 경계 조건, 예외 상황 검증
- ✅ 테스트 실행 후 기능 요건과 일치 여부 확인
- ✅ 실패한 테스트 분석 및 수정
- ✅ 테스트 커버리지 목표 달성 (80% 이상)

**사용 시기**:

- 새로운 컴포넌트/함수의 테스트 작성
- 컴포넌트 스토리 작성 (Storybook)
- 유틸리티 함수의 엣지 케이스 검증
- 실패한 테스트 수정 및 검증
- E2E 사용자 플로우 테스트
- 테스트 커버리지 확인 및 개선

**사용 예시**:

```
"Button 컴포넌트에 대한 테스트 코드를 작성해줘"
"sanitize 함수의 엣지 케이스를 테스트해줘"
"테스트가 실패하는데 확인해줘"
"Contact 폼 제출 플로우에 대한 E2E 테스트를 작성해줘"
"테스트 커버리지를 확인하고 부족한 부분을 보완해줘"
```

**테스트 작성 프로세스**:

1. 요구사항 분석 및 테스트 케이스 식별
2. Unit/Integration/E2E/Property-based 테스트 작성
3. 테스트 실행 및 결과 검증
4. 실패 시 원인 분석 및 수정
5. 커버리지 확인 및 추가 테스트 작성
6. 테스트 리팩토링 및 문서화

**검증 항목**:

- ✅ 정상 케이스: 일반적인 사용 시나리오
- ✅ 경계 조건: 빈 값, 최소/최대값, null/undefined
- ✅ 엣지 케이스: 특이한 입력 조합, 예외 상황
- ✅ 에러 케이스: 잘못된 입력, 실패 시나리오
- ✅ 접근성: 키보드 네비게이션, 스크린 리더 지원
- ✅ UI/UX: 다크 모드, 반응형, 상호작용 피드백

**커버리지 목표**:

- 전체: 80% 이상
- 유틸리티 함수: 90% 이상
- 비즈니스 로직: 85% 이상
- UI 컴포넌트: 70% 이상

---

### doc-manager

프로젝트 문서 및 에이전트 프롬프트의 정확성과 최신성을 관리하는 전문 에이전트입니다.

**주요 역할**:

- 📋 문서-코드 일관성 검증
- 🔍 오류 및 오래된 내용 탐지
- 🔄 Git 변경사항 추적하여 문서 업데이트 제안
- ✏️ 자동 문서 갱신 실행
- ⭐ 에이전트 프롬프트 관리 (.agents/agents/\*.md)
- 📝 표준 섹션 적용 (명령 실행 요청 규칙 등)

**사용 시기**:

- 문서 정확성 확인 필요 시
- 코드 변경 후 문서 업데이트 필요 시
- 의존성 업데이트 후 버전 정보 확인
- 정기적인 문서 유지보수

**사용 예시**:

```
"docs/agents.md 문서가 현재 프로젝트와 일치하는지 검증해줘"
"최근 코드 변경사항을 확인해서 문서를 업데이트해야 할 부분이 있는지 알려줘"
"docs/agents.md에 오래된 내용이나 오류가 있는지 검증해"
```

**검증 항목**:

- ✅ package.json 명령어와 문서의 명령어 일치
- ✅ 파일 경로와 디렉토리 구조 일치
- ✅ 기술 스택 버전 정보 일치
- ✅ FSD 아키텍처 설명 일치
- ✅ 코드 예제 문법 및 정확성
- ✅ 내부 문서 링크 유효성

---

### git-guardian

Git 워크플로우 관리 및 안전한 버전 관리를 담당하는 전문 에이전트입니다.

**주요 역할**:

- ✅ Git 안전성 보장 (main 브랜치 보호, 충돌 방지, 최신 상태 유지)
- ✅ 표준화된 커밋 메시지 작성 (프로젝트 규칙 준수)
- ✅ 충돌 해결 지원 (사용자 의사결정 기반)
- ✅ Git Flow 브랜치 전략 준수 (develop → feature)

**사용 시기**:

- 코드 변경사항 커밋 필요 시
- 원격 저장소에 푸시할 때
- Git 충돌 발생 시
- 새 feature 브랜치 생성 시

**사용 예시**:

```
"변경사항을 커밋해줘"
"푸시해줘"
"git 충돌이 발생했어"
"새 브랜치 만들어줘"
```

**주요 기능**:

1. **커밋 생성**
   - 현재 브랜치 검증 (main 브랜치 차단)
   - `git fetch`로 최신 상태 확인
   - 변경사항 분석 (`git status`, `git diff`, `git log`)
   - 프로젝트 커밋 규칙에 따라 한국어 메시지 작성
   - 민감 정보 커밋 방지

2. **안전한 푸시**
   - main 브랜치 푸시 차단
   - 최신 상태 확인 및 behind 상태 해결
   - 첫 푸시 시 upstream 설정 (`-u` 플래그)

3. **충돌 해결**
   - 충돌 파일 분석 및 내용 표시
   - 사용자에게 해결 전략 제안 (ours/theirs/manual)
   - 해결 후 merge/rebase 완료

4. **브랜치 생성**
   - develop 브랜치 기준으로 feature 브랜치 생성
   - 타임스탬프 포함 명명 (예: `feature/tag-filter-20260207-143000`)

**커밋 메시지 형식**:

```
type(scope): 한국어 제목

- 한국어 본문
- 변경 사항 설명
```

**Git Flow 전략**:

```
main (프로덕션)
  ← develop (개발 기준)
      ← feature/[name]-[timestamp] (기능 개발)
```

---

### github-helper

GitHub CLI (gh)를 사용한 GitHub 통합 작업을 담당하는 전문 에이전트입니다.

**주요 역할**:

- ✅ Pull Request 관리 (생성, 리뷰, 머지)
- ✅ CI/CD 모니터링 (GitHub Actions 상태 확인)
- ✅ Issue 관리 (생성, 라벨링, 진행 상황 추적)
- ✅ GitHub CLI 활용 (gh 명령어 자동화)

**사용 시기**:

- feature 브랜치 완료 후 PR 생성
- CI/CD 파이프라인 상태 확인
- PR 코멘트 확인 및 응답
- GitHub Issue 생성/관리

**사용 예시**:

```
"PR 만들어줘"
"CI 상태 확인해줘"
"PR 코멘트 확인해줘"
"이슈 생성해줘"
```

**주요 기능**:

1. **PR 생성**
   - Base 브랜치: develop (기본값)
   - 모든 커밋 분석하여 포괄적인 PR 설명 작성
   - HEREDOC으로 본문 포맷 보존
   - Summary, Changes, Testing, Related Issues 섹션 포함

2. **CI/CD 모니터링**
   - GitHub Actions 워크플로우 실행 상태 확인
   - 실패한 Job 로그 분석
   - 재실행 필요 시 제안

3. **PR 코멘트 확인**
   - 코드 리뷰 피드백 수집
   - 해결 필요한 이슈와 선택적 개선사항 구분
   - 응답 제안 (사용자 확인 후)

4. **Issue 관리**
   - 이슈 생성 (버그 리포트, 기능 요청 등)
   - 라벨 및 담당자 할당
   - 이슈 조회 및 상태 업데이트

5. **PR 머지**
   - Squash merge 기본 사용 (커밋 히스토리 정리)
   - 머지 전 CI 체크 및 리뷰 승인 확인
   - 원격 브랜치 자동 삭제 (`--delete-branch`)

**PR 제목 형식**:

```
type: 한국어 제목
```

예시: `feat: 다크 모드 버튼 컴포넌트 추가`

**브랜치 보호 규칙**:

- **main**: 직접 푸시 금지, PR + 리뷰 필수
- **develop**: PR 권장

---

## 에이전트 사용 방법

### 기본 사용

**master-orchestrator**는 opencode 실행 시 자동으로 활성화되며, 사용자의 요청을 분석하여 적절한 subagent에게 작업을 위임합니다.

```bash
# opencode 실행
opencode

# 사용자 요청
"다크 모드를 지원하는 태그 필터 컴포넌트를 만들어줘"
```

master-orchestrator가 자동으로:

1. 요구사항 분석
2. 작업 분해 (feature-development + test-writing)
3. Git Flow 준비 (develop → feature branch → worktrees)
4. 병렬 실행 (feature-developer + test-specialist)
5. 결과 통합 및 PR 생성

### Git Flow + Worktree 방식

master-orchestrator는 **Git Flow 브랜치 전략**과 **worktrees**를 사용하여 각 subagent를 격리된 환경에서 실행합니다:

```
develop (base)
  └─ feature/dark-mode-button-20260207-143000
       ├─ worktree/feature-dev-20260207-143000  (feature-developer)
       ├─ worktree/test-spec-20260207-143000    (test-specialist)
       └─ worktree/security-20260207-143000     (security-scanner)
```

**장점**:

- ✅ 병렬 안전성: 각 agent가 독립적인 작업 환경 보장
- ✅ Git 충돌 없음: 각 worktree는 별도의 브랜치
- ✅ 자동 정리: 작업 완료 후 worktrees 자동 제거

### 병렬 vs 순차 실행

**병렬 실행** (독립적인 작업):

```
"태그 필터 컴포넌트를 만들고, 동시에 보안 취약점을 검사해줘"
→ feature-developer + security-scanner 동시 실행
```

```
"포스트 카드 컴포넌트를 개발하고, 동시에 문서를 검증하고, 보안 스캔도 해줘"
→ feature-developer + doc-manager + security-scanner 동시 실행 (3개 병렬)
```

```
"Contact 폼을 개발하고, 테스트 작성하고, 보안 검사까지 모두 해줘"
→ feature-developer 완료 후 → (test-specialist + security-scanner) 병렬 실행
```

**주요 병렬 조합**:

- `feature-developer + security-scanner`: 기능 개발과 보안 검증 동시 진행
- `feature-developer + doc-manager`: 기능 개발과 문서 업데이트 동시 진행
- `test-specialist + security-scanner`: 테스트 작성과 보안 스캔 동시 진행
- `test-specialist + doc-manager`: 테스트 작성과 문서 업데이트 동시 진행

**원칙**: 각 에이전트가 **다른 파일을 수정**하면 병렬 안전. 같은 파일을 수정하면 순차 실행 필요.

**순차 실행** (의존적인 작업):

```
"다크 모드 버튼을 만들고, 그 다음 E2E 테스트를 작성해줘"
→ feature-developer 완료 후 → test-specialist 실행
```

### 명시적 에이전트 지정

특정 에이전트를 명시적으로 사용하고 싶다면:

```
"feature-developer 에이전트를 사용하여 [기능]을 구현해줘"
"test-specialist 에이전트로 [컴포넌트] 테스트를 작성해줘"
```

---

## 에이전트 검증

에이전트 파일이 올바르게 작성되었는지 검증하려면:

```bash
bash ../.agents/skills/agent-identifier/scripts/validate-agent.sh feature-developer.md
```

## 에이전트 개발 가이드

새로운 에이전트를 추가하려면 Agent Development 스킬을 참고하세요:

```
/Agent Development
```

또는 `.agents/skills/agent-identifier/SKILL.md` 파일을 확인하세요.

## 프로젝트 컨텍스트

에이전트는 다음 프로젝트 규칙을 준수합니다:

### 기술 스택

- React 19, TanStack Router v1, Vite v7, TypeScript 5
- Tailwind CSS v4
- Vitest, Playwright, Storybook, fast-check

### 아키텍처

- Feature-Sliced Design (FSD) 패턴
- `routes → widgets → features → entities → shared`

### 코딩 규칙

- 한국어 주석 및 커밋 메시지
- TDD 필수
- Property-based 테스트 활용
- 타입 안정성 (any 금지)
- 보안 및 접근성 고려

자세한 내용은 [AI 코딩 에이전트 가이드](./agents.md) 참고.
