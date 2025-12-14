# Change Log

모든 주요 변경사항이 이 파일에 문서화됩니다.

## [2025-12-14]

### 추가

- i18next 기반 다국어 시스템 구현 (`src/shared/config/i18n/`)
  - 타입 안전한 번역 키 시스템 (Zod 스키마 기반)
  - 언어별 JSON 파일 (ko, en, ja)
  - 번역 키 일관성 테스트 추가
- Giscus 댓글 시스템 추가 (`src/shared/components/reply/`)
- Link 컴포넌트 추가 (`src/shared/components/ui/link/`)
- UI 다국어 지원 설계 문서 추가 (`.kiro/specs/ui-i18n/`)
  - 요구사항, 설계, 태스크 문서
- 인간-AI 협업 의사결정 로그 문서 추가 (`docs/decision-log.md`)
  - Phase별 기술적 의사결정과 그 배경 기록
  - 프롬프트, AI 판단, 추가 수정 사항 추적 형식
  - 협업 패턴 분석 섹션 포함
- Typography 컴포넌트 추가 (`src/entities/markdown/ui/Typography.tsx`)
  - heading 컴포넌트(h1-h5) 분리

### 수정

- React key 처리 및 Link 컴포넌트 타입 안전성 개선
- locale-provider에 i18next 통합

### 리팩토링

- 마크다운 컴포넌트 구조 개선
  - 인라인/블록 코드 렌더링 로직을 Code 컴포넌트로 분리
  - setMdxComponents에서 분리된 컴포넌트 사용하도록 리팩토링
- getMarkdown에 locale 기반 URL 디코딩 처리 추가
- PostDetailPage에 빈 slug 파라미터 검증 추가
- markdown 스키마 문서화 및 필드 순서 개선
- @base-ui/react Button을 커스텀 Button 컴포넌트로 교체
- RecentPostBlock에 locale prop 전달
- 코드 컴포넌트 다크모드 지원 및 스타일 개선

### 수정

- README.md 업데이트 (의사결정 로그 문서 링크 추가, 언어 선택기 구현 방식 업데이트)

---

## [2025-12-13]

### 추가

- Button 컴포넌트 구현 (`src/shared/components/ui/button.tsx`)
  - 4가지 variant (primary, default, danger, link)
  - 2가지 shape (fill, outline)
  - 다크 모드 지원
  - 접근성 고려 (focus-visible, disabled 상태)
- Button 컴포넌트 테스트 (`button.test.tsx`)
  - Property-Based 테스트 (fast-check) 도입
  - Unit 테스트 작성
- Button 컴포넌트 Storybook 스토리 (`button.stories.tsx`)
- Vitest 테스트 환경 설정 파일 추가 (`vitest.setup.ts`)
- Button 컴포넌트 Kiro Spec 추가 (`.kiro/specs/button-component/`)

### 리팩토링

- UI 컴포넌트 디렉토리 재구성 (`shared/ui/` → `shared/components/`)
  - `locale-toggle` → `shared/components/toggle/locale-toggle/`
  - `theme-toggle` → `shared/components/toggle/theme-toggle/`
  - `turnstile` → `shared/components/turnstile/`

### 수정

- Vitest 설정 개선 (`vitest.config.ts`)
- Storybook preview 설정 업데이트
- Husky pre-commit 훅 업데이트
- pnpm workspace 설정 업데이트

### 제거

- E2E 예제 테스트 파일 삭제 (`e2e/example.spec.ts`)
- Kiro hooks 정리:
  - `auto-storybook.kiro.hook` 삭제
  - `code-quality-check.kiro.hook` 삭제

## [2025-12-12]

### 추가

- 프로필 섹션 및 소셜 링크 추가 (`src/features/about/ui/about-block.tsx`)
- 프로필 이미지 추가 (`public/image/git-profile.png`)
- 컨텍스트 기반 로케일 관리 구현:
  - `src/shared/providers/locale-provider.tsx` - 로케일 Provider
  - `src/shared/stores/locale-store.ts` - Zustand 로케일 store

