# Chanho's Dev Blog

[![Netlify Status](https://api.netlify.com/api/v1/badges/d52613d2-028c-4166-bd14-b7784176e05e/deploy-status)](https://app.netlify.com/projects/chanho-dev-blog/deploys)

개인 블로그 프로젝트입니다. Next.js 16과 React 19를 사용하여 제작되었으며, Netlify에 배포됩니다.

## 🚀 Tech Stack

### Core

- **Next.js 16** - React 프레임워크
- **React 19** (+ React Compiler) - UI 라이브러리
- **TypeScript 5** - 타입 안전성

### Styling & UI

- **Tailwind CSS v4** - 유틸리티 CSS 프레임워크
- **Base UI Components** - HeadlessUI 컴포넌트

### Content

- **MDX** - 마크다운 + JSX
- **rehype-highlight** - 코드 하이라이팅

### Form & Validation

- **Zod v4** - 스키마 검증
- **Cloudflare Turnstile** - 봇 방지

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
netlify dev
```

## 🛠️ Available Scripts

```bash
pnpm dev          # 개발 서버 시작
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버 시작
pnpm lint         # ESLint 실행
pnpm fmt          # Prettier 포맷팅
pnpm test         # Vitest 테스트 실행
pnpm coverage     # 테스트 커버리지 확인
pnpm e2e          # Playwright E2E 테스트
pnpm storybook    # Storybook 실행
```

## 🌏 Features

### ✅ 구현 완료

- 🌐 **URL기반 다국어 지원** (한국어, 일본어, 영어)
- 📝 **About 페이지** (마크다운 기반)
- 💬 **Contact 폼** (Zod 검증 + Turnstile)
- 🎨 **MDX 렌더링** (코드 하이라이팅 포함)
- 🚀 **Netlify 배포**

### 🚧 진행 중

- 🔍 **언어 스위처**
- 📰 **Posts 상세 페이지**
- 🧪 **테스트 코드 작성**

### 📋 예정

- 📚 **Posts 콘텐츠 파이프라인**
- 💬 **댓글 시스템**
- 🌙 **다크 모드**
- 🏠 **홈페이지 개선** (최신 포스트, 인기 포스트, 구독 폼)
- 🤖 **AI 기능** (썸네일/요약/태그 자동 생성)s
- 📖 **TOC & 읽는 시간**

## 📚 Documentation

- [기술 스택 및 구현 계획](./docs/implementation-plan.md)
- [개발 TODO](./docs/todo.md)

## 📄 License

MIT
