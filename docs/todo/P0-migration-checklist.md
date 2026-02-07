---
priority: P0
title: Next.js → TanStack Router 마이그레이션 체크리스트
description: CSR Only 방식의 실행 체크리스트 (최우선)
created: 2026-02-07
updated: 2026-02-07
status: in-progress
related:
  - P1-migration-plan.md
  - ../project-log.md
---

# ✅ Next.js → TanStack Router (CSR) 마이그레이션 체크리스트

> **프로젝트**: Chanho's Dev Blog  
> **작성일**: 2026-02-07  
> **버전**: 2.0.0 (CSR Only)  
> **진행 상태**: 🔄 준비 중

**📖 참조 문서**: [P1-migration-plan.md](./P1-migration-plan.md) (상세 구현 가이드)

---

## 📋 Pre-Migration (사전 준비)

- [ ] 현재 프로젝트 백업
  - [ ] Git 브랜치 생성: `migration/tanstack-router`
  - [ ] 로컬 백업 (zip 파일)
- [ ] TanStack Router 공식 문서 최신 버전 확인
- [ ] 개발 환경 테스트
  - [ ] Node.js 버전 확인 (v18+)
  - [ ] pnpm 버전 확인 (v9+)
- [ ] Netlify 환경 변수 백업
- [ ] 현재 사이트 스크린샷 저장 (비교용)

---

## 🔧 Phase 1: 환경 설정 (1-2일)

### 1.1 패키지 제거

- [ ] Next.js 관련 패키지 제거
  ```bash
  pnpm remove next next-mdx-remote-client eslint-config-next @netlify/plugin-nextjs @storybook/nextjs-vite
  ```
- [ ] node_modules 삭제 및 재설치
  ```bash
  rm -rf node_modules pnpm-lock.yaml && pnpm install
  ```

### 1.2 패키지 설치

- [ ] TanStack Router 설치
  ```bash
  pnpm add @tanstack/react-router @tanstack/router-devtools
  ```
- [ ] 빌드 도구 설치
  ```bash
  pnpm add -D vite @vitejs/plugin-react vite-tsconfig-paths @tanstack/router-vite-plugin
  ```
- [ ] MDX 설치
  ```bash
  pnpm add @mdx-js/mdx @mdx-js/react
  ```
- [ ] 이미지 최적화 도구
  ```bash
  pnpm add -D sharp vite-plugin-image-optimizer
  ```
- [ ] Storybook 프레임워크 변경
  ```bash
  pnpm add -D @storybook/react-vite
  ```

### 1.3 설정 파일 생성/수정

- [ ] `vite.config.ts` 생성
  - [ ] React 플러그인
  - [ ] TanStack Router 플러그인
  - [ ] tsconfig paths
  - [ ] Image optimizer 플러그인
  - [ ] alias 설정 (`@` → `/src`)
- [ ] `tsconfig.json` 수정
  - [ ] `types`: `["vite/client", "@tanstack/react-router"]`
  - [ ] `moduleResolution`: `"bundler"`
  - [ ] `paths` 확인
- [ ] `index.html` 생성 (루트)
  - [ ] `<div id="root">`
  - [ ] `<script type="module" src="/src/main.tsx">`
- [ ] `.gitignore` 업데이트
  - [ ] `.next/` 제거
  - [ ] `dist/` 추가
  - [ ] `.vinxi/` 제거

### 1.4 package.json 스크립트 수정

- [ ] `dev`: `vite`
- [ ] `build`: `vite build`
- [ ] `preview`: `vite preview`
- [ ] `optimize:images`: `node scripts/optimize-images.js`
- [ ] `prebuild`: `pnpm optimize:images`

### 1.5 환경 변수 변경

- [ ] `.env` 파일 수정
  - [ ] `NEXT_PUBLIC_*` → `VITE_*`
  - [ ] `VITE_GIT_RAW_URL`
  - [ ] `VITE_CONTENT_REPO_URL`
  - [ ] `VITE_TURNSTILE_SITE_KEY`
- [ ] 코드에서 환경 변수 참조 변경
  - [ ] `process.env.NEXT_PUBLIC_*` → `import.meta.env.VITE_*`
  - [ ] 전체 검색: `rg "process\.env\.NEXT_PUBLIC"`

### 1.6 개발 서버 실행 테스트

- [ ] `pnpm dev` 실행 확인 (에러 무시)
- [ ] Vite가 5173 포트에서 실행되는지 확인

