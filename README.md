# Chanho's Dev Blog

[![Netlify Status](https://api.netlify.com/api/v1/badges/d52613d2-028c-4166-bd14-b7784176e05e/deploy-status)](https://app.netlify.com/projects/chanho-dev-blog/deploys)

React 19, TanStack Router, Vite 8로 만든 한국어·일본어 개인 블로그입니다. 애플리케이션 코드는 이 리포지터리에서, 포스트는 별도 [`blog-content`](https://github.com/chan-ok/blog-content) 리포지터리에서 관리합니다.

## 주요 기능

- `/ko`, `/ja` 로케일 라우팅과 언어 전환
- 소개와 최근 포스트를 함께 보여 주는 홈
- 원격 Markdown 포스트 목록·상세 페이지
- GFM, 코드 하이라이팅, Mermaid, Obsidian 이미지, 목차 렌더링
- 프로덕션 포스트 공개 정책과 상세 URL 차단
- 반응형 레이아웃과 시스템 다크 모드

## 기술 스택

| 영역        | 기술                                     |
| ----------- | ---------------------------------------- |
| UI·라우팅   | React 19, TanStack Router                |
| 빌드·타입   | Vite 8, TypeScript, React Compiler       |
| 스타일      | Tailwind CSS 4                           |
| 콘텐츠      | react-markdown, remark/rehype, YAML, Zod |
| 데이터·상태 | Fetch API, Zustand, i18next              |
| 테스트      | Vitest, Playwright                       |
| 품질        | oxlint, oxfmt, Husky, lint-staged        |
| 배포        | Netlify                                  |

## 빠른 시작

지원 개발 환경은 Node.js 24 LTS와 pnpm 11.18.0입니다. `.nvmrc`, `engines`, `packageManager`가 로컬과 배포 환경의 도구 버전을 고정합니다.

```bash
git clone https://github.com/chan-ok/blog.git
cd blog
pnpm install
```

프로젝트 루트에 `.env.local`을 만듭니다.

```dotenv
VITE_GIT_RAW_URL=https://raw.githubusercontent.com/chan-ok/blog-content/main
```

`VITE_*` 값은 브라우저 번들에 포함될 수 있으므로 비밀값을 넣지 마세요.

```bash
pnpm dev
```

기본 개발 주소는 `http://localhost:5173`입니다. 자세한 절차는 [개발 가이드](./docs/development.md)를 참고하세요.

## 명령어

```bash
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드
pnpm preview      # 빌드 결과 미리보기
pnpm typecheck    # 타입 검사
pnpm lint         # 린트
pnpm fmt          # src 포맷팅
pnpm test         # Vitest watch
pnpm test:once    # Vitest 1회 실행
```

브라우저 반응형 테스트는 별도 package script 없이 프로젝트 안의 Playwright 설정을 직접 사용합니다.

```bash
pnpm exec playwright test --config playwright.config.ts
```

전체 설명은 [명령어 레퍼런스](./docs/commands.md)에 있습니다.

## 구조

```text
src/
├── app/                 # 진입점, 전역 스타일, TanStack Router 라우트
├── entities/            # Markdown 모델·파서·렌더러
├── features/            # 포스트 목록·상세 기능
└── shared/              # 레이아웃, UI, 로케일, 공통 유틸
tests/
└── browser/             # Playwright 브라우저 테스트
docs/                    # 현재 가이드와 과거 설계 기록
```

레이어 의존성은 `app → features → entities → shared` 방향을 따릅니다. 자세한 내용은 [아키텍처 가이드](./docs/architecture.md)와 [아키텍처 규칙](./docs/architecture-rules.md)을 참고하세요.

## 콘텐츠 흐름

1. 홈과 목록은 `VITE_GIT_RAW_URL/<locale>/index.json`을 가져옵니다.
2. 상세 페이지는 정규화한 경로의 `.mdx`를 요청하고 필요하면 `.md`로 다시 시도합니다.
3. YAML frontmatter를 파싱·검증하고 본문은 실행하지 않는 Markdown으로 렌더링합니다.
4. 프로덕션에서는 `published: true`이며 `test`, `draft` 태그가 없는 포스트만 노출합니다.

콘텐츠를 추가하거나 수정하려면 [`blog-content`](https://github.com/chan-ok/blog-content)에서 작업하세요.

## 문서

| 문서                                                          | 설명                                 |
| ------------------------------------------------------------- | ------------------------------------ |
| [architecture.md](./docs/architecture.md)                     | 현재 구조와 콘텐츠 흐름              |
| [development.md](./docs/development.md)                       | 설치, 개발, 테스트, Git 훅           |
| [commands.md](./docs/commands.md)                             | 실제 package script와 직접 실행 명령 |
| [security.md](./docs/security.md)                             | 환경 변수와 원격 Markdown 보안 경계  |
| [agents.md](./docs/agents.md)                                 | AI 에이전트 작업 기준                |
| [architecture-rules.md](./docs/architecture-rules.md)         | 레이어 의존성 규칙                   |
| [code-style.md](./docs/code-style.md)                         | TypeScript·React 코드 스타일         |
| [anti-patterns.md](./docs/anti-patterns.md)                   | 피해야 할 구현 방식                  |
| [git-flow.md](./docs/git-flow.md)                             | Git 작업 방식                        |
| [language-rules.md](./docs/language-rules.md)                 | 문서·코드·커밋 언어 규칙             |
| [retrospective/overview.md](./docs/retrospective/overview.md) | 과거 의사결정과 회고                 |

## 참고 자료

- [React](https://react.dev/)
- [TanStack Router](https://tanstack.com/router/latest)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [react-markdown](https://github.com/remarkjs/react-markdown)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
