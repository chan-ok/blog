# 블로그 개발 TODO

## 완료된 작업 ✅

### 개발 환경

- [x] Next.js 16 + React 19 설치
- [x] TypeScript 설정
- [x] Tailwind CSS v4 설치 및 설정
- [x] Base UI Components 설치
- [x] Zod v4 설치
- [x] ESLint 9 설정
- [x] Prettier 설정
- [x] Husky + lint-staged 설정
- [x] Vitest + testing-library/react 설치
- [x] Playwright 설치 및 설정
- [x] Storybook + Chromatic 설정
- [x] Kiro hooks 설정 (자동 문서화, 테스트, Storybook, 코드 품질)
- [x] Kiro steering 규칙 설정 (product, structure, tech)

### 국제화 및 레이아웃

- [x] `src/app/[locale]/layout.tsx` 생성
- [x] 지원 언어 설정 (ko, ja, en)
- [x] 브라우저 언어 감지 (proxy.ts)
- [x] 언어 폴백 로직
- [x] Header 위젯 (반응형)
- [x] Footer 위젯
- [x] Navigation 컴포넌트

### 페이지 구현

- [x] Home 페이지 (About 재사용)
- [x] About 페이지 (원격 마크다운)
- [x] Contact 페이지 (Zod + Turnstile + Resend)
- [x] Posts 목록 페이지 (index.json 기반)
- [x] Post 상세 페이지 (원격 MDX 렌더링)

### 콘텐츠 파이프라인

- [x] blog-content 리포지터리 분리
- [x] blog-content의 GitHub Actions로 index.json 자동 생성
- [x] GitHub Raw URL 기반 MDX 렌더링
- [x] 태그 필터링
- [x] MDX 렌더링 (rehype-highlight)

### 배포

- [x] Netlify 배포 설정
- [x] Netlify Functions (이메일 전송)

### 다크 모드 \([tailwind dark mode](https://tailwindcss.com/docs/dark-mode)\)

- [x] Zustand로 상태 관리
  - [x] 최초 시스템 설정 감지
  - [x] LocalStorage에 사용자 선택 보존
  - [x] 스토리지 값 우선 적용
- [x] 다크 모드 토글 버튼 UI
- [x] Header에 토글 버튼 통합
- [x] Tailwind `dark:` 클래스 활용

### 언어 선택기

- [x] 언어 선택 UI 컴포넌트 (`locale-toggle`)
- [x] 언어별 아이콘 (en, ja, ko)
- [x] Header에 언어 선택기 통합
- [x] 쿠키 기반 언어 설정 영속성 (NEXT_LOCALE)

## 진행 예정 작업 📋

### 1. 마크다운 고급화

#### 코드 블록 개선

- [ ] 코드 복사 버튼
- [ ] 라인 넘버 표시
- [ ] 언어 레이블 표시

#### TOC (Table of Contents)

- [ ] 마크다운 AST에서 헤딩(h2, h3) 추출
- [ ] TOC 컴포넌트 구현
- [ ] 현재 위치 하이라이트
- [ ] 스크롤 애니메이션

#### Reading Time

- [ ] 단어 수 기반 계산 로직
- [ ] Post 상세 페이지에 표시 UI
- [ ] 메타데이터에 포함 (index.json)

### 2. 홈페이지 개선

- [ ] Hero Section 디자인 및 구현
- [ ] 최신 포스트 섹션 (최근 3-5개)
- [ ] 인기 포스트 섹션 (조회수 기반)
- [ ] 이메일 구독 신청 폼
  - [ ] Zod 검증
  - [ ] Netlify Function 연동
  - [ ] Resend로 환영 이메일 발송

### 3. Posts 기능 강화

#### 페이지네이션/무한 스크롤

- [ ] 페이지네이션 컴포넌트
- [ ] 또는 무한 스크롤 구현
- [ ] 로딩 상태 UI

#### SEO 최적화

- [ ] Post 메타데이터 구조화
- [ ] Open Graph 태그
- [ ] Twitter Card 태그
- [ ] Sitemap 자동 생성

#### 렌더링 전략

- [ ] SSG + ISR 구현
- [ ] 빌드 시간 최적화

#### 추가 기능

- [ ] 관련 포스트 추천 (태그 기반)
- [ ] 조회수 카운터 (선택)
- [ ] 공유 버튼 (SNS)

### 4. 에러 처리

- [ ] 404 에러 페이지 디자인 및 구현
- [ ] 500 에러 페이지 디자인 및 구현
- [ ] 에러 바운더리 설정
- [ ] 메인테넌스 페이지 (선택)

### 5. 추가 기능

#### 검색

- [ ] 검색 UI
- [ ] 클라이언트 사이드 검색 (index.json 활용)
- [ ] 또는 Algolia 연동 (선택)

#### RSS/Atom 피드

- [ ] RSS 피드 생성
- [ ] Atom 피드 생성

#### Analytics

- [ ] Google Analytics 연동
- [ ] 또는 Plausible/Umami 같은 프라이버시 친화적 도구

#### PWA

- [ ] Service Worker 설정
- [ ] Manifest 파일
- [ ] 오프라인 지원

#### 댓글 시스템

- [ ] 댓글 시스템 선택 (utterances vs giscus)
- [ ] 설정 및 통합

### 6. AI 기능 (선택)

- [ ] Gemini API 연동
- [ ] AI 썸네일 자동 생성
- [ ] AI 요약 생성
- [ ] AI 태그 자동 생성
- [ ] AI 추천 포스트 생성

---

## 테스트 작성

- [ ] Contact Form E2E 테스트
- [ ] Posts 페이지 E2E 테스트
- [ ] 언어 전환 E2E 테스트
- [ ] 주요 컴포넌트 유닛 테스트
- [ ] Storybook 스토리 추가

---

## 성능 최적화

- [ ] 이미지 최적화 (next/image)
- [ ] 번들 사이즈 분석 및 최적화
- [ ] Core Web Vitals 측정 및 개선
- [ ] 폰트 로딩 최적화 (완료: preload 설정됨)

---

## 관련 문서

- [구현 계획](./implementation-plan.md) - 기술 스택 및 진행 상황
- [변경 로그](./changelog.md) - 버전별 변경 내역

> 📖 전체 문서 목록은 [문서 홈](../README.md)을 참고하세요.
