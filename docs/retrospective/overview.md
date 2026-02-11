# 프로젝트 회고 및 의사결정 로그

## 📋 목차

- [개요](#개요)
- [대상](#대상)
- [주요 의사결정](#주요-의사결정)
- [작업 현황](#작업-현황)
- [월별 회고](#월별-회고)
- [참고 문서](#참고-문서)

## 개요

이 문서는 프로젝트의 주요 의사결정, 작업 진행 상황, 회고 기록을 관리합니다. 프로젝트의 변화 과정과 현재 상태를 한눈에 파악할 수 있는 이력 문서입니다.

## 대상

### ✅ 포함 대상

- 주요 의사결정 배경을 알고 싶은 경우
- 작업 진행 상황을 파악하고 싶은 경우
- 월별 변경 이력을 확인하고 싶은 경우

### ❌ 제외 대상

- 개발 환경 설정 및 시작 방법 → [development.md](../development.md) 참고
- AI 에이전트를 위한 코딩 규칙 → [agents.md](../agents.md) 참고
- 프로젝트 아키텍처 상세 설명 → [architecture.md](../architecture.md) 참고

## 주요 의사결정

### Phase 1: 기반 구축 (2025-11-20 ~ 11-24)

#### 프로젝트 초기 설정

**결정**: Next.js 16 + React 19 + TypeScript 5 스택 채택

**배경**:

- 모던 프론트엔드 기술 스택 학습 목적
- Next.js App Router로 파일 기반 라우팅 활용
- React 19의 Server Components 및 자동 최적화 활용

**결과**:

- Create Next App 기반 초기 프로젝트 생성
- ESLint, Prettier, Husky, lint-staged 설정
- Header, Footer 컴포넌트 분리

#### Contact 폼 구현

**결정**: Zod + Cloudflare Turnstile + Resend 조합

**배경**:

- 방문자 연락 기능 필요
- 봇 스팸 방지 필수
- 서버리스 환경에서 이메일 발송

**결과**:

- Zod 스키마 기반 폼 검증
- Turnstile 봇 방지 (배포 초기 봇 스팸 발생 후 우선 조치)
- Netlify Functions + Resend 이메일 발송
- DOMPurify 기반 XSS 방지 (후속 추가)

**시행착오**:

- Toast 알림 구현 시도 → 디자인 시스템 미정의로 revert

### Phase 2: 국제화와 콘텐츠 (2025-11-26 ~ 12-02)

#### URL 기반 다국어 지원

**결정**: `/[locale]/` 동적 세그먼트 방식

**배경**:

- 한국어, 일본어, 영어 3개 언어 지원
- SEO 친화적인 URL 구조 필요
- 링크 공유 시 언어 유지

**결과**:

- `[locale]` 동적 세그먼트로 App Router 구조 설계
- `/ko/`, `/ja/`, `/en/` URL 패턴
- `proxy.ts`로 브라우저 언어 감지 및 리다이렉션
- `NEXT_LOCALE` 쿠키로 사용자 선택 언어 영속성 확보

**시행착오**:

- 초기 Zustand + 쿠키 조합 시도 → proxy에서 쿠키 읽기 실패
- 최종적으로 URL 기반 + Zustand 조합으로 해결

#### 원격 MDX 렌더링 전략

**결정**: blog-content 리포지터리 분리 + GitHub Raw URL fetch

**배경**:

- 이전 시도에서는 콘텐츠를 프로젝트 내부 `content/` 폴더에 저장
- 글 수정 시마다 Netlify 재배포가 불편함
- 콘텐츠와 코드를 독립적으로 관리하고 싶음

**결과**:

- blog-content 리포지터리 생성 및 분리
- GitHub Actions로 `index.json` 자동 생성
- `@mdx-js/mdx`로 런타임 MDX 렌더링
- rehype-highlight로 코드 하이라이팅

**시행착오**:

- next/mdx 시도 → 원격 파일에서 `set-mdx-components.ts` 미동작
- Git submodule 시도 → 빌드 복잡도 증가
- 최종적으로 GitHub Raw URL + 런타임 렌더링 채택

### Phase 3: 사용자 경험 개선 (2025-12-04 ~ 12-10)

#### 다크 모드 구현

**결정**: Tailwind `dark:` 클래스 + Zustand 상태 관리

**배경**:

- 야간 작업으로 인한 눈 피로 해소
- 시스템 설정 존중 + 사용자 선택 저장

**결과**:

- Zustand로 테마 상태 관리
- localStorage에 사용자 선택 저장
- `prefers-color-scheme` 미디어 쿼리로 시스템 설정 감지
- Tailwind `dark:` 클래스로 다크 모드 스타일 적용

#### 언어 선택기 구현

**결정**: 언어별 아이콘 + `NEXT_LOCALE` 쿠키

**배경**:

- 사용자가 직접 언어 선택 가능해야 함
- 선택한 언어가 다음 방문 시에도 유지되어야 함

**결과**:

- 언어별 아이콘 (en.svg, ja.svg, ko.svg) 추가
- `NEXT_LOCALE` 쿠키로 언어 설정 영속성
- Header에 언어 선택기 통합

**시행착오**:

- Zustand 스토어 → 쿠키 기반으로 여러 차례 전환
- LocaleSync 컴포넌트 추가 후 제거
- CDN 캐싱 방지 헤더 추가

### Phase 4: 아키텍처 정제 (2025-12-12 ~ 2025-12-14)

#### FSD 아키텍처 도입

**결정**: Feature-Sliced Design 패턴 적용

**배경**:

- 프로젝트 규모 증가로 체계적인 구조 필요
- 기능 단위 독립적인 개발/테스트 원함

**결과**:

- 5개 레이어 구조 적용 (0-app, 3-widgets, 2-features, 1-entities, 5-shared)
- UI 컴포넌트 디렉토리 재구성
- MDX → markdown 엔티티로 단순화

**시행착오**:

- 초기 각 레이어에 무엇을 넣을지 고민으로 시간 소요
- 결론: `2-features/`에서 시작 후 점진적 분리가 효율적

#### Button 컴포넌트 구현

**결정**: 재사용 가능한 UI 컴포넌트 + Property-Based 테스트

**배경**:

- 일관된 디자인 시스템 구축
- 다양한 스타일 변형 지원
- 테스트 자동화

**결과**:

- 4가지 variant (primary, default, danger, link)
- 2가지 shape (fill, outline)
- 다크 모드 지원
- fast-check로 다양한 props 조합 자동 검증
- Storybook 스토리 작성

**시행착오**:

- named export → default export 전환으로 import 문 일괄 수정

#### i18next 기반 UI 다국어 시스템

**결정**: react-i18next + TypeScript + Zod 조합

**배경**:

- 기존 URL 기반 다국어는 콘텐츠만 전환
- 네비게이션, 폼 라벨 등 UI 텍스트도 다국어화 필요
- 타입 안전성 확보

**결과**:

- i18next, react-i18next 의존성 추가
- TypeScript 지원 번역 키 타입 정의
- Zod 스키마로 번역 리소스 런타임 검증
- fast-check로 번역 키 완전성/일관성 테스트
- LocaleProvider에 I18nextProvider 통합

#### Giscus 댓글 시스템

**결정**: GitHub Discussions 기반 Giscus 채택

**배경**:

- 블로그 포스트에 독자와 소통할 댓글 기능 필요
- GitHub 기반으로 별도 백엔드 없이 운영
- utterances 대비 Discussions의 풍부한 기능

**결과**:

- @giscus/react 의존성 설치
- 5-shared/components에 Reply 컴포넌트 생성
- 포스트 상세 페이지에 locale 지원과 함께 통합
- 다크 모드 테마 연동

#### Link 컴포넌트 구현

**결정**: locale 자동 처리 래퍼 컴포넌트

**배경**:

- next/link 직접 사용 시 매번 locale prefix 수동 추가
- locale 처리 자동화로 일관성 유지

**결과**:

- 5-shared/components/ui/link에 Link 컴포넌트 생성
- locale 기반 URL 자동 처리
- NextLinkProps 확장으로 타입 안전성
- 외부 링크, 루트 경로 등 다양한 경로 타입 지원

#### Typography/Code 컴포넌트 분리

**결정**: setMdxComponents에서 개별 컴포넌트로 분리

**배경**:

- 모든 마크다운 렌더링 로직이 한 곳에 집중
- 개별 컴포넌트로 분리하여 재사용성 및 테스트 용이성 확보

**결과**:

- heading(h1-h5)을 Typography 컴포넌트로 분리
- 인라인/블록 코드를 Code 컴포넌트로 분리
- 다크 모드 지원 및 스타일 개선
- 1-entities/markdown/ui에 배치하여 FSD 구조 일관성 유지

### Phase 5: TanStack Router 마이그레이션 (2026-02-07 ~ 02-08)

#### Next.js → TanStack Router + Vite 전환

**결정**: Next.js 16 App Router에서 TanStack Router v1 + Vite v7로 전면 마이그레이션

**배경**:

- Next.js App Router의 `use client`/`use server` 혼란
- 예측 불가능한 캐싱 동작
- 느린 빌드 속도 (12초)
- 느린 HMR (2초)

**시도**:

- ❌ 1차 시도 (Claude Code): 단일 에이전트, 8시간 → 빌드 실패
- ❌ 2차 시도 (Amazon Kiro): 단일 에이전트, 7시간 → 타입 에러
- ✅ 3차 시도 (멀티 에이전트): Master Orchestrator + 6 Subagents, 12시간 → 성공

**결과**:

- 빌드 시간: 12s → 5s (60% 개선)
- HMR: 2s → 100ms (95% 개선)
- 번들 크기: 200KB → 150KB (25% 감소)
- 타입 안전성: TanStack Router의 파일 기반 라우팅 자동 타입 생성
- 복잡도 감소: `use client`/`use server` 제거

**주요 기술 결정**:

- TanStack Router v1 파일 기반 라우팅
- Vite v7 빌드 도구
- `@mdx-js/mdx` 런타임 MDX 렌더링
- 클라이언트 사이드 렌더링 (SSR 미사용, 필요 시 추가 가능)

**멀티 에이전트 시스템**:

- Master Orchestrator: 작업 분배 및 조율
- feature-developer: 컴포넌트 및 라우팅 구현
- test-specialist: 테스트 코드 작성 및 검증
- security-scanner: 보안 취약점 검사
- git-guardian: Git 워크플로우 관리
- github-helper: PR 생성 및 관리
- doc-manager: 문서 관리

**Git Worktree 전략**:

- develop → feature branch → worktrees (각 subagent)
- 병렬 실행으로 충돌 없이 안전한 작업
- 작업 완료 후 feature branch로 통합 → PR 생성

## 최근 회고

### 2026-02-12 — PR #46: refactor: 기술부채 개선 — 타입 안전성, i18n, 파일명 규칙, UI 개선

#### ✅ 잘한 점

- 기술부채 6건을 한 번에 정리하면서 타입 안전성(parseLocale), i18n 스키마/리소스, 파일명 규칙까지 함께 정합성 확보
- MDX 에러/로딩 UI 개선과 i18n 적용으로 사용자 경험과 국제화 품질 동시 향상
- 테스트 206/206 통과를 유지하면서 변경 범위를 명확히 문서화(변경 파일 25개, +239/-55)

#### 🔧 개선점

- 역할 분리로 인해 feature 변경 후 테스트 10건 실패가 발생 → 변경 시 테스트 영향 범위 사전 공유 필요
- worktree 외 메인 디렉토리 수정 발생 → 작업 디렉토리 검증 체크가 부족
- opencode.json 변경이 이전 세션 잔류분으로 포함됨 → 변경 원인/범위 분리 필요

#### 🤖 에이전트 개선 제안

- **feature-developer**: UI 문구/i18n/파일명 변경 시 테스트 영향 항목(모킹, 스냅샷, 하드코딩 값) 체크리스트 추가 (.agents/agents/feature-developer.md)
- **test-specialist**: worktree 경로 검증(현재 git worktree 확인) 후 작업 시작 규칙 추가 (.agents/agents/test-specialist.md)
- **git-guardian**: 머지 전 uncommitted 설정 파일(opencode.json) 잔류 탐지 및 분리 커밋 권고 (.agents/agents/git-guardian.md)

### 2026-02-11 — PR #40: 문서 구조 개편 - agents.md 분리 및 에이전트 프롬프트 최적화

#### ✅ 잘한 점

- 955줄 거대 문서를 9개 문서로 내용 무손실 분리, 허브 문서 85% 축소
- 3단계 Phase (분리 → 최적화 → 검증)로 리스크 최소화
- 에이전트 프롬프트 20% 감소, docs/ 참조로 중복 제거

#### 🔧 개선점

- 동일 제목 커밋 2쌍 존재 — squash 또는 구체적 제목 구분 필요
- opencode.json 변경(+182/-73)이 문서 PR에 혼재 — 별도 커밋/PR 분리 권장

#### 🤖 에이전트 개선 제안

- **git-guardian**: 중복 커밋 제목 감지 및 경고 로직 추가
- **master-orchestrator**: 설정 파일 변경을 문서/코드 변경과 별도 커밋으로 분리하는 규칙

→ 상세: [2026-02.md](./2026-02.md)

## 작업 현황

### ✅ 완료된 작업 (우선순위: 높음)

- 프로젝트 초기 설정 (Next.js 16 + React 19 + TypeScript)
- Contact 폼 구현 (Zod + Turnstile + Resend)
- URL 기반 다국어 지원 (ko, ja, en)
- 원격 MDX 렌더링 (blog-content 분리)
- 다크 모드 구현
- 언어 선택기 구현
- FSD 아키텍처 도입
- Button 컴포넌트 구현 (Property-Based 테스트)
- i18next 기반 UI 다국어 시스템
- Giscus 댓글 시스템
- Link 컴포넌트 구현
- Typography/Code 컴포넌트 분리

### ✅ 완료된 작업 (우선순위: 중간)

- Header/Footer 위젯 (반응형)
- Posts 목록 페이지 (index.json 기반)
- Post 상세 페이지 (원격 MDX 렌더링)
- 태그 필터링
- Netlify 배포 설정
- ESLint, Prettier, Husky, lint-staged 설정
- Vitest + Playwright 테스트 환경
- Storybook 설정

### 🚧 진행 중 (우선순위: 높음)

- 문서화 작업 (agents.md 구조 개편 완료, development.md, architecture.md)

### 📋 예정 작업 (우선순위: 높음)

- SEO 최적화 (Open Graph, Twitter Card, Sitemap)
- 404/500 에러 페이지
- 페이지네이션 또는 무한 스크롤

### 📋 예정 작업 (우선순위: 중간)

- 코드 블록 개선 (복사 버튼, 라인 넘버, 언어 레이블)
- TOC (Table of Contents)
- Reading Time 표시
- 홈페이지 개선 (Hero Section, 최신 포스트, 인기 포스트)
- 관련 포스트 추천 (태그 기반)
- 공유 버튼 (SNS)

### 📋 예정 작업 (우선순위: 낮음)

- 검색 기능 (클라이언트 사이드 또는 Algolia)
- RSS/Atom 피드
- Analytics (Google Analytics 또는 Plausible)
- PWA (Service Worker, Manifest)
- AI 기능 (Gemini API - 썸네일, 요약, 태그 생성)
- 조회수 카운터
- 이메일 구독 신청 폼

## 월별 회고

- [2025년 11월](./2025-11.md)
- [2025년 12월](./2025-12.md)
- [2026년 2월](./2026-02.md)

## 참고 문서

- [agents.md](../agents.md) - AI 코딩 에이전트 가이드
- [development.md](../development.md) - 개발 환경 설정 및 시작 가이드
- [architecture.md](../architecture.md) - 프로젝트 아키텍처 상세 설명