---

## 🗺️ Phase 2: 라우팅 구조 마이그레이션 (2-3일)

### 2.1 디렉토리 구조 생성

- [ ] `src/routes/` 디렉토리 생성
- [ ] `src/routes/$locale/` 디렉토리 생성
- [ ] `src/routes/$locale/posts/` 디렉토리 생성
- [ ] 기존 `src/app/` 디렉토리 삭제 (백업 후)

### 2.2 엔트리포인트 생성

- [ ] `src/main.tsx` 생성
  - [ ] RouterProvider 설정
  - [ ] routeTree import
  - [ ] globals.css import
  - [ ] StrictMode
  - [ ] createRoot

### 2.3 Root 라우트

- [ ] `src/routes/__root.tsx` 생성
  - [ ] `<html>`, `<head>`, `<body>` 구조
  - [ ] 메타 태그 (charset, viewport)
  - [ ] 타이틀
  - [ ] Google Fonts 링크 (Noto Sans, Noto Sans KR, Noto Sans JP)
  - [ ] Cloudflare Turnstile 스크립트
  - [ ] TanStackRouterDevtools (dev 환경만)
  - [ ] Outlet 컴포넌트

### 2.4 인덱스 리다이렉트

- [ ] `src/routes/index.tsx` 생성
  - [ ] locale 감지 로직 (쿠키 → 브라우저 → 기본값 'ko')
  - [ ] `/$locale`로 리다이렉트

### 2.5 Locale 레이아웃

- [ ] `src/routes/$locale.tsx` 생성
  - [ ] useParams로 locale 추출
  - [ ] ThemeProvider
  - [ ] LocaleProvider
  - [ ] Header, Footer 배치
  - [ ] Outlet

### 2.6 페이지 라우트

- [ ] `src/routes/$locale/index.tsx` (홈)
  - [ ] loader: getPosts (최근 5개)
  - [ ] component: AboutBlock + RecentPostBlock
- [ ] `src/routes/$locale/about.tsx`
  - [ ] loader: getMarkdown (GitHub README)
  - [ ] component: MDXComponent
- [ ] `src/routes/$locale/contact.tsx`
  - [ ] component: ContactForm
  - [ ] loader 불필요
- [ ] `src/routes/$locale/posts/index.tsx` (목록)
  - [ ] loader: getPosts (전체)
  - [ ] component: PostCardList
- [ ] `src/routes/$locale/posts/$.tsx` (상세, catch-all)
  - [ ] loader: getMarkdown (slug 기반)
  - [ ] component: MDXComponent + Reply

### 2.7 라우팅 테스트

- [ ] `pnpm dev` 실행
- [ ] `/` 접근 → `/ko` 리다이렉트 확인
- [ ] `/ko`, `/en`, `/ja` 접근 확인
- [ ] `/ko/posts` 목록 페이지
- [ ] `/ko/posts/test-slug` 상세 페이지
- [ ] `/ko/about` 페이지
- [ ] `/ko/contact` 페이지
- [ ] 존재하지 않는 경로 404 확인

---

## 📝 Phase 3: MDX 처리 마이그레이션 (1일)

### 3.1 getMarkdown 유틸 수정

- [ ] `src/entities/markdown/util/get-markdown.ts` 열기
- [ ] `@mdx-js/mdx`의 `compile` import
- [ ] `process.env.NEXT_PUBLIC_GIT_RAW_URL` → `import.meta.env.VITE_GIT_RAW_URL`
- [ ] `compile` 함수로 MDX 컴파일
  - [ ] `outputFormat: 'function-body'`
  - [ ] remarkPlugins 설정
  - [ ] rehypePlugins 설정
- [ ] 반환값: `{ source: String(compiled), frontmatter }`

### 3.2 MDXComponent 수정

- [ ] `src/entities/markdown/index.tsx` 열기
- [ ] `next-mdx-remote-client` 제거
- [ ] `react/jsx-runtime` import
- [ ] `useMemo`로 런타임 실행
  - [ ] `new Function(source)(runtime)`
  - [ ] `Component` 추출
- [ ] 커스텀 컴포넌트 적용 (Typography, Code)

### 3.3 MDX 렌더링 테스트

