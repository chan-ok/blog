# 블로그 구현 계획

## 기술 스택

### Framework

- Next.js 16
- React 19 (+ React Compiler)

### Styling & UI

- Tailwind CSS v4
- Base UI Components (@base-ui-components/react)

### Type Check & Validation

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
- Storybook (+ Chromatic)

### Content & Data

- MDX (@next/mdx, @mdx-js/react)
- next-mdx-remote-client (원격 MDX 렌더링)
- rehype-highlight (코드 하이라이팅)
- remark-gfm (GitHub Flavored Markdown)
- axios (콘텐츠 fetching)

### Others

- Resend (이메일 발송)
- Cloudflare Turnstile (봇 방지)
- Netlify (배포 및 Functions)

## 아키텍처 개요

### 리포지터리 분리 구조

프로젝트는 두 개의 독립적인 리포지터리로 구성됩니다:

1. **blog (현재)** - Next.js 애플리케이션
2. **blog-content** - MDX 포스트 저장소

### 배포 및 콘텐츠 파이프라인

```
blog-content (main push)
  → GitHub Actions
  → generate-index.ts 실행
  → {locale}/index.json 생성 및 커밋

blog (main push)
  → Netlify 자동 배포
  → blog-content의 index.json 참조
  → GitHub Raw URL로 MDX 렌더링
```

## 진행 상황

### ✅ 완료된 작업

#### 1. 개발 환경 세팅

- Next.js 16, React 19, TypeScript, Tailwind v4 설치 및 설정
- ESLint, Prettier, Husky, lint-staged 설정
- Vitest, Playwright, Storybook + Chromatic 설정

#### 2. 국제화 라우팅

- `src/app/[locale]/layout.tsx` 구현
- 3개 언어 지원 (ko, ja, en)
- `src/proxy.ts`에서 브라우저 언어 감지 및 리다이렉션
- 기본 locale 폴백 (ko)

#### 3. 레이아웃 및 위젯

- Header 위젯 (반응형 디자인)
- Footer 위젯
- Navigation 컴포넌트

#### 4. About 페이지

- 원격 마크다운 파일 렌더링 (blog-content 리포지터리)
- MDX 렌더링 기능

#### 5. Contact 페이지

- Zod 스키마 기반 검증
- Base UI Form 컴포넌트로 UI 구현
- Cloudflare Turnstile 연동 (봇 방지)
- Netlify Functions + Resend로 이메일 발송

#### 6. Posts 기능

- **콘텐츠 파이프라인**: blog-content 리포지터리와 분리
- **인덱싱**: blog-content의 GitHub Actions로 index.json 자동 생성
- **목록 페이지**: index.json 기반 포스트 목록 표시
- **상세 페이지**: GitHub Raw URL로 원격 MDX 렌더링
- **MDX 렌더링**: rehype-highlight로 코드 하이라이팅
- **태그 필터**: 태그 기반 필터링 기능

#### 7. 배포

- Netlify 배포 설정
- Netlify Functions (이메일 전송)

#### 8. 다크 모드

- [x] Zustand 상태 관리
- [x] localStorage 연동 (시스템 설정 우선 → 사용자 선택 보존)
- [x] 다크 모드 토글 UI

#### 9. 언어 선택기

- [x] 언어 선택 UI 컴포넌트
- [x] Zustand 상태 관리
- [x] 쿠키 및 localStorage 연동 (NEXT_LOCALE 및 zustand으로 상태 관리 및 보존)
- [x] Navigation에 통합

### 📋 예정 작업

#### 1. 마크다운 고급화

- [ ] 코드 블록 개선 (복사 버튼, 라인 넘버 등)
- [ ] TOC (Table of Contents) 구현
  - 마크다운 AST에서 헤딩 추출
  - TOC 컴포넌트 구현
- [ ] Reading Time 표시
  - 단어 수 기반 ETA 계산
  - UI 표시

#### 2. 홈페이지 개선

현재 Home은 About을 재사용하는 단순 구조. 블로그 홈페이지로서 기능 강화:

- [ ] Hero Section (블로그 소개)
- [ ] 최신 포스트 섹션
- [ ] 인기 포스트 섹션 (조회수 기반)
- [ ] 이메일 구독 신청 폼

#### 3. Posts 기능 강화

- [ ] 무한 스크롤 또는 페이지네이션
- [ ] SEO 메타데이터 최적화
- [ ] SSG + ISR 전략 구현
- [ ] 관련 포스트 추천

#### 4. AI 기능 (선택)

- [ ] AI 썸네일 자동 생성
- [ ] AI 요약 생성
- [ ] AI 태그 자동 생성

#### 5. 에러 처리

- [ ] 404, 500 에러 페이지
- [ ] 메인테넌스 페이지

#### 6. 추가 기능

- [ ] 검색 기능
- [ ] RSS/Atom 피드
- [ ] Analytics 연동 (Google Analytics 또는 Plausible)
- [ ] PWA 설정
- [ ] 댓글 시스템 (utterances 또는 giscus)

## 기술적 고려사항

### FSD 아키텍처

현재 프로젝트는 Feature-Sliced Design 아키텍처를 따르고 있습니다:

- `src/app`: Next.js App Router 페이지
- `src/features`: 도메인 기능 (about, contact, post)
- `src/entities`: 비즈니스 엔티티 (mdx 등)
- `src/widgets`: 복합 UI 컴포넌트 (header, footer)
- `src/shared`: 공통 유틸리티 및 설정

### 콘텐츠 관리 전략

- **분리된 리포지터리**: 코드와 콘텐츠를 분리하여 독립적으로 관리
- **자동화**: GitHub Actions로 인덱싱 자동화
- **원격 렌더링**: next-mdx-remote-client로 GitHub Raw URL의 MDX를 직접 렌더링
- **캐싱**: index.json으로 빌드 시간 최적화

### 성능 최적화

- React Compiler 활용
- 폰트 preload
- 이미지 최적화 (next/image)
- Code splitting
