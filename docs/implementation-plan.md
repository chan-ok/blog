# 블로그 구현 계획

## 기술 스택

### Framework

- Next.js 16
- React 19 (+react-compiler)

### Styling & HeadlessUI

- Tailwind CSS v4
- Base UI Components (@base-ui-components/react)

### Type Check

- Zod v4
- TypeScript 5

### Lint & Formatter

- ESLint 9
- Prettier
- Husky
- lint-staged

### Test

- Vitest
- testing-library/react
- Playwright
- Storybook (+Chromatic)

### Others

- MDX (@next/mdx, @mdx-js/react)
- rehype-highlight (코드 하이라이팅)
- Resend (이메일 발송)

## 진행 상황

### ✅ 완료된 작업

1. **개발 환경 세팅** (100%)
   - Next.js 16, React 19, TypeScript, Tailwind v4 설치 완료
   - ESLint, Prettier, Husky, lint-staged 설정 완료
   - Vitest, Playwright, Storybook + Chromatic 설정 완료

2. **국제화 라우팅 기본 구조** (80%)
   - `src/app/[locale]/layout.tsx` 구현
   - 3개 언어 지원 (`ko`, `ja`, `en`)
   - `src/proxy.ts`에서 브라우저 언어 감지 및 리다이렉션
   - 기본 locale 폴백 (ko)
   - Header, Footer, Navigation 컴포넌트 구성

3. **Home & About 페이지**
   - `contents/about.{locale}.md` 마크다운 파일 생성 (ko, ja, en)
   - About 컴포넌트 구현
   - Home 페이지에서 About 재사용

4. **Contact 폼 기본 구현**
   - Zod 스키마 기반 검증 (`ContactFormInputsSchema`)
   - Base UI Form 컴포넌트로 UI 구현
   - Cloudflare Turnstile 연동 (봇 방지)
   - 클라이언트 검증 로직 완료

5. **Posts 기본 구조**
   - MDX 렌더링 설정 (`@next/mdx`, `@mdx-js/react`)
   - rehype-highlight로 코드 하이라이팅
   - Post Card, Post Card List 컴포넌트 (mock 데이터)

6. **배포**
   - Netlify 배포 설정 완료 (`netlify.toml`)
   - 언어 폴백 로직 구현

### 🚧 진행 중인 작업

1. **Post 상세 페이지**
   - `/[locale]/posts/[slug]/page.tsx` 생성 중
   - SSG + revalidate 전략 필요
   - SEO 메타 설정 필요

2. **테스트**
   - E2E, Unit 테스트 일부 작성 중

### 📋 남은 작업

## 기능 개발

### 1. 국제화 완성

- [ ] 언어 스위처 컴포넌트 구현 (Navigation에 통합)
- [ ] `messages/{locale}.ts` 파일 구조 생성
- [ ] 모든 UI 텍스트 locale별로 분리

### 2. 홈페이지 개선

현재 Home은 About을 재사용하는 단순 구조. 블로그 홈페이지로서 다음 섹션 추가:

- [ ] 블로그 소개 섹션 (Hero Section)
- [ ] 최신 포스트 섹션 (Latest Posts)
- [ ] 인기 포스트 섹션 (Popular Posts)
- [ ] 이메일 구독 신청 폼 (Newsletter Subscription)

### 3. Posts 목록 페이지

- [ ] `contents/posts/{locale}/{slug}.md` 디렉토리 구조 생성
- [ ] Frontmatter 파서 유틸리티 구현
- [ ] 빌드 시 JSON 캐시 생성 (`scripts/generate-post-index.ts`)
- [ ] 실제 데이터 기반 Post Card List 렌더링
- [ ] 무한 스크롤 기능 구현

### 4. Post 상세 페이지

- [ ] Frontmatter 기반 SEO 메타 설정
- [ ] SSG + revalidate 전략 구현
- [ ] Published된 문서의 메타데이터를 JSON으로 저장
- [ ] AI 기능 (Gemini API 활용 예정):
  - [ ] AI 썸네일 자동 생성
  - [ ] AI 요약 생성
  - [ ] AI 추천 포스트 생성
  - [ ] AI 태그 자동 생성

### 5. Contact 폼 완성

- [ ] `/api/mail/route.ts` API 엔드포인트 구현 (Resend 활용)
- [ ] XSS 공격 방지 (이메일 데이터 sanitization)
- [ ] locale별 오류/성공 메시지 사전

### 6. 데이터 및 콘텐츠 파이프라인

1. `contents/posts/{locale}/{slug}.md` 구조 채택
2. 빌드 시 `scripts/generate-post-index.ts`로 frontmatter 파싱 → `.cache/posts.json`
3. Frontmatter `locale` 필드로 언어별 콘텐츠 동기화
4. Frontmatter `published` 필드로 게시 상태 제어

### 7. 에러 처리

- [ ] 404, 500 에러 페이지 구현
- [ ] 메인테넌스 페이지 구현

### 8. 차후 확장 로드맵

#### 댓글 시스템

- 비회원/회원 여부 결정
- 저장소 선택 (예: utterances, giscus)

#### 다크 모드

- Tailwind `data-theme` 설정
- Base UI theming 구현
- 다크 모드 토글 UI

#### 반응형 레이아웃

- Tailwind breakpoints 최적화
- 모바일/태블릿/데스크톱 레이아웃 테스트

#### TOC & 읽는 시간

- 마크다운 AST에서 헤딩 추출
- TOC (Table of Contents) 컴포넌트
- 단어 수 기반 ETA 계산
- 읽는 시간 표시 UI

#### 추가 기능

- 검색 기능
- 태그 필터
- RSS/Atom 피드
- Analytics 연동
- PWA 설정
