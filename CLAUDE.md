# CLAUDE.md

## 프로젝트 개요

- React 19 + TanStack Router v1 + Vite v7 + TypeScript 5 개인 블로그
- FSD(Feature-Sliced Design) 아키텍처
- 이중 리포지터리: `blog`(코드) + `blog-content`(MDX 콘텐츠, 별도 repo)
- 배포: Netlify (main 브랜치 자동 배포) — https://chan-ok.com

## FSD 레이어 의존성 (핵심 규칙)

```
pages(4) → widgets(3) → features(2) → entities(1) → shared(5)
```

각 레이어는 자신보다 낮은 번호의 레이어만 import 가능.

```
src/
├── 4-pages/     # 라우팅, 최소한의 로직
├── 3-widgets/   # 복합 UI (Header, Footer)
├── 2-features/  # 독립적인 비즈니스 기능 (model/, ui/, util/)
├── 1-entities/  # 비즈니스 엔티티 (markdown 등)
└── 5-shared/    # 공통 유틸, UI 컴포넌트, 훅
```

**절대 금지:**

- 역방향 import (예: `5-shared` → `2-features`)
- features 간 import (예: `2-features/post` → `2-features/contact`)

**새 기능 추가 순서:** shared → entities → features → widgets → pages

## 콘텐츠 파이프라인

- `blog-content`는 별도 리포지터리 — 이 repo에서 콘텐츠 수정 불가
- 런타임에 GitHub Raw URL로 MDX fetch → `@mdx-js/mdx`로 렌더링
- `index.json`은 GitHub Actions가 자동 생성 — 수동 수정 금지
- `VITE_GIT_RAW_URL` 환경변수 없으면 포스트 fetch 불가

## 주요 명령어

```bash
pnpm dev              # Vite 개발 서버 (localhost:5173)
pnpm dev:server       # Netlify Functions 포함 (localhost:8888)
pnpm test             # Vitest watch 모드
pnpm test run         # Vitest 1회 실행
pnpm lint             # ESLint
pnpm fmt              # Prettier
pnpm tsc --noEmit     # TypeScript 타입 체크
```

## 코드 규칙

### 언어

- 코드 식별자: 영어 (camelCase/PascalCase/kebab-case)
- 주석: 한국어 강력 권장
- 커밋: 한국어 필수, Conventional Commits 형식 (`feat(scope): 한국어 제목`)

### TypeScript

- `any` 타입 금지, strict mode 사용
- 타입 단언(`as`) 최소화, 타입 가드 선호

### Styling

- Tailwind CSS 유틸리티 우선
- 인라인 `style={{ ... }}` 사용 금지

### Import 순서 (4단계)

```typescript
// 1. React / TanStack Router
// 2. 외부 라이브러리
// 3. 내부 모듈 (@/*)
// 4. type import
```

## 환경변수

`.env.local`에 보관, 절대 커밋 금지:

- `VITE_GIT_RAW_URL` — blog-content GitHub Raw base URL (포스트 fetch에 필수)

## 패키지 매니저

`pnpm` 사용. npm, yarn 사용 금지.

## 참고 문서

| 문서                                                     | 내용                                          |
| -------------------------------------------------------- | --------------------------------------------- |
| [docs/architecture.md](docs/architecture.md)             | FSD 레이어 구조, 콘텐츠 파이프라인, 기술 스택 |
| [docs/architecture-rules.md](docs/architecture-rules.md) | FSD 의존성 규칙 상세                          |
| [docs/code-style.md](docs/code-style.md)                 | Import 순서, 명명 규칙, 컴포넌트 구조         |
| [docs/language-rules.md](docs/language-rules.md)         | 한국어 주석/커밋 규칙                         |
| [docs/commands.md](docs/commands.md)                     | 전체 명령어 목록                              |
| [docs/testing.md](docs/testing.md)                       | 테스트 전략 및 작성 가이드                    |
| [docs/test-optimization.md](docs/test-optimization.md)   | 테스트 최적화 기준 및 변경 요약               |
| [docs/development.md](docs/development.md)               | 개발 환경 설정 및 시작 가이드                 |
| [docs/git-flow.md](docs/git-flow.md)                     | 브랜치 전략 및 Git 워크플로우                 |
| [docs/anti-patterns.md](docs/anti-patterns.md)           | 피해야 할 패턴 모음                           |
| [docs/security.md](docs/security.md)                     | 보안 규칙 및 주의사항                         |
| [docs/agents.md](docs/agents.md)                         | AI 에이전트 코딩 가이드                       |