- [ ] 포스트 상세 페이지에서 MDX 렌더링 확인
- [ ] 코드 하이라이팅 확인
- [ ] 타이포그래피 스타일 확인 (h1-h5)
- [ ] GFM 기능 확인 (테이블, 체크박스)
- [ ] frontmatter 메타데이터 표시 확인

---

## 🎨 Phase 4: 컴포넌트 수정 (1-2일)

### 4.1 OptimizedImage 컴포넌트 생성

- [ ] `src/shared/components/ui/image/index.tsx` 생성
- [ ] `<picture>` 태그 사용
  - [ ] `<source srcSet="*.avif" type="image/avif" />`
  - [ ] `<source srcSet="*.webp" type="image/webp" />`
  - [ ] `<img>` fallback
- [ ] props: src, alt, width, height, priority
- [ ] `loading` 속성 (priority ? 'eager' : 'lazy')

### 4.2 모든 next/image 교체

- [ ] 검색: `rg "from 'next/image'"`
- [ ] 교체 대상 파일 목록 작성
  - [ ] `src/features/post/ui/post-basic-card.tsx`
  - [ ] 기타 사용 위치
- [ ] `next/image` → `@/shared/components/ui/image`로 변경
- [ ] `Image` → `OptimizedImage`
- [ ] props 확인 (layout, objectFit 등 제거)

### 4.3 Link 컴포넌트 수정

- [ ] `src/shared/components/ui/link/index.tsx` 열기
- [ ] `next/link` → `@tanstack/react-router`의 `Link`
- [ ] `href` prop → `to` prop (내부적으로)
- [ ] locale 자동 추가 로직 유지
- [ ] 테스트 (내부 링크, 외부 링크, 앵커)

### 4.4 Header 컴포넌트 수정

- [ ] `src/widgets/header.tsx` 열기
- [ ] `'use client'` 지시어 제거
- [ ] `useRouter` (Next.js) → `useLocation` (TanStack Router)
- [ ] pathname 접근 방식 확인

### 4.5 모든 'use client', 'use server' 지시어 제거

- [ ] 전체 검색
  ```bash
  rg "'use (client|server)'" --files-with-matches
  ```
- [ ] 제거 대상 파일 목록
  - [ ] `src/widgets/header.tsx`
  - [ ] `src/features/contact/ui/contact-form.tsx`
  - [ ] `src/features/post/ui/recent-post-block.tsx`
  - [ ] 기타 파일들
- [ ] 수동으로 각 파일 열어서 제거

### 4.6 환경 변수 참조 변경

- [ ] 전체 검색
  ```bash
  rg "process\.env\.NEXT_PUBLIC"
  ```
- [ ] `process.env.NEXT_PUBLIC_*` → `import.meta.env.VITE_*`
- [ ] 타입 선언 파일 수정
  - [ ] `src/shared/types/global.d.ts`
  - [ ] `ProcessEnv` → `ImportMetaEnv`

### 4.7 컴포넌트 테스트

- [ ] Link 컴포넌트 동작 확인
- [ ] Image 컴포넌트 렌더링 확인
- [ ] Header 스크롤 감지 동작 확인
- [ ] Theme 전환 동작 확인
- [ ] Locale 전환 동작 확인

---

## 🖼️ Phase 5: 이미지 최적화 (Sharp) (1일)

### 5.1 Sharp 스크립트 작성

- [ ] `scripts/optimize-images.js` 생성
- [ ] sharp, glob import
- [ ] `public/image/**/*.{jpg,jpeg,png}` 검색
- [ ] 각 이미지에 대해:
  - [ ] WebP 변환 (quality: 80)
  - [ ] AVIF 변환 (quality: 70)
  - [ ] 진행 상황 로그

### 5.2 스크립트 테스트

- [ ] `pnpm optimize:images` 실행
- [ ] `public/image/` 디렉토리 확인
  - [ ] `.webp` 파일 생성 확인
  - [ ] `.avif` 파일 생성 확인
- [ ] 용량 비교 (원본 vs WebP vs AVIF)

### 5.3 빌드 통합

- [ ] `package.json`의 `prebuild` 스크립트 확인
- [ ] `pnpm build` 실행 시 자동으로 이미지 최적화 확인

### 5.4 .gitignore 업데이트

- [ ] 최적화된 이미지 파일 Git 추적 여부 결정
  - [ ] 옵션 1: Git에 포함 (배포 빠름)
  - [ ] 옵션 2: Git에서 제외 (빌드 시 생성)