### 리팩토링

- MDX 엔티티를 통합 마크다운 엔티티로 마이그레이션:
  - `src/entities/mdx/` → `src/entities/markdown/`
  - MDX 의존성 제거 및 마크다운 처리 단순화
- 언어 선택기 CSS 모듈을 Tailwind 유틸리티 클래스로 마이그레이션
  - `src/shared/ui/toggle/locale-toggle/index.module.css` 삭제
- 폰트 설정 인라인화 (`src/shared/config/font.ts` 삭제)

### 수정

- 개발 워크플로우 개선 및 ESLint 설정 최적화
- `@types/mdx` 타입 정의 추가
- 빌드 검증 개선 (husky)

## [2025-12-10]

### 추가

- 테마 토글 컴포넌트 (`src/shared/ui/toggle/theme-toggle/`)
- 테마 Provider 및 Zustand store (`theme-provider.tsx`, `theme-store.ts`)
- 언어별 아이콘 추가 (`public/icon/en.svg`, `ja.svg`, `ko.svg`)
- 프로젝트 문서 추가:
  - `docs/code-style.md` - 코드 스타일 가이드
  - `docs/getting-started.md` - 시작 가이드
  - `docs/git-guide.md` - Git 워크플로우 가이드
  - `docs/hooks-guide.md` - Kiro Hooks 사용 가이드
  - `docs/rule.md` - 개발 규칙
  - `docs/security.md` - 보안 가이드

### 수정

- Header/Footer 위젯에 언어 선택기 및 테마 토글 통합
- MDX 컴포넌트 렌더링 개선 (`set-mdx-components.tsx`)
- Contact form 및 Post 카드 컴포넌트 스타일 개선
- 글로벌 CSS 업데이트
- 프로젝트 문서 업데이트:
  - `README.md` - 프로젝트 개요 개선
  - `docs/ARCHITECTURE.md` - 아키텍처 문서 보완
  - `docs/DEPLOYMENT.md` - 배포 가이드 업데이트
  - `docs/TESTING.md` - 테스팅 가이드 업데이트
  - `docs/ai-checklist.md` - AI 검증 체크리스트 (이름 변경)

### 리팩토링

- UI 컴포넌트 디렉토리 재구성 (`shared/components/` → `shared/ui/`)
  - `theme-toggle` → `shared/ui/toggle/theme-toggle/`
  - `turnstile` → `shared/ui/turnstile/`
- 불필요한 Storybook assets 및 Configure.mdx 제거

### 제거

- 사용하지 않는 이미지 assets 정리 (accessibility, addon-library, docs 등 16개 파일)
- `docs/absolute-rule.md` 삭제 (rule.md로 통합)

## [2025-12-09]

### 추가

- Kiro hooks JSON 설정 파일 및 문서화 추가 (`.kiro/hooks.json`, `.kiro/hooks/README.md`)
- 자동화 hooks 구현:
  - `auto-doc-update.kiro.hook` - 문서 자동 업데이트
  - `auto-storybook.kiro.hook` - Storybook 스토리 자동 생성
  - `auto-test-on-save.kiro.hook` - 저장 시 테스트 자동 실행
  - `code-quality-check.kiro.hook` - 코드 품질 검사
- Kiro steering 규칙 추가:
  - `product.md` - 제품 개요 및 아키텍처
  - `structure.md` - 프로젝트 구조 가이드
  - `tech.md` - 기술 스택 정보
- 마크다운 고급화 스펙 문서 추가 (`.kiro/specs/markdown-enhancement/`)

### 수정

- README.md 업데이트

## [2025-12-08]

### 추가

- `NEXT_LOCALE` 쿠키를 이용한 언어 설정 영속성 구현
- 다크 모드 토글 기능 및 UI 구현
- 헤더 및 내비게이션 UI 개선

### 수정

- 불필요한 에셋 및 설정 파일 정리
- 컴포넌트 임포트 경로 리팩토링

## [2025-12-06]

### 추가

- Tailwind CSS를 사용한 포스트 카드 컴포넌트 작업
- MDX 컴포넌트 렌더링 개선

