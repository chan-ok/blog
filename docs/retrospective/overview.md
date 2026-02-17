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
- security-scanner: 보안 취약점 검사 (현재는 tech-architect에 통합됨)
- git-guardian: Git 워크플로우 관리
- github-helper: PR 생성 및 관리
- doc-manager: 문서 관리

**Git Worktree 전략**:

- develop → feature branch → worktrees (각 subagent)
- 병렬 실행으로 충돌 없이 안전한 작업
- 작업 완료 후 feature branch로 통합 → PR 생성

## 최근 회고

### 2026-02-16 — PR #63: feat: 홈 화면 최근 포스트 레이아웃 개선

#### ✅ 잘한 점

- **테스트 커버리지 확보**: PostCompactCard 컴포넌트에 432줄의 포괄적 테스트 (기본 렌더링 + 반응형 + 접근성 + Property-based) 작성
- **반응형 디자인 완성도**: 모바일 1열 → 데스크톱 3열 그리드 레이아웃, 카드 높이 비율 조정으로 다양한 디바이스 지원
- **재사용 가능한 컴포넌트 설계**: PostCompactCard를 features 레이어에 배치하여 다른 위젯에서도 활용 가능
- **다크 모드 지원**: 컴포넌트 설계 단계부터 다크 모드 스타일 포함
- **접근성 고려**: ARIA 속성, 키보드 네비게이션, alt 텍스트 제공

#### 🔧 개선점

- **요구사항 변경 3회 반복**: 기본 레이아웃 → 썸네일 추가 → 크기 조정으로 인한 불필요한 커밋 증가 (10개 커밋)
- **테스트 코드 반복 수정**: PostCompactCard 높이 변경으로 test-specialist가 2회 테스트 재작성
- **Phase 1 통합 실패**: 첫 번째 Phase에서 feature-developer와 test-specialist 통합 시 테스트 파일 누락, 재작업 필요
- **중복 커밋 잔류**: 동일한 제목의 `refactor: PostCompactCard 레이아웃 개선` 커밋이 3회(00fa815, 36cdb5b, 4d5ef99) 연속 발생

#### 🤖 에이전트 개선 제안

- **master-orchestrator**: 요구사항 최종 확정 후 작업 시작 규칙 추가 — 사용자에게 "레이아웃 변경 요청 전 최종 스펙 확인 (카드 높이, 썸네일 크기, 그리드 열 수 등)" 질문
- **feature-developer**: UI 크기 조정 시 테스트 영향 범위 사전 고지 — "PostCompactCard 높이 변경 → test-specialist가 테스트 코드 업데이트 필요" 명시
- **git-guardian**: 동일 커밋 메시지 연속 3회 감지 시 squash 경고 강화 — "refactor: PostCompactCard 레이아웃 개선" 패턴 탐지
- **test-specialist**: 컴포넌트 크기 검증을 하드코딩 대신 변수화 권장 — `const EXPECTED_HEIGHT = 'h-72'` 형태로 관리하여 수정 최소화

### 2026-02-15 — PR #61: release: 블로그 썸네일 기능 및 Markdown 렌더링 개선

#### ✅ 잘한 점

- **대규모 develop → main 통합**: 72개 커밋, 96개 파일 변경(+10,719/-2,108)을 안정적으로 릴리스
- **테스트 커버리지 대폭 향상**: 32개 테스트 파일 변경으로 Markdown 렌더링 품질 확보
- **Git 워크플로우 개선**: husky pre-commit/pre-push 스크립트 안정화 (shebang 추가, PATH 설정, audit 복구 로직)
- **에이전트 시스템 정교화**: security-scanner → tech-architect 통합으로 역할 단순화
- **문서화 강화**: 회고/TODO 문서 업데이트로 프로젝트 히스토리 명확화

#### 🔧 개선점

- **husky 스크립트 안정화 반복**: pre-push/pre-commit 스크립트 수정이 7회 반복 (PATH, shebang, 빌드 체크 제거 등)
- **pnpm audit 실패 처리 미흡**: 네트워크 에러 시 훅이 멈추는 문제 → graceful failure 로직 추가
- **opencode.json 빈번한 변경**: 10회 이상 권한 설정 조정 → 권한 체계 사전 설계 필요
- **디버깅 커밋 잔류**: 콜아웃/이미지 경로 디버깅 커밋 5회 → squash 미흡

#### 🤖 에이전트 개선 제안

- **git-guardian**: husky 스크립트 문법 검증 체크리스트 (shebang, PATH, 에러 핸들링)
- **git-guardian**: 디버깅 커밋 연속 3회 이상 시 squash 경고 강화
- **master-orchestrator**: opencode.json 변경은 별도 PR로 분리하는 규칙 명시
- **doc-manager**: 릴리스 PR에서는 overview.md 회고 섹션 자동 업데이트

### 2026-02-15 — PR #60: feat: MDX 이미지 블록 및 콜아웃 기능 추가

#### ✅ 잘한 점

- TDD 프로세스 준수: 테스트 먼저 작성(.skip) → 구현 → 활성화 순서로 요구사항 명확화
- Git Worktree 병렬 작업: feature-dev와 test-spec을 분리하여 기능/테스트 동시 진행
- MDX 파싱 동작 학습: remark/rehype 플러그인 체인 직접 구현하며 AST 변환 과정 이해
- 시맨틱 HTML 개선: rehype-unwrap-images로 `<p><figure>` 중첩 제거

#### 🔧 개선점

- 이미지 경로 해결 로직 4회 반복 수정 → 요구사항 미명확 (이미지 디렉토리 규칙 사전 정의 필요)
- 콜아웃 파싱 로직 3회 수정 → MDX가 마크다운 블록을 하나의 p 태그에 개행으로 파싱하는 동작 미파악
- 디버깅 커밋 5회 잔류 → 커밋 히스토리 가독성 저하
- Property-based 테스트 타임아웃 발생 → 비동기 컴포넌트 타임아웃 설정 필요

#### 🤖 에이전트 개선 제안

- **feature-developer**: MDX/remark/rehype 플러그인 개발 체크리스트 (MDX 파싱 동작 사전 확인, ESM import 사용, 디렉토리 규칙 명확화)
- **test-specialist**: Property-based 테스트 타임아웃 가이드라인 (비동기 로직 시 5s → 10s)
- **git-guardian**: 디버깅 커밋 감지 및 squash 권장 (연속 3회 이상 동일 파일 수정 시 경고)
- **master-orchestrator**: 복잡한 파싱 로직 요구사항 사전 명확화 단계 (입력 → 출력 명세 먼저 작성)

### 2026-02-12 — PR #50: feat: 404, 403, 500 에러 페이지 구현

#### ✅ 잘한 점

- feature-developer + test-specialist 병렬 실행으로 구현/테스트/스토리 병행 처리
- TanStack Router error/notFound 처리와 i18n/다크모드/접근성까지 한 번에 완성
- tech-architect 검증(94/100)과 개선사항 반영으로 품질 확보

#### 🔧 개선점

- named export vs default import 불일치로 통합 시점에 수정 반복 발생
- Storybook args 타입 누락과 notFound 변경으로 기존 테스트 실패
- pre-commit 훅(tsc+vitest)에서 3회 실패 → 사전 검증 체계 필요

#### 🤖 에이전트 개선 제안

- **feature-developer**: 새 컴포넌트 export 형태( default/named )를 작업 요약에 명시
- **test-specialist**: 스토리 args 타입 체크리스트 추가 (required args 누락 방지)
- **master-orchestrator**: 권한 제약(pnpm 미보유) 사전 고지 및 검증 위임 타이밍 명확화

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