- [ ] 선택한 옵션에 따라 `.gitignore` 수정

---

## 🌐 Phase 6: 웹폰트 설정 (0.5일)

### 6.1 Google Fonts 링크 추가

- [ ] `src/routes/__root.tsx`의 `<head>` 섹션
- [ ] preconnect 링크 추가
  - [ ] `https://fonts.googleapis.com`
  - [ ] `https://fonts.gstatic.com`
- [ ] 폰트 로드 링크
  - [ ] Noto Sans (영어)
  - [ ] Noto Sans KR (한국어)
  - [ ] Noto Sans JP (일본어)
  - [ ] weights: 400, 700
  - [ ] `display=swap`

### 6.2 Tailwind CSS 설정

- [ ] `tailwind.config.js` 열기
- [ ] `theme.extend.fontFamily.sans` 수정
  - [ ] 'Noto Sans'
  - [ ] 'Noto Sans KR'
  - [ ] 'Noto Sans JP'
  - [ ] system-ui, sans-serif (fallback)

### 6.3 CSS 언어별 폰트 설정

- [ ] `src/styles/globals.css` 열기
- [ ] `:lang(ko)` 규칙 추가
  - [ ] `font-family: 'Noto Sans KR', ...`
- [ ] `:lang(ja)` 규칙 추가
  - [ ] `font-family: 'Noto Sans JP', ...`
- [ ] `:lang(en)` 규칙 추가
  - [ ] `font-family: 'Noto Sans', ...`

### 6.4 폰트 로딩 테스트

- [ ] 개발 서버 실행
- [ ] 네트워크 탭에서 폰트 로드 확인
- [ ] 각 locale에서 폰트 렌더링 확인
  - [ ] /ko: Noto Sans KR
  - [ ] /en: Noto Sans
  - [ ] /ja: Noto Sans JP

---

## 🔒 Phase 7: 보안 (Netlify Functions) (0.5일)

### 7.1 Contact 폼 수정

- [ ] `src/features/contact/ui/contact-form.tsx` 열기
- [ ] Turnstile 토큰 생성 확인
- [ ] `fetch('/.netlify/functions/mail')` 호출 확인
- [ ] body에 turnstileToken, email, message 포함

### 7.2 Netlify Function 확인

- [ ] `netlify/functions/mail.mts` 열기
- [ ] Turnstile 검증 로직 확인
- [ ] Resend 메일 발송 로직 확인
- [ ] 환경 변수 사용 확인
  - [ ] `process.env.TURNSTILE_SECRET_KEY`
  - [ ] `process.env.RESEND_API_KEY`

### 7.3 Rate Limiting 추가 (선택)

- [ ] Rate Limiter 라이브러리 설치 (선택)
- [ ] IP 기반 제한 로직 추가
- [ ] 테스트 (5분에 5회 제한)

### 7.4 Origin 검증 추가 (선택)

- [ ] `event.headers.origin` 확인
- [ ] 허용된 origin만 통과
  - [ ] `https://chanho.dev`
  - [ ] `http://localhost:5173` (dev)

### 7.5 보안 테스트

- [ ] Contact 폼 제출 테스트
- [ ] 메일 수신 확인
- [ ] Turnstile 챌린지 동작 확인
- [ ] 봇 감지 테스트 (토큰 없이 제출)

---

## 🌐 Phase 8: Netlify 배포 설정 (0.5일)

### 8.1 netlify.toml 수정

- [ ] `build.command`: `pnpm build`
- [ ] `build.publish`: `dist` (Vite 출력)
- [ ] `build.functions`: `netlify/functions`
- [ ] `dev.port`: `8888`
- [ ] `dev.targetPort`: `5173` (Vite)
- [ ] redirects 규칙
  - [ ] `/api/*` → `/.netlify/functions/:splat`
  - [ ] `/*` → `/index.html` (SPA)

### 8.2 환경 변수 설정 (Netlify)

- [ ] Netlify 대시보드 접속
- [ ] Site settings → Environment variables
- [ ] 변수 추가
  - [ ] `VITE_GIT_RAW_URL`
  - [ ] `VITE_CONTENT_REPO_URL`
  - [ ] `VITE_TURNSTILE_SITE_KEY`
  - [ ] `TURNSTILE_SECRET_KEY`
  - [ ] `RESEND_API_KEY`

### 8.3 로컬 프로덕션 빌드 테스트

