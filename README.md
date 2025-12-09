# Chanho's Dev Blog

[![Netlify Status](https://api.netlify.com/api/v1/badges/d52613d2-028c-4166-bd14-b7784176e05e/deploy-status)](https://app.netlify.com/projects/chanho-dev-blog/deploys)

## 📖 프로젝트 소개

개인용 개발 블로그 운영을 위한 환경입니다.

### 목적

- 📚 **개인용 개발 블로그 운영**
- 🚀 **모던한 프론트엔드 기술스택 체득**
- 🌐 **기술 지식 공유**

### 아키텍처

블로그는 두 개의 독립적인 리포지터리로 구성됩니다:

- **[blog](https://github.com/chan-ok/blog)** (현재 리포지터리) - Next.js 16 기반 블로그 애플리케이션
- **[blog-content](https://github.com/chan-ok/blog-content)** - MDX 형식의 포스트 콘텐츠 저장소

#### 배포 및 포스팅 워크플로우

```mermaid
graph LR
    A[blog 리포지터리] -->|main 브랜치 push| B[Netlify 자동 배포]
    C[blog-content 리포지터리] -->|main 브랜치 push| D[GitHub Actions]
    D -->|generate-index.ts| E[index.json 생성]
    B -->|fetch| E
    B -->|렌더링| F[GitHub Raw URL]
```

1. **블로그 개발**: `blog` 리포지터리의 `main` 브랜치에 push 시 Netlify에 자동 배포
2. **포스트 작성**: `blog-content` 리포지터리의 `main` 브랜치에 push 시 GitHub Actions가 인덱싱 파일(`index.json`) 자동 생성
3. **콘텐츠 렌더링**: 블로그에서 `blog-content`의 인덱싱 파일을 참조하여:
   - 페이지네이션 처리
   - 태그 필터링
   - GitHub Raw URL을 통한 마크다운 렌더링

## 🚀 기술 스택

### Core

- **Next.js 16** - React 프레임워크
- **React 19** (+ React Compiler) - UI 라이브러리
- **TypeScript 5** - 타입 안전성

### Styling & UI

- **Tailwind CSS v4** - 유틸리티 CSS 프레임워크
- **Base UI Components** - HeadlessUI 컴포넌트

### Content

- **MDX** - 마크다운 + JSX
- **next-mdx-remote-client** - 원격 MDX 렌더링
- **rehype-highlight** - 코드 하이라이팅
- **remark-gfm** - GitHub Flavored Markdown

### Form & Validation

- **Zod v4** - 스키마 검증
- **Cloudflare Turnstile** - 봇 방지
- **Resend** - 이메일 전송

### Testing

- **Vitest** - 유닛 테스트
- **Playwright** - E2E 테스트
- **Testing Library** - 컴포넌트 테스트
- **Storybook** (+ Chromatic) - UI 컴포넌트 문서화

### Code Quality

- **ESLint 9** - 린터
- **Prettier** - 포맷터
- **Husky** - Git hooks
- **lint-staged** - Pre-commit 린팅

## 📦 Getting Started

의존성 설치:

```bash
pnpm install
```

개발 서버 실행:

```bash
# http://localhost:3000
pnpm dev
```

프론트엔드와 Netlify Functions를 함께 실행:

```bash
# http://localhost:8888
pnpm dev:server
```

## 🛠️ Available Scripts

```bash
pnpm dev              # 개발 서버 시작
pnpm dev:server       # Netlify Functions와 함께 개발 서버 시작
pnpm build            # 프로덕션 빌드
pnpm start            # 프로덕션 서버 시작
pnpm lint             # ESLint 실행
pnpm fmt              # Prettier 포맷팅
pnpm test             # Vitest 테스트 실행
pnpm coverage         # 테스트 커버리지 확인
pnpm e2e              # Playwright E2E 테스트
pnpm storybook        # Storybook 실행
pnpm build-storybook  # Storybook 빌드
```

## 🌏 기능 현황

### ✅ 구현 완료

- 🚀 **Netlify 배포**
- 🌐 **URL 기반 다국어 지원** (한국어, 일본어, 영어)
- 🎨 **MDX 렌더링** (코드 하이라이팅 포함)
- 🔗 **콘텐츠 파이프라인** (GitHub Raw URL 기반 원격 MDX 렌더링)
- 📝 **About 페이지** (마크다운 기반)
- 📰 **Posts 페이지** (blog-content 리포지터리 연동)
- 💬 **Contact 폼** (Zod 검증 + Turnstile + Resend)

### 📋 예정 기능

- 🌙 **다크 모드**
  - 최초 시스템 설정 기반 인식
  - SessionStorage에 사용자 선택 보존
  - Zustand를 활용한 상태 관리
- 📚 **마크다운 고급화**
  - 코드 블록 개선
  - TOC (Table of Contents)
  - Reading time 표시
- 🔍 **언어 선택기**
  - 최초 브라우저 설정 기반 인식
  - LocalStorage에 사용자 선택 보존
  - Zustand를 활용한 상태 관리
- 🏠 **홈화면 디자인 개선**
  - 최신 포스트 카드
  - 인기 포스트
  - 구독 폼

## 🤖 Kiro Agent Hooks

프로젝트에는 개발 워크플로우를 자동화하는 **스마트 트리거 기반** Agent Hooks가 설정되어 있습니다.

### 자동 트리거 훅

#### 🎨 Auto Storybook Story Generator

새 컴포넌트 생성 시 자동으로 Storybook 스토리 파일을 생성합니다.

- **트리거**: `src/**/*.tsx` 파일 생성 시 자동 실행
- **제외**: `*.test.tsx`, `*.stories.tsx`, `page.tsx`, `layout.tsx`

#### 🧪 Auto Test on Save (선택적)

파일 저장 시 관련 테스트를 자동으로 실행합니다.

- **트리거**: `src/**/*.{ts,tsx}` 파일 저장 시
- **상태**: 기본 비활성화 (`.kiro/hooks.json`에서 활성화 가능)

### 수동 실행 훅

#### ✅ 코드 품질 검증

포맷팅, 린트, 타입 체크를 순차적으로 실행합니다.

- **사용법**: Kiro 패널 → Agent Hooks → "코드 품질 검증"
- **권장**: 커밋 전 실행

#### 📝 문서 자동 업데이트

Git 변경사항을 분석하여 관련 문서를 자동으로 업데이트합니다.

- **사용법**: Kiro 패널 → Agent Hooks → "문서 자동 업데이트"
- **권장**: 기능 완성 후 실행

#### 🔍 커밋 전 검증

커밋 전 코드 품질과 테스트를 자동으로 검증합니다.

- **사용법**: Kiro 패널 → Agent Hooks → "커밋 전 검증"
- **실행**: Prettier + ESLint + TypeScript 체크

### 설정 파일

- **훅 설정**: `.kiro/hooks.json` - 트리거 조건 및 활성화 설정
- **훅 프롬프트**: `.kiro/hooks/*.md` - 각 훅의 실행 로직

**자세한 사용법**: [Agent Hooks 가이드](./docs/hooks-guide.md) 참고

---

## 📚 Documentation

### 핵심 문서

- [아키텍처 가이드](./docs/architecture.md) - 프로젝트 구조와 설계 결정
- [배포 가이드](./docs/deployment.md) - 배포 프로세스 및 환경 설정
- [테스팅 가이드](./docs/testing.md) - 테스트 전략 및 베스트 프랙티스
- [Agent Hooks 가이드](./docs/hooks-guide.md) - 개발 자동화 훅 사용법

### 개발 문서

- [절대 규칙](./docs/rule.md)
- [기술 스택 및 구현 계획](./docs/implementation-plan.md)
- [AI 에이전트 체크리스트](./docs/ai-checklist.md)
- [개발 TODO](./docs/todo.md)
- [변경 이력](./docs/changelog.md)

## 📄 License

MIT