### 수정

- Turbopack 폰트 오류 수정
- MDX 로더 관련 직렬화 오류 해결
- 로케일 타입 사용 오류 수정

## [2025-12-04]

### 보안 업데이트

> [!IMPORTANT]
> React 서버 컴포넌트의 심각한 보안 취약점([CVE-2025-55182](https://github.com/advisories/GHSA-fmh4-wr37-44fp), CVSS 10.0) 대응을 위한 긴급 업데이트입니다. 이 취약점은 인증되지 않은 원격 코드 실행(RCE)을 허용하며, 실제로 악용 사례가 보고되어 CISA KEV 카탈로그에 등재되었습니다.

관련 보안 권고:

- [React 공식 보안 권고](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- [Next.js 보안 권고](https://github.com/vercel/next.js/security/advisories/GHSA-q84m-rmw3-4382)

### 업데이트

- Next.js를 16.0.3에서 16.0.7로 업그레이드
- React 및 React DOM을 19.2.0에서 19.2.1로 업그레이드
- @types/react를 19.2.7로, @types/react-dom을 19.2.3으로 업데이트
- eslint-config-next를 16.0.7로 업데이트
- @netlify/plugin-nextjs를 5.14.7에서 5.15.1로 업데이트
- @playwright/test를 1.56.1에서 1.57.0으로 업데이트
- Storybook 및 관련 애드온을 10.1.4로 업데이트

### 추가

- VSCode 설정 파일 추가
- 모든 Noto Sans 폰트 설정에 `preload: true` 속성 추가
- 폰트 로딩 전략 최적화로 Core Web Vitals 개선

## [2025-12-02]

### 추가

- 다국어 지원을 위한 언어별 게시물 인덱스 파일 생성
- en, ja, ko 게시물 디렉토리 유지를 위한 `.gitkeep` 파일 추가
- MDX 파일에서 게시물 인덱스 생성 기능
- GitHub 스타일 마크다운 지원

### 수정

- Netlify 빌드 명령어 간소화
- `netlify-cli` 개발 종속성 추가
- 게시물 목록 표시 로직 변경 (인덱스 파일 기반)

### 기능

- 게시물 상세 페이지 추가
- 게시물 관련 컴포넌트를 `post` 기능 폴더로 재구성
- 게시물 스키마 정의

## [2025-11-30]

### 추가

- Cloudflare Turnstile 타입 정의 및 의존성 추가
- 반응형 디자인을 위한 커스텀 훅 구현:
  - `useResize`: 윈도우 리사이즈 감지
  - `useBreakpoint`: 브레이크포인트 기반 반응형 로직
  - `useDetectScrolled`: 스크롤 감지
- 헤더 반응형 디자인 기본 설정

### 수정

- `NavigationBar` 컴포넌트 삭제 및 `Header` 위젯에서 직접 구현
- 헤더 너비 속성을 `max-w`로 변경
- 링크에 `aria-label` 추가로 접근성 개선
- SSR 호환성을 위한 window 객체 접근 검사 추가

### 제거

- Prettier TailwindCSS 플러그인 제거

## [2025-11-28]

### 추가

- 프로젝트 할 일 목록 및 문서 업데이트

### 수정

- Contact form 버튼에서 토큰이 없을 때 "Check Robot" 텍스트 표시
- Submit 버튼 비활성화 및 스타일 업데이트
- Contact form import 경로 리팩토링

### 제거

- Deno lock 파일 제거
- 사용하지 않는 헤더 스타일 제거

## [2025-11-26]

### 추가

- 로케일 기반 라우팅 및 콘텐츠가 포함된 국제화(i18n) 구현

## [2025-11-25]

### 추가

- Cloudflare Turnstile 통합
- 페이지 메타데이터 추가
- 종합적인 SEO 메타데이터 설정
- README에 프로젝트 설명 및 개발 지침 추가
- Contact form에 Zod 검증 및 토스트 알림 구현

### 수정

- 헤더의 블로그 제목 업데이트
- Mail 함수에서 발신자 이메일 처리 개선
- Mail 함수에서 이메일 데이터 파싱 수정

### 되돌림

- Contact form 관련 일부 커밋 되돌림

## [2025-11-24]

### 추가

- Zod를 사용한 검증이 포함된 새로운 contact form 컴포넌트
- Resend를 통한 이메일 제출 처리를 위한 Netlify 함수
- API 리디렉션이 포함된 Netlify 설정
- Netlify 함수용 TypeScript 설정
- Toast 스타일링을 위한 CSS 모듈

### 수정

- Contact 페이지를 새로운 contact form 컴포넌트를 활용하도록 리팩토링
- Navigation bar 스타일링 개선
- 헤더 및 푸터 컴포넌트 브랜딩 및 사용자 경험 개선
- 홈페이지의 PostCardList를 AboutEnglishMarkdown으로 교체

### 설정

- `.gitignore`에 reports 및 Netlify 디렉토리 추가
- 개선된 배포 및 환경 관리를 위한 `deno.lock` 및 `netlify.toml` 추가
- 테스트 리포트를 위한 출력 디렉토리를 지정하도록 Playwright 설정 업데이트
- `@netlify/plugin-nextjs` 및 `resend`를 포함한 새로운 종속성 추가

## [2025-11-23]

### 추가

- Prettier 포매팅에서 특정 디렉토리 및 파일을 제외하는 `.prettierignore` 파일
- Chromatic 통합을 위한 `chromatic.config.json`
- MDX 지원을 위한 `next.config.ts` (페이지 확장 업데이트)
- E2E 테스팅을 위한 Playwright 설정
- Storybook 통합 단위 테스트를 위한 Vitest 설정
- PostCSS 및 Prettier 설정
- 새로운 마크다운 콘텐츠 및 다양한 프로젝트 자산

### 수정

- Playwright 및 Storybook 관련 파일을 포함하도록 `.gitignore` 업데이트
- Vitest 및 Storybook 플러그인을 통합한 새로운 TypeScript 기반 ESLint 설정
- 프리커밋 훅을 위한 lint-staged 설정
- 테스팅 및 Storybook을 위한 새로운 종속성으로 `package.json` 업데이트

## [2025-11-21]

### 추가

- 블로그 기능 및 페이지 개발 체크리스트

## [2025-11-20]

### 추가

- 커스텀 MDX 렌더링을 위한 `useMDXComponents`
- MDX 지원 및 확장 업데이트를 위한 `next.config.mts`
- 기사 표시를 위한 포스트 카드 리스트 기능
- 개선된 구조 및 스타일링을 위한 Header 및 Footer 컴포넌트
- 자동 포매팅 및 린팅을 위한 lint-staged 설정 및 Husky 프리커밋 훅
- PostCSS 설정 추가

### 수정

- MDX 및 구문 강조를 위한 새로운 종속성으로 `package.json` 및 `pnpm-lock.yaml` 업데이트
- MDX 파일을 포함하도록 TypeScript 설정 개선
- 개선된 스타일링 및 사용자 경험을 위한 navigation 링크 리팩토링
- 개선된 스타일링 및 폰트 관리를 위한 layout 및 page 컴포넌트 업데이트
- Tailwind CSS 버전 업그레이드
- HTML 태그의 hydration 경고 억제를 위한 layout.tsx 업데이트

### 제거

- 레거시 `next.config.ts` 제거
- 프로젝트에 더 이상 필요하지 않은 PostCSS 설정 파일 제거
- 사용하지 않는 SVG 파일 제거

### 구조 개선

- MTS 형식으로 ESLint 설정 교체
- 프로젝트 구조 개선 및 레이아웃 업데이트

## [Initial Commit - 2025-11-20]

### 추가

- Create Next App에서 초기 프로젝트 구조 생성

---

## 관련 문서

- [구현 계획](./implementation-plan.md) - 기술 스택 및 진행 상황
- [할 일 목록](./todo.md) - 남은 작업

> 📖 전체 문서 목록은 [문서 홈](../README.md)을 참고하세요.