- [ ] `pnpm build` 실행
- [ ] `dist/` 디렉토리 생성 확인
- [ ] `dist/index.html` 확인
- [ ] `pnpm preview` 실행
- [ ] 모든 페이지 동작 확인

### 8.4 Netlify Dev 테스트

- [ ] `netlify dev` 실행
- [ ] Functions 동작 확인
- [ ] Contact 폼 제출 테스트
- [ ] 환경 변수 주입 확인

---

## 🧪 Phase 9: 테스트 (1-2일)

### 9.1 Vitest 유닛 테스트

- [ ] `vitest.config.ts` 확인 (Vite 플러그인 사용)
- [ ] 모든 테스트 실행
  ```bash
  pnpm test
  ```
- [ ] 실패한 테스트 수정
  - [ ] Link 컴포넌트 테스트
  - [ ] Button 컴포넌트 테스트
  - [ ] 기타 테스트
- [ ] 커버리지 확인
  ```bash
  pnpm coverage
  ```

### 9.2 Storybook

- [ ] `.storybook/main.ts` 수정
  - [ ] `framework: '@storybook/react-vite'`
- [ ] Storybook 실행
  ```bash
  pnpm storybook
  ```
- [ ] 모든 스토리 확인
  - [ ] Button
  - [ ] 기타 컴포넌트
- [ ] 접근성 테스트 (a11y addon)

### 9.3 Playwright E2E 테스트

- [ ] E2E 테스트 시나리오 수정
  - [ ] `e2e/home.spec.ts`
  - [ ] 기타 테스트 파일
- [ ] baseURL 변경 (필요 시)
- [ ] E2E 실행
  ```bash
  pnpm e2e
  ```
- [ ] 모든 테스트 통과 확인

### 9.4 수동 테스트 (전체 기능)

#### 한국어 (ko)

- [ ] 홈 페이지 (`/ko`)
  - [ ] AboutBlock 렌더링
  - [ ] RecentPostBlock (최근 5개)
- [ ] About 페이지 (`/ko/about`)
  - [ ] GitHub README 렌더링
- [ ] Contact 페이지 (`/ko/contact`)
  - [ ] 폼 입력
  - [ ] Turnstile 챌린지
  - [ ] 제출 성공
- [ ] 포스트 목록 (`/ko/posts`)
  - [ ] 카드 렌더링
  - [ ] 썸네일 이미지
- [ ] 포스트 상세 (`/ko/posts/test-post`)
  - [ ] MDX 렌더링
  - [ ] 코드 하이라이팅
  - [ ] Giscus 댓글

#### 영어 (en)

- [ ] 홈 페이지 (`/en`)
- [ ] About 페이지 (`/en/about`)
- [ ] Contact 페이지 (`/en/contact`)
- [ ] 포스트 목록 (`/en/posts`)
- [ ] 포스트 상세 (`/en/posts/test-post`)

#### 일본어 (ja)

- [ ] 홈 페이지 (`/ja`)
- [ ] About 페이지 (`/ja/about`)
- [ ] Contact 페이지 (`/ja/contact`)
- [ ] 포스트 목록 (`/ja/posts`)
- [ ] 포스트 상세 (`/ja/posts/test-post`)

### 9.5 기능 테스트

- [ ] 테마 전환 (light/dark/system)
  - [ ] 헤더에서 토글 클릭
  - [ ] localStorage 저장 확인
  - [ ] 새로고침 후 유지 확인
- [ ] 언어 전환 (ko/en/ja)
  - [ ] 헤더에서 언어 선택
  - [ ] URL 변경 확인 (`/ko` → `/en`)
  - [ ] 콘텐츠 변경 확인
- [ ] 네비게이션
  - [ ] Link 클릭 시 페이지 전환 (새로고침 없음)
  - [ ] 뒤로가기/앞으로가기 동작
  - [ ] 스크롤 복원
- [ ] Prefetch
  - [ ] 링크 hover 시 네트워크 탭에서 prefetch 확인

### 9.6 크로스 브라우저 테스트

- [ ] Chrome (최신)
- [ ] Firefox (최신)
- [ ] Safari (최신)
- [ ] Edge (최신)

### 9.7 반응형 테스트

- [ ] 데스크톱 (1920x1080)
- [ ] 태블릿 (768x1024)
- [ ] 모바일 (375x667, iPhone SE)
- [ ] 모바일 (390x844, iPhone 12)

