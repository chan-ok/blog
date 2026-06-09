# AI 코딩 에이전트 가이드

## 📋 목차

- [개요](#개요)
- [대상](#대상)
- [프로젝트 정보](#프로젝트-정보)
- [핵심 규칙 요약](#핵심-규칙-요약)
- [AI 답변 검증](#ai-답변-검증)
- [사용 가능한 플러그인 및 스킬](#사용-가능한-플러그인-및-스킬)
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

| 영역        | 핵심                                                    | 상세 문서                                        |
| ----------- | ------------------------------------------------------- | ------------------------------------------------ |
| 코드 스타일 | TypeScript strict, 컴포넌트 6단계, 명명 규칙            | [code-style.md](./code-style.md)                 |
| 아키텍처    | FSD 레이어 의존성, 역방향 import 금지, `@/` 경로 별칭   | [architecture-rules.md](./architecture-rules.md) |
| 테스팅      | TDD (Red/Green/Refactor), Property-based, 커버리지 80%+ | [testing.md](./testing.md)                       |
| 보안        | 환경변수 `VITE_*`, Zod 검증, XSS 방지, 입력 sanitize    | [security.md](./security.md)                     |
| 명령어      | `pnpm dev/test/lint/e2e/storybook`                      | [commands.md](./commands.md)                     |
| 언어/커밋   | 한국어 문서·주석·커밋, 영어 코드, Conventional Commits  | [language-rules.md](./language-rules.md)         |
| Git Flow    | `main ← develop ← feature`, Worktree 병렬 작업          | [git-flow.md](./git-flow.md)                     |
| 안티패턴    | `any` 금지, FSD 위반, 테스트 하드코딩                   | [anti-patterns.md](./anti-patterns.md)           |

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

## 사용 가능한 플러그인 및 스킬

### Superpowers (Claude Code 플러그인)

새 기능 기획 및 구현 시 다음 스킬을 적극 활용하세요:

| 스킬                          | 언제 사용         | 설명                                                 |
| ----------------------------- | ----------------- | ---------------------------------------------------- |
| `superpowers:brainstorming`   | 새 기능 기획 시작 | 아이디어 → 설계 → 스펙 문서 작성까지 대화형 진행     |
| `superpowers:writing-plans`   | 구현 계획 수립    | 스펙을 바탕으로 TDD 기반 bite-sized 태스크 플랜 생성 |
| `superpowers:executing-plans` | 플랜 실행         | 플랜 파일 로드 후 태스크별 순차 실행                 |

스펙은 `docs/superpowers/specs/`, 플랜은 `docs/superpowers/plans/`에 저장됩니다.

### Context7 MCP

라이브러리 최신 문서가 필요할 때 사용하세요. 학습 데이터가 오래된 경우를 대비합니다:

- TanStack Router, React Query, Zod, Tailwind v4, Vite 등 API 문법/설정
- 버전 마이그레이션, 라이브러리 디버깅
- 명령어: 라이브러리 이름 언급 시 자동으로 최신 문서 참조

### Figma MCP

디자인 참조가 필요할 때 Figma URL을 제공하면 설계 컨텍스트를 직접 읽어옵니다.

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
