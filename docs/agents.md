우리는 작업을 마크다운 대신 Beads로 관리해. `bd quickstart` 실행해서 어떻게 하는지 알아봐.

# AI 코딩 에이전트 가이드

## 📋 목차

- [개요](#개요)
- [대상](#대상)
- [프로젝트 정보](#프로젝트-정보)
- [핵심 규칙 요약](#핵심-규칙-요약)
- [AI 답변 검증](#ai-답변-검증)
- [에이전트 시스템](#에이전트-시스템)
- [참고 문서](#참고-문서)

## 개요

이 문서는 AI 코딩 에이전트(Claude, GitHub Copilot, Cursor 등)가 이 프로젝트에서 코드를 작성할 때 따라야 할 규칙과 가이드라인을 정의합니다. 프로젝트의 코드 품질과 일관성을 유지하기 위한 필수 지침입니다.

## 대상

### ✅ 포함 대상

- AI 코딩 에이전트 (Claude, GitHub Copilot, Cursor, Amazon Kiro 등)
- AI와 협업하는 개발자가 AI에게 제공할 컨텍스트로 활용
- 코드 작성, 테스트, 리팩토링 시 참고

### ❌ 제외 대상

- 처음 프로젝트를 설정하는 개발자 → [development.md](./development.md) 참고
- 프로젝트 구조를 이해하고 싶은 경우 → [architecture.md](./architecture.md) 참고
- 프로젝트 회고 및 의사결정을 확인하고 싶은 경우 → [retrospective/overview.md](./retrospective/overview.md) 참고

## 프로젝트 정보

### 기술 스택

- **프레임워크**: React 19, TanStack Router v1, Vite v7, TypeScript 5
- **스타일링**: Tailwind CSS v4
- **국제화**: i18next
- **상태 관리**: Zustand
- **검증**: Zod v4
- **콘텐츠**: MDX (gray-matter + rehype/remark)
- **테스팅**: Vitest, Playwright, Storybook 10, fast-check
- **배포**: Netlify

### 아키텍처

Feature-Sliced Design (FSD) 패턴 사용

```
pages → widgets → features → entities → shared
```

### 리포지터리 구조

- **blog** (현재): React + TanStack Router 애플리케이션
- **blog-content**: MDX 콘텐츠 저장소 (분리됨)

## 핵심 규칙 요약

| 영역 | 핵심 | 상세 문서 |
|------|------|-----------|
| 코드 스타일 | Import 4단계, TypeScript strict, 컴포넌트 6단계, Tailwind 8단계 | [code-style.md](./code-style.md) |
| 아키텍처 | FSD 레이어 의존성, 역방향 import 금지, `@/` 경로 별칭 | [architecture-rules.md](./architecture-rules.md) |
| 테스팅 | TDD (Red/Green/Refactor), Property-based, 커버리지 80%+ | [testing.md](./testing.md) |
| 보안 | 환경변수 `VITE_*`, Zod 검증, XSS 방지, 입력 sanitize | [security.md](./security.md) |
| 명령어 | `pnpm dev/test/lint/e2e/storybook` | [commands.md](./commands.md) |
| 언어/커밋 | 한국어 문서·주석·커밋, 영어 코드, Conventional Commits | [language-rules.md](./language-rules.md) |
| Git Flow | `main ← develop ← feature`, Worktree 병렬 작업 | [git-flow.md](./git-flow.md) |
| 안티패턴 | `any` 금지, FSD 위반, 테스트 하드코딩 | [anti-patterns.md](./anti-patterns.md) |
| 에이전트 | 9개 전문 에이전트, 병렬·순차 실행 | [agent-system.md](./agent-system.md) |

## AI 답변 검증

### 정보 정확성

- ✅ 실제 파일/함수 확인
- ✅ 공식 문서와 대조
- ❌ 환각(hallucination) 경계 - 존재하지 않는 함수/API 확인

### 재사용성

- 기존 컴포넌트/유틸 우선 재사용
- 중복 코드 생성 지양
- 프로젝트에 이미 설치된 라이브러리 활용

### 오버엔지니어링 방지

- 현재 요구사항에 집중
- 불필요한 추상화 지양
- YAGNI / KISS 원칙 준수

### 검증 프로세스

1. **즉시 검증**: AI 답변 직후 체크리스트 확인
2. **코드 적용 전**: 관련 항목 집중 검증
3. **실행 테스트**: 코드 적용 후 동작 확인
4. **반복**: 문제 발견 시 수정 요청

## 에이전트 시스템

이 프로젝트는 멀티 에이전트 시스템을 사용합니다. 각 에이전트는 특정 작업을 자율적으로 수행하는 전문화된 AI 도우미입니다.

### 에이전트 호출 제약사항

1. ❌ master-orchestrator는 master-orchestrator를 서브에이전트로 호출할 수 없습니다.

- 현재 위치가 master-orchestrator인 경우, 다른 서브에이전트만 호출 가능

2. ❌ 서브에이전트는 .agents/agents/ 내의 다른 서브에이전트를 호출할 수 없습니다

### 에이전트 역할 요약

| 에이전트 | 역할 | 사용 시기 |
|----------|------|-----------|
| master-orchestrator | 프로젝트 관리·조율 (코드 직접 작성 안함) | 복잡한 기능, 병렬 처리 |
| feature-developer | 기능 개발 (테스트 코드 작성 안함) | UI, 비즈니스 로직, Form |
| test-specialist | 테스트 코드 작성 | Unit/E2E/Property-based/Storybook |
| doc-manager | 문서 정확성·최신성 관리 | 문서 검증, 업데이트 |
| lint-formatter | 포매팅·린트 에러 수정 | ESLint/Prettier |
| git-guardian | Git 워크플로우 관리 | 커밋, 충돌 해결, 브랜치 |
| github-helper | GitHub CLI 통합 | PR, CI/CD, Issue |
| tech-architect | 결과물 품질 + 보안 취약점 검증 (읽기 전용) | Phase 완료 후 검증, 보안 스캔 |
| retrospector | 회고 분석·프롬프트 개선 | PR 후 회고 |

→ 상세: [agent-system.md](./agent-system.md)

## 참고 문서

- [development.md](./development.md) - 개발 시작 및 환경 설정
- [architecture.md](./architecture.md) - FSD 구조 상세 설명
- [retrospective/overview.md](./retrospective/overview.md) - 프로젝트 회고 및 의사결정 로그
- [code-style.md](./code-style.md) - 코드 스타일 가이드
- [architecture-rules.md](./architecture-rules.md) - 아키텍처 규칙
- [testing.md](./testing.md) - 테스팅 가이드
- [security.md](./security.md) - 보안 가이드
- [commands.md](./commands.md) - 명령어 레퍼런스
- [language-rules.md](./language-rules.md) - 언어 및 커밋 규칙
- [git-flow.md](./git-flow.md) - Git Flow 가이드
- [anti-patterns.md](./anti-patterns.md) - 안티패턴 목록
- [agent-system.md](./agent-system.md) - 에이전트 시스템 상세
- [agent-permissions.md](./agent-permissions.md) - 에이전트별 권한 분리 가이드

---

## v4 멀티 에이전트 시스템 (추가)

> **Note**: 위 9개 에이전트(master-orchestrator 등)는 v3 시스템입니다.  
> v4는 **tmux 기반 경량 아키텍처**로 전환하여 **4종 에이전트**만 사용합니다.

### v4 에이전트 역할 요약

| 에이전트 | 역할 | 사용 시기 |
|----------|------|-----------|
| **컨설턴트** | 사람 대면, 요구사항 수집 및 최종 보고 | 프로젝트 시작, 요구사항 변경 |
| **작업관리자** | beads 태스크 관리 (분해/할당/추적) | 작업 할당, 블로커 해결 |
| **명세서관리자** | spec 파일 검증 (FSD/보안/테스트) | 명세서 생성 후, 품질 게이트 |
| **작업자** | 코드/테스트 작성 (최대 3개 동시) | 실제 구현, Git commit |

### v4 아키텍처 특징

- **경량화**: tmux + opencode + watchman + beads만 사용 (K8s 불필요)
- **즉시 시작**: 터미널 pane 생성만으로 에이전트 실행
- **투명성**: 모든 에이전트 동작을 tmux에서 실시간 확인
- **파일 기반 통신**: 명세서 파일 + beads 태스크 + 상태 파일

### 시작 방법

```bash
# tmux 세션 시작 (6-pane 레이아웃)
bash scripts/start-multi-agent.sh

# watchman 트리거 설정
bash scripts/setup-watchman.sh
```

→ 상세: [agent-system.md#v4-멀티-에이전트-시스템-tmux-기반](./agent-system.md#v4-멀티-에이전트-시스템-tmux-기반)  
→ 전체 설계: [architecture/multi-agent-system.md](./architecture/multi-agent-system.md)