### 9.8 성능 테스트

- [ ] Lighthouse 실행 (각 페이지)
  - [ ] `/ko` (홈)
  - [ ] `/ko/posts` (목록)
  - [ ] `/ko/posts/test-post` (상세)
- [ ] 점수 확인
  - [ ] Performance (목표: > 90)
  - [ ] Accessibility (목표: > 90)
  - [ ] Best Practices (목표: > 90)
  - [ ] SEO (현재 고려 대상 아님)
- [ ] Core Web Vitals
  - [ ] LCP (Largest Contentful Paint): < 2.5s
  - [ ] FID (First Input Delay): < 100ms
  - [ ] CLS (Cumulative Layout Shift): < 0.1

### 9.9 이미지 최적화 확인

- [ ] 네트워크 탭에서 이미지 확인
- [ ] AVIF/WebP 로드 확인 (브라우저 지원 시)
- [ ] Fallback 이미지 로드 확인 (구형 브라우저)
- [ ] lazy loading 동작 확인

---

## 🚢 Phase 10: 배포 (1일)

### 10.1 스테이징 배포

- [ ] Git 커밋
  ```bash
  git add .
  git commit -m "Migrate to TanStack Router (CSR)"
  ```
- [ ] 브랜치 푸시
  ```bash
  git push origin migration/tanstack-router
  ```
- [ ] Netlify Branch Deploy 생성
- [ ] Preview URL 확인

### 10.2 스테이징 QA

- [ ] 모든 기능 재테스트 (Phase 9 반복)
- [ ] 실제 GitHub 콘텐츠로 테스트
- [ ] Contact 폼 실제 메일 발송 테스트
- [ ] 팀원/친구에게 테스트 요청

### 10.3 문제 해결

- [ ] 발견된 버그 수정
- [ ] 스테이징 재배포
- [ ] 재테스트

### 10.4 프로덕션 배포 준비

- [ ] CHANGELOG.md 작성
- [ ] README.md 업데이트
  - [ ] 개발 환경 설정 (Vite)
  - [ ] 빌드 명령어
  - [ ] 배포 가이드
- [ ] 백업 계획 확인
  - [ ] 현재 프로덕션 코드 백업
  - [ ] 롤백 절차 문서화

### 10.5 프로덕션 배포

- [ ] 메인 브랜치 머지
  ```bash
  git checkout main
  git merge migration/tanstack-router
  git push origin main
  ```
- [ ] Netlify 자동 배포 확인
- [ ] 배포 완료 대기

### 10.6 프로덕션 검증

- [ ] 프로덕션 URL 접속 (`https://chanho.dev`)
- [ ] 모든 페이지 동작 확인
- [ ] Contact 폼 테스트
- [ ] Google Analytics 이벤트 확인
- [ ] 에러 추적 도구 확인 (Sentry 등)

### 10.7 롤백 계획 (문제 발생 시)

- [ ] Netlify 대시보드 → Deploys
- [ ] 이전 배포 버전 선택
- [ ] "Publish deploy" 클릭
- [ ] 또는 Git revert
  ```bash
  git revert HEAD
  git push origin main
  ```

---

## 📊 Post-Migration (사후 관리)

### 11.1 모니터링 설정

- [ ] 에러 추적 도구 연동 (Sentry, Rollbar 등)
- [ ] 성능 모니터링 (Google Analytics, Vercel Analytics)
- [ ] Uptime 모니터링 (UptimeRobot, Pingdom)
- [ ] Netlify Logs 확인

### 11.2 1주일 후 점검

- [ ] 에러 로그 확인
- [ ] 성능 지표 확인
- [ ] 사용자 피드백 수집
- [ ] Core Web Vitals 추세 확인

### 11.3 2주일 후 점검

- [ ] Google Search Console (SEO 영향 확인)
- [ ] 트래픽 변화 확인
- [ ] 개선 사항 백로그 작성

### 11.4 문서 정리

- [ ] 마이그레이션 회고록 작성
  - [ ] 잘된 점
  - [ ] 어려웠던 점
  - [ ] 배운 점
- [ ] 트러블슈팅 가이드 작성
- [ ] 팀원 교육 자료 작성

---

## 📊 진행 상태 트래킹

