# 블로그 개발 TODO

## 1. 개발 환경 세팅

### 기본 스택 설치

- [x] Next.js 16 설치
- [x] React 19 + React Compiler 설정
- [x] TypeScript 설정

### Styling & HeadlessUI

- [x] Tailwind CSS v4 설치 및 설정
- [x] Base UI Components 설치

### 타입 체크 & 검증

- [x] Zod v4 설치

### Lint & Formatter

- [x] ESLint 설정
- [x] Prettier 설정
- [x] Husky 설정
- [x] lint-staged 설정

### 테스트 환경

- [x] Vitest 설치 및 설정
- [x] testing-library/react 설치
- [x] Playwright 설치 및 설정
- [x] Storybook + Chromatic 설정

---

## 2. 국제화 라우팅 및 레이아웃

- [x] `src/app/[locale]/layout.tsx` 생성
- [x] 지원 언어 배열 정의 (`['ko', 'ja', 'en']`)
- [x] 미들웨어에서 브라우저 언어 감지 로직 구현
- [x] ko/ja/en 언어 매핑 및 기본 ko 폴백 처리
- [x] 공통 Header 컴포넌트 구성
- [x] 공통 Footer 컴포넌트 구성
- [x] Navigation 컴포넌트 구성
- [ ] 언어 스위처 컴포넌트 구현
- [ ] `messages/{locale}.ts` 파일 구조 생성
- [ ] 언어별 텍스트/컨텐츠 분리

---

## 3. 페이지별 구현

### Home & About 페이지

- [x] `contents/about.{locale}.md` 고정 마크다운 파일 생성
- [x] About 컴포넌트 구현
- [x] Home 페이지에서 About 컴포넌트 재사용 설정
- [ ] 홈 전용 페이지 컴포넌트 구현
  - [ ] 블로그 소개 섹션 구현
  - [ ] 최신 포스트 섹션 구현
  - [ ] 인기 포스트 섹션 구현
  - [ ] 이메일 구독 신청 폼 구현

### Posts 목록 페이지

- [x] `contents/posts/{locale}/{slug}.md` 디렉토리 구조 생성
- [x] Posts 목록 페이지 UI 구현 (post-card, post-card-list) (mock)
- [x] Posts 목록 페이지 UI 구현 (post-card, post-card-list) (real)
- [x] 빌드 시 JSON 캐시 생성 로직 구현
- [x] Frontmatter 파서 유틸리티 구현
- [ ] 무한 스크롤 기능 구현

### Post 상세 페이지

- [/] `/[locale]/posts/[slug]/page.tsx` 생성
- [x] MDX 렌더링 설정
- [x] rehype-highlight로 코드블록 스타일 적용
- [ ] Frontmatter 기반 SEO 메타 설정
- [ ] SSG + revalidate 전략 구현
- [x] published된 문서의 메타데이터를 JSON으로 저장
- [ ] published된 문서의 메타데이터 기반으로 AI 썸네일 생성
- [ ] published된 문서의 메타데이터 기반으로 AI 요약 생성
- [ ] published된 문서의 메타데이터 기반으로 AI 추천 포스트 생성
- [ ] published된 문서의 메타데이터 기반으로 AI 태그 생성

### Contact 페이지

- [x] Zod 스키마 정의
- [x] Contact Form UI 구현
- [x] 입력 검증 로직 구현
- [ ] 이메일 데이터 XSS공격 방지

---

## 4. 데이터 및 콘텐츠 파이프라인

- [x] `contents/posts/{locale}/{slug}.md` 구조 구현
- [x] `scripts/generate-post-index.ts` 스크립트 작성
- [x] Frontmatter 파싱 로직 구현
- [ ] Frontmatter `locale` 필드로 언어별 콘텐츠 동기화

---

## 5. 에러 처리 및 배포

- [x] 언어 폴백 로직 구현
- [/] 기본 테스트 작성
- [x] 배포 스크립트 작성 (netlify.toml)
- [ ] 에러 페이지 구현 (404, 500 등)
- [ ] 메인테넌스 페이지 구현

---

## 6. 차후 확장 로드맵

### 댓글 시스템

- [ ] 댓글 시스템 요구사항 정의 (비회원/회원 여부)
- [ ] 저장소 선택 및 구현

### 다크 모드

- [ ] Tailwind `data-theme` 설정
- [ ] Base Web theming 구현
- [ ] 다크 모드 토글 UI 구현

### 반응형 레이아웃

- [x] Tailwind breakpoints 최적화
- [ ] 모바일/태블릿/데스크톱 레이아웃 테스트

### TOC & 읽는 시간

- [ ] 마크다운 AST에서 헤딩 추출
- [ ] TOC (Table of Contents) 컴포넌트 구현
- [ ] 단어 수 기반 ETA 계산 로직
- [ ] 읽는 시간 표시 UI

### 게시 상태 제어

- [x] Frontmatter `published` 필드 추가
- [x] 게시/비게시 상태 제어 로직 구현

### AI 기능

- [ ] 게시 후 AI 요약 기능
- [ ] 썸네일 자동화 (서버 액션/웹훅)

### 추가 기능

- [ ] 검색 기능 구현
- [x] 태그 필터 기능
- [ ] RSS/Atom 피드 생성
- [ ] Analytics 연동
- [ ] PWA 설정
