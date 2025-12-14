# 블로그 구현 계획

## 기술 스택

### Framework

- Next.js 16
- React 19 (+ React Compiler)

### Styling & UI

- Tailwind CSS v4
- Base UI Components (@base-ui/react)

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

- next-mdx-remote-client (원격 마크다운 렌더링)
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

- Zustand 상태 관리
- localStorage 연동 (시스템 설정 우선 → 사용자 선택 보존)
- 다크 모드 토글 UI

#### 9. 언어 선택기

- 언어 선택 UI 컴포넌트 (`src/shared/ui/toggle/locale-toggle/`)
- 언어별 아이콘 (en.svg, ja.svg, ko.svg)
- 쿠키 기반 언어 설정 영속성 (NEXT_LOCALE)
- 컨텍스트 기반 로케일 관리 (locale-provider, locale-store)
- Header에 통합

#### 10. Kiro AI 설정

- Kiro hooks 설정 (`.kiro/hooks.json`)
  - 문서 자동 업데이트 훅
  - Storybook 스토리 자동 생성 훅
  - 저장 시 테스트 자동 실행 훅
  - 코드 품질 검사 훅
- Kiro steering 규칙 (`.kiro/steering/`)
  - `product.md` - 제품 개요
  - `structure.md` - 프로젝트 구조
  - `tech.md` - 기술 스택
- 마크다운 고급화 스펙 (`.kiro/specs/markdown-enhancement/`)

#### 11. 코드 정리 및 리팩토링

- UI 컴포넌트 디렉토리 재구성 (`shared/components/` → `shared/ui/`)
  - `theme-toggle` → `shared/ui/toggle/theme-toggle/`
  - `turnstile` → `shared/ui/turnstile/`
- 불필요한 Storybook assets 제거 (16개 파일)
- Configure.mdx 제거

#### 12. 마크다운 엔티티 리팩토링

- MDX 엔티티를 통합 마크다운 엔티티로 마이그레이션 (`entities/mdx/` → `entities/markdown/`)
- MDX 의존성 제거 및 마크다운 처리 단순화
- CSS 모듈을 Tailwind 유틸리티 클래스로 마이그레이션 (locale-toggle)
- 폰트 설정 인라인화 (font.ts 삭제)
- Typography 컴포넌트 분리 (h1-h5 heading)
- Code 컴포넌트 분리 (인라인/블록 코드 렌더링)
- 다크모드 지원 및 스타일 개선

#### 13. About 페이지 개선

- 프로필 섹션 및 소셜 링크 추가
- 프로필 이미지 추가 (`public/image/git-profile.png`)

#### 14. 프로젝트 문서화

- 개발 가이드 문서 작성:
  - `docs/code-style.md` - 코드 스타일 가이드
  - `docs/getting-started.md` - 프로젝트 시작 가이드
  - `docs/git-guide.md` - Git 워크플로우 가이드
  - `docs/hooks-guide.md` - Kiro Hooks 사용 가이드
  - `docs/rule.md` - 핵심 개발 규칙
  - `docs/security.md` - 보안 가이드라인
- 기존 문서 업데이트 및 개선
- AI 체크리스트 이름 변경 (`AI-VALIDATION-CHECKLIST.md` → `ai-checklist.md`)

#### 15. Button 컴포넌트

- Button 컴포넌트 구현 (`src/shared/components/ui/button.tsx`)
  - 4가지 variant: primary, default, danger, link
  - 2가지 shape: fill, outline
  - 다크 모드 지원
  - 접근성 고려 (focus-visible, disabled 상태)
- Property-Based 테스트 도입 (fast-check)
- Storybook 스토리 작성
- Kiro Spec 문서화

#### 16. UI 컴포넌트 디렉토리 재구성

- `shared/ui/` → `shared/components/`로 마이그레이션
  - `toggle/locale-toggle/` 이동
  - `toggle/theme-toggle/` 이동
  - `turnstile/` 이동
- 새로운 `ui/` 디렉토리에 공통 UI 컴포넌트 배치

#### 17. i18next 기반 다국어 시스템

- i18n 설정 구현 (`src/shared/config/i18n/`)
  - 타입 안전한 번역 키 시스템 (Zod 스키마 기반)
  - 언어별 JSON 파일 (ko.json, en.json, ja.json)
  - 번역 키 일관성 테스트
- locale-provider에 i18next 통합
- UI 다국어 지원 설계 문서 작성 (`.kiro/specs/ui-i18n/`)

#### 18. Giscus 댓글 시스템

- Giscus 댓글 컴포넌트 구현 (`src/shared/components/reply/`)
- GitHub Discussions 기반 댓글 시스템 통합

#### 19. Link 컴포넌트

- 타입 안전한 Link 컴포넌트 구현 (`src/shared/components/ui/link/`)
- React key 처리 및 타입 안전성 개선

## 기술적 고려사항

### FSD 아키텍처

현재 프로젝트는 Feature-Sliced Design 아키텍처를 따르고 있습니다:

- `src/app`: Next.js App Router 페이지
- `src/features`: 도메인 기능 (about, contact, post)
- `src/entities`: 비즈니스 엔티티 (markdown 등)
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

## 관련 문서

- [개발 규칙](./rule.md) - 핵심 개발 원칙
- [아키텍처](./architecture.md) - FSD 구조 상세
- [변경 로그](./changelog.md) - 버전별 변경 내역
- [할 일 목록](./todo.md) - 남은 작업

---

> 📖 전체 문서 목록은 [문서 홈](../README.md)을 참고하세요.
