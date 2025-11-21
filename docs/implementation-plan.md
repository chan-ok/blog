# 블로그 구현 계획

## 0. 기술 스택 및 베이스라인
- Next.js 16 App Router + React 19 + TypeScript 5.
- 상태/데이터: TanStack Query(SSR-friendly) + 서버/클라이언트 fetch 유틸.
- 폼: TanStack Form 또는 React Hook Form 중 하나 선택, Contact 폼에 우선 도입.
- 검증: Zod 스키마(폼, API, 마크다운 frontmatter) 재사용.
- 스타일: Tailwind CSS 4 + Base Web UI 라이브러리.
- 포맷팅/품질: ESLint 9 + Prettier + Tailwind 플러그인, Husky + lint-staged.
- 테스트: Vitest + @testing-library/react로 단위/컴포넌트 테스트, Playwright로 E2E.
- 스토리북: 컴포넌트 카탈로그 및 비주얼 회귀 테스트 자동화 파이프라인 준비.

## 1. 국제화 라우팅 및 레이아웃
1. `(locale)` 세그먼트 적용: `src/app/[locale]/layout.tsx` 도입, 지원 언어 배열(`['ko','jp']`) 정의.
2. 미들웨어에서 브라우저 언어 감지 → ko/jp 매핑 후 기본 ko 폴백.
3. `RootLayout`에서 `<html lang>` 동적 설정, 공통 Header/Footer/Navigation 구성.
4. 언어별 텍스트/컨텐츠는 `messages/{locale}.ts` 혹은 MDX frontmatter 기반으로 분리.

## 2. 페이지별 구현 전략
- **Home/About**: 고정 마크다운(`markdown/about.{locale}.md`)을 `next-mdx-remote` 혹은 커스텀 파서로 렌더링. Home은 About 컴포넌트 재사용.
- **Posts 목록**:
  - 마크다운 파일 메타(frontmatter) → 빌드 시 `contentlayer` 대체 유틸 또는 자체 parser로 JSON 캐시 생성.
  - TanStack Query + 무한 스크롤 훅으로 클라이언트 페이지네이션. 초기 데이터는 서버 컴포넌트에서 dehydrated state로 전달.
- **Post 상세**:
  - `/[locale]/posts/[slug]/page.tsx`에서 SSG(+revalidate) 전략, frontmatter 기반 SEO 메타.
  - MDX 렌더링 시 rehype-highlight로 코드블록 스타일 유지.
- **Contact**:
  - Base Web 폼 컴포넌트 + TanStack Form/RHF.
  - Zod 스키마로 입력 검증 → `app/api/contact/route.ts`에서 이메일 전송(SMTP or API placeholder).

## 3. 데이터 및 콘텐츠 파이프라인
1. `markdown/posts/{locale}/{slug}.md` 구조 채택.
2. 빌드 시 `scripts/generate-post-index.ts`로 frontmatter 파싱 → `.cache/posts.json`.
3. API Route(`/api/posts`) 또는 서버 액션으로 목록/상세 데이터 제공.
4. 언어별 콘텐츠 동기화는 frontmatter `locale` 필드로 제어.

## 4. 폼 및 검증 흐름
1. Contact Form: Zod 스키마 정의 → TanStack Form/RHF resolver 연동.
2. 서버도 동일 스키마 재사용하여 런타임 타입 안전 확보.
3. 오류/성공 메시지는 locale별 사전에서 가져와 UI에 반영.

## 5. 필수 기능 구현 순서
1. 개발 환경 세팅(위 스택 설치 + lint/prettier/husky).
2. 국제화 라우팅 뼈대 + 공통 레이아웃/네비게이션.
3. About/Home 마크다운 렌더링.
4. Posts 무한 스크롤 목록.
5. Posts 상세 페이지 및 SEO 메타.
6. Contact 폼 + 메일 전송 API.
7. 언어 폴백, 에러 페이지, 기본 테스트/배포 스크립트.

## 6. 차후 확장 로드맵
1. 댓글 시스템(비회원/회원 여부 결정, 저장소 선택).
2. 다크 모드 토글(Tailwind `data-theme` + Base Web theming).
3. 반응형 레이아웃 최적화(Tailwind breakpoints, Base Web responsive props).
4. TOC + 읽는 시간: 마크다운 AST에서 헤딩 추출, 단어 수 기반 ETA.
5. Frontmatter `published` 필드로 게시 상태 제어.
6. 게시 후 AI 요약 + 썸네일 자동화(서버 액션/웹훅).
7. 추가 제안: 검색/태그 필터, RSS/Atom, Analytics, PWA.