| Phase    | 작업 내용     | 예상 시간      | 실제 시간 | 상태    | 완료일 |
| -------- | ------------- | -------------- | --------- | ------- | ------ |
| Pre      | 사전 준비     | 0.5일          | -         | 🔲 대기 | -      |
| Phase 1  | 환경 설정     | 1-2일          | -         | 🔲 대기 | -      |
| Phase 2  | 라우팅        | 2-3일          | -         | 🔲 대기 | -      |
| Phase 3  | MDX           | 1일            | -         | 🔲 대기 | -      |
| Phase 4  | 컴포넌트      | 1-2일          | -         | 🔲 대기 | -      |
| Phase 5  | 이미지 최적화 | 1일            | -         | 🔲 대기 | -      |
| Phase 6  | 웹폰트        | 0.5일          | -         | 🔲 대기 | -      |
| Phase 7  | 보안          | 0.5일          | -         | 🔲 대기 | -      |
| Phase 8  | 배포 설정     | 0.5일          | -         | 🔲 대기 | -      |
| Phase 9  | 테스트        | 1-2일          | -         | 🔲 대기 | -      |
| Phase 10 | 배포          | 1일            | -         | 🔲 대기 | -      |
| Post     | 사후 관리     | 지속           | -         | 🔲 대기 | -      |
| **합계** |               | **9.5-13.5일** | -         | -       | -      |

**범례**: 🔲 대기 | 🔄 진행 중 | ✅ 완료 | ❌ 차단됨

---

## 🐛 이슈 트래킹

### 발견된 문제

| 번호 | 문제 | 심각도 | 상태 | 해결 방법 | 담당자 | 해결일 |
| ---- | ---- | ------ | ---- | --------- | ------ | ------ |
| -    | -    | -      | -    | -         | -      | -      |

**심각도**: 🔴 높음 | 🟡 중간 | 🟢 낮음  
**상태**: 🔲 발견 | 🔄 작업 중 | ✅ 해결 | ❌ 차단

---

## 📝 메모 및 학습 내용

### 주요 결정 사항

- ✅ CSR Only (TanStack Router만 사용, TanStack Start 제외)
- ✅ Netlify Functions 유지 (보안 로직 처리)
- ✅ Sharp로 이미지 최적화 (빌드 시)
- ✅ Google Fonts 웹폰트 (영어, 한국어, 일본어)
- ✅ SEO 고려 안 함 (개인 블로그)

### TanStack Router 특징

- 파일 기반 라우팅 (자동 코드 스플리팅)
- Type-safe navigation
- Prefetch 기본 지원 (`defaultPreload: 'intent'`)
- Loader로 데이터 fetch (React Query 스타일)

### Sharp 이미지 최적화

- WebP: 용량 30-50% 절감
- AVIF: 용량 50-70% 절감
- `<picture>` 태그로 브라우저별 최적 포맷 제공

### 보안 고려사항

- CSR에서도 Netlify Functions 사용 가능
- API Key는 절대 클라이언트 노출 금지
- Turnstile 검증은 반드시 서버에서

### 예상 이슈

1. ✅ 해결: CSR에서 보안 취약점 → Netlify Functions 활용
2. 초기 로딩 느릴 수 있음 → Code Splitting, Prefetch로 완화
3. SEO 저하 → 현재 고려 대상 아님

### 참고 링크

- [TanStack Router 공식 문서](https://tanstack.com/router)
- [Sharp 공식 문서](https://sharp.pixelplumbing.com/)
- [Netlify Functions 문서](https://docs.netlify.com/functions/overview/)

---

## 🎯 성공 기준

### 필수 (Must Have)

- [ ] 모든 페이지가 정상 동작
- [ ] Contact 폼 메일 발송 성공
- [ ] 이미지 최적화 적용
- [ ] 다국어 (ko/en/ja) 동작
- [ ] 테마 전환 (light/dark) 동작
- [ ] 모든 테스트 통과

### 권장 (Should Have)

- [ ] Lighthouse Performance > 90
- [ ] 초기 로딩 < 3초
- [ ] 크로스 브라우저 호환성
- [ ] 모바일 반응형

### 선택 (Nice to Have)

- [ ] Rate Limiting 구현
- [ ] 에러 추적 도구 연동
- [ ] 성능 모니터링 대시보드

---

**문서 버전**: 2.0.0 (CSR Only)  
**최종 수정일**: 2026-02-07  
**작성자**: OpenCode (Claude)

---

**📋 [목차로 돌아가기](./README.md)**
