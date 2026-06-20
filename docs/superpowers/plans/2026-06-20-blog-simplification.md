# 블로그 최소화 재구성 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **검증 방식 주의:** 이 프로젝트는 테스트 파일이 0개이고 테스트 인프라(testing-library/jsdom)를 제거한다. 따라서 TDD를 적용하지 않으며, 각 변경의 검증은 **`npm run tsc` → `npm run lint` → `npm run build` → 로컬 동작 확인**으로 한다.
>
> **실행 주체:** 실제 구현·커밋·명령 실행은 Codex가 수행한다(Claude Code는 플랜·감시 역할). 커밋은 각 Task 단위로 잘게 한다.

**Goal:** 다국어(ko/ja) 개인 블로그를 home/about/post 3메뉴 + FSD 4단계(app/entities/features/shared)로 최소화하고, 의존성을 정리·최신화한다.

**Architecture:** TanStack Router 파일 라우팅을 `src/app/routes`로 이동(pages 레이어 제거). 데이터 페칭은 React Query를 제거하고 router loader + React 19 `use()`/Suspense로 통일. 마크다운 렌더 파이프라인(unified/@mdx-js)은 유지하되 컴포넌트만 통합. 테마는 `prefers-color-scheme` 자동. React Compiler를 빌드에 통합.

**Tech Stack:** React 19, TanStack Router, Vite 8(rolldown), Tailwind v4, i18next, @mdx-js/mdx, oxlint/oxfmt.

**설계 출처:** [docs/superpowers/specs/2026-06-19-blog-simplification-design.md](../specs/2026-06-19-blog-simplification-design.md)

---

## 최종 파일 구조 (목표)

```
src/
  app/
    main.tsx
    globals.css                 # prefers-color-scheme 자동 다크
    routes/                     # ← 기존 src/pages
      __root.tsx
      $locale.tsx
      $locale/index.tsx         # 홈 = About 소개만
      $locale/about.tsx
      $locale/posts/index.tsx   # 목록(태그·검색 없음)
      $locale/posts/$.tsx       # 상세(+ TOC)
    routeTree.gen.ts
  entities/markdown/
    index.tsx                   # MDComponent (loader 데이터 주입)
    model/markdown.schema.ts
    util/{get-markdown,get-frontmatter,set-md-components,remark-obsidian-image,rehype-unwrap-images}
    ui/{code-block,mermaid-diagram,image-block}.tsx
  features/post/
    model/post.schema.ts
    ui/{about-block,post-card-list,table-of-contents}.tsx
    util/get-posts.ts
  shared/
    locale/{provider,store,toggle,config,schema,types}.tsx + locales/{ko,ja}.json
    components/layout/{header,footer}.tsx
    components/error-page/, components/ui/{button,link,optimized-image}/
    config/api/
    types/{common.schema,global.d,mdx.d}.ts
    util/{build-meta,sanitize}.ts
```

## Phase 개요 / 실행 순서

0. 준비(워킹트리 정리 + 작업 브랜치)
1. 기능·파일 삭제(contact, 태그, 검색, 부가기능, en)
2. 마크다운 컴포넌트 통합
3. 데이터 페칭 전환(React Query → router loader)
4. FSD 재구성(about→post, locale 묶기, pages→app/routes)
5. 테마 자동 + 푸터 이메일
6. React Compiler 적용
7. 의존성 제거 + 업그레이드
8. 최종 검증

각 Phase는 독립적으로 빌드 가능한 상태를 유지하도록 정렬했다.

---

## Phase 0: 준비

### Task 0.1: 워킹트리 정리 및 작업 브랜치 생성

**Files:** 없음(git 작업)

- [ ] **Step 1: 현재 변경사항 확인**

Run: `git status --short`
Expected: 다수의 `M`(globals.css 등) — 기존 미커밋 작업.

- [ ] **Step 2: 기존 변경 처리**

기존 변경이 이번 작업과 무관하면 별도 커밋하거나 `git stash`로 보관. (사용자 확인 필요 — 무관한 변경을 임의로 커밋하지 말 것.)

- [ ] **Step 3: 작업 브랜치 생성** (현재 `develop`에서 분기. 규칙: feature→develop PR)

```bash
git switch -c feat/blog-simplification
```

---

## Phase 1: 기능·파일 삭제

> 의존을 줄이기 위해 삭제를 먼저 한다. 삭제 후 import 깨짐은 각 Task에서 함께 정리한다.

### Task 1.1: contact 전면 삭제

**Files:**

- Delete: `src/features/contact/` (전체), `src/pages/$locale/contact.tsx`, `src/shared/components/turnstile/`
- Delete: `netlify/functions/mail.mts`, `netlify/functions/tsconfig.node.json`, `netlify/functions/tsconfig.node.tsbuildinfo`
- Modify: `src/shared/components/layout/header.tsx` (Contact nav 링크 제거)
- Modify: `vite.config.ts` (`define`의 `VITE_TURNSTILE_SITE_KEY` 제거)
- Modify: `netlify.toml` (functions 설정이 있으면 정리)

- [ ] **Step 1: 디렉터리/파일 삭제**

```bash
git rm -r src/features/contact src/shared/components/turnstile src/pages/$locale/contact.tsx
git rm netlify/functions/mail.mts netlify/functions/tsconfig.node.json netlify/functions/tsconfig.node.tsbuildinfo
```

- [ ] **Step 2: header.tsx에서 Contact 링크 제거**

`src/shared/components/layout/header.tsx`의 아래 블록을 삭제:

```tsx
<Link href="/contact" aria-label="Contact" className={navLinkClass('/contact')}>
  Contact
</Link>
```

- [ ] **Step 3: vite.config.ts에서 turnstile define 제거**

`define` 객체에서 `'import.meta.env.VITE_TURNSTILE_SITE_KEY': ...` 라인을 삭제. (`global: 'globalThis'`는 유지)

- [ ] **Step 4: 잔여 참조 확인**

Run: `grep -rn "contact\|turnstile\|Turnstile\|mail.mts" src netlify.toml`
Expected: 매칭 없음(또는 i18n 문자열만 — 다음 Task에서 정리).

- [ ] **Step 5: 검증 + 커밋**

```bash
npm run tsc && git add -A && git commit -m "refactor: remove contact feature and netlify mail function"
```

### Task 1.2: 태그 기능 삭제

**Files:**

- Delete: `src/features/post/ui/tag-chip.tsx`, `src/features/post/ui/tag-filter-bar.tsx`, `src/features/post/util/get-available-tags.ts`
- Modify: `src/features/post/util/get-posts.ts` (tags/DEV_ONLY_TAGS 필터 제거)
- Modify: `src/features/post/model/post.schema.ts` (`tags` 필드 제거 from `GetPostsProps`, `GetAvailableTagsProps` 제거)
- Modify: `src/pages/$locale/posts/index.tsx` (TagFilterBar, availableTags 쿼리 제거)
- Modify: `src/features/post/ui/post-card.tsx` (태그 표시 제거 — 해당 파일에서 tag 렌더 부분)

- [ ] **Step 1: 파일 삭제**

```bash
git rm src/features/post/ui/tag-chip.tsx src/features/post/ui/tag-filter-bar.tsx src/features/post/util/get-available-tags.ts
```

- [ ] **Step 2: get-posts.ts 정리**

`getPosts`에서 `tags` 파라미터, `DEV_ONLY_TAGS`/`hasDevOnlyTag`/태그 필터 블록을 제거. draft 숨김은 `published` + 프로덕션 분기로 유지. 정리 후 시그니처:

```ts
export async function getPosts(props: GetPostsProps): Promise<PagingPosts> {
  const { locale, page = 0, size = 10 } = props;
  const baseURL = import.meta.env.VITE_GIT_RAW_URL;
  // ... fetch /${locale}/index.json ...
  // filter: published === true, createdAt desc 정렬, 페이징
}
```

(query 필터는 Task 1.3에서 함께 제거)

- [ ] **Step 3: post.schema.ts 정리**

`GetPostsProps`에서 `tags?`, `query?` 제거(query는 1.3), `GetAvailableTagsProps` 인터페이스 삭제.

- [ ] **Step 4: posts/index.tsx에서 태그 UI 제거**

`TagFilterBar` import/사용, `useSuspenseQuery(availableTags)`, `getAvailableTags` import, `tags` search 파싱 제거.

- [ ] **Step 5: post-card.tsx 태그 표시 제거**

`post-card.tsx`에서 태그 렌더링 부분 삭제(제목·날짜만 남김).

- [ ] **Step 6: 검증 + 커밋**

```bash
npm run tsc && git add -A && git commit -m "refactor: remove tag feature from posts"
```

### Task 1.3: 검색 기능 삭제

**Files:**

- Delete: `src/features/post/ui/post-search-input.tsx`
- Modify: `src/features/post/util/get-posts.ts` (query 필터 제거 — 1.2에서 미처리분)
- Modify: `src/pages/$locale/posts/index.tsx` (PostSearchInput, q search, validateSearch 정리)

- [ ] **Step 1: 파일 삭제**

```bash
git rm src/features/post/ui/post-search-input.tsx
```

- [ ] **Step 2: get-posts.ts에서 query 필터 제거**

`query` 파라미터와 `if (query.trim()) {...}` 블록 삭제.

- [ ] **Step 3: posts/index.tsx 정리**

`PostSearchInput` import/사용 제거. `searchSchema`(tags/q)와 `validateSearch`가 더 이상 필요 없으면 제거. 결과적으로 목록 페이지는 `PostCardList`만 렌더.

- [ ] **Step 4: 검증 + 커밋**

```bash
npm run tsc && git add -A && git commit -m "refactor: remove post search feature"
```

### Task 1.4: 부가기능 제거 (테마 토글·스크롤·몰입형·이전다음·추천·홈 최근글·읽기시간)

**Files:**

- Delete: `src/shared/components/toggle/theme-toggle/`, `src/shared/components/scroll-progress-bar/`, `src/shared/hooks/use-scroll-progress.ts`, `src/shared/hooks/use-immersive-reader.ts`, `src/shared/stores/theme-store.ts`, `src/shared/providers/theme-provider.tsx`
- Delete: `src/features/post/ui/post-navigation.tsx`, `src/features/post/ui/recent-post-block.tsx`, `src/features/post/util/get-series-posts.ts`, `src/features/post/util/calc-reading-time.ts`
- Modify: `src/shared/components/layout/header.tsx` (ThemeToggle import·사용, useImmersiveReader 로직 제거)
- Modify: `src/pages/$locale/index.tsx` (RecentPostBlock 제거 → AboutBlock만)
- Modify: `src/pages/$locale/posts/$.tsx` (post-navigation, scroll-progress, immersive 사용 제거)
- Modify: `src/app/main.tsx` (ThemeProvider 사용 시 제거)

- [ ] **Step 1: 파일 삭제**

```bash
git rm -r src/shared/components/toggle/theme-toggle src/shared/components/scroll-progress-bar
git rm src/shared/hooks/use-scroll-progress.ts src/shared/hooks/use-immersive-reader.ts
git rm src/shared/stores/theme-store.ts src/shared/providers/theme-provider.tsx
git rm src/features/post/ui/post-navigation.tsx src/features/post/ui/recent-post-block.tsx
git rm src/features/post/util/get-series-posts.ts src/features/post/util/calc-reading-time.ts
```

- [ ] **Step 2: header.tsx 정리**

`ThemeToggle` import/사용 제거. `useImmersiveReader` import/사용 제거. `isHidden` 기반 transform 클래스를 제거하고 sticky header는 항상 표시:

```tsx
// useImmersiveReader 제거 후, header className에서 isHidden 분기 삭제
<header className="sticky top-0 z-50 border-b-2 border-ink bg-bg">
```

(LocaleToggle은 유지)

- [ ] **Step 3: 홈(index.tsx) 정리**

`RecentPostBlock`/`getPosts` loader 제거. 홈은 `AboutBlock`만:

```tsx
function HomePage() {
  return (
    <div className="mx-auto max-w-[680px] py-16">
      <AboutBlock />
    </div>
  );
}
```

(loader/head는 유지하되 postsPromise 관련 제거)

- [ ] **Step 4: 상세($.tsx) 정리**

`post-navigation`, scroll-progress, immersive 관련 import/사용 제거. TOC(`table-of-contents`)는 유지.

- [ ] **Step 5: main.tsx 정리**

`ThemeProvider`로 앱을 감싸고 있으면 제거(테마는 Phase 5에서 CSS로 처리).

- [ ] **Step 6: 잔여 참조 확인**

Run: `grep -rn "ThemeToggle\|theme-store\|theme-provider\|ImmersiveReader\|ScrollProgress\|RecentPost\|PostNavigation\|reading-time\|getSeriesPosts" src`
Expected: 매칭 없음.

- [ ] **Step 7: 검증 + 커밋**

```bash
npm run tsc && git add -A && git commit -m "refactor: remove theme toggle, scroll/immersive, post nav, recent posts, reading time"
```

### Task 1.5: 영어(en) 로케일 제거

**Files:**

- Delete: `src/shared/config/i18n/locales/en.json`
- Modify: `src/shared/config/i18n/index.ts` (en 리소스 등록 제거)
- Verify: `src/shared/types/common.schema.ts` (이미 `['ko','ja']` — 확인만)

- [ ] **Step 1: en.json 삭제**

```bash
git rm src/shared/config/i18n/locales/en.json
```

- [ ] **Step 2: i18n config에서 en 제거**

`src/shared/config/i18n/index.ts`에서 `en` import 및 `resources.en` 등록 제거. fallback/supportedLngs를 `['ko','ja']`로.

- [ ] **Step 3: 잔여 en 참조 확인**

Run: `grep -rn "'en'\|\"en\"\|/en\b\|en\.json\|locales/en" src`
Expected: en 관련 매칭 없음(주석 제외).

- [ ] **Step 4: 검증 + 커밋**

```bash
npm run tsc && npm run build && git add -A && git commit -m "refactor: drop English locale, keep ko/ja"
```

---

## Phase 2: 마크다운 컴포넌트 통합

### Task 2.1: 단순 MD 컴포넌트를 set-md-components로 인라인 통합

**Files:**

- Modify: `src/entities/markdown/util/set-md-components.tsx` (blockquote, inline code, table-wrapper, typography를 인라인화)
- Delete: `src/entities/markdown/ui/blockquote.tsx`, `src/entities/markdown/ui/code.tsx`, `src/entities/markdown/ui/table-wrapper.tsx`, `src/entities/markdown/ui/typography.tsx`
- Keep: `src/entities/markdown/ui/code-block.tsx`, `mermaid-diagram.tsx`, `image-block.tsx`

- [ ] **Step 1: set-md-components.tsx 확인**

Run: `cat src/entities/markdown/util/set-md-components.tsx`
현재 어떤 컴포넌트를 import해서 매핑하는지 파악.

- [ ] **Step 2: 단순 컴포넌트 인라인화**

`blockquote`, inline `code`, `table`/`table-wrapper`, `typography`(h1~h6, p, ul 등)의 렌더를 별도 파일 import 대신 `set-md-components.tsx` 내부 인라인 컴포넌트/함수로 옮긴다. 기존 className·동작은 그대로 보존. `code-block`(하이라이트), `mermaid-diagram`, `image-block`은 계속 파일 import.

- [ ] **Step 3: 통합된 파일 삭제**

```bash
git rm src/entities/markdown/ui/blockquote.tsx src/entities/markdown/ui/code.tsx src/entities/markdown/ui/table-wrapper.tsx src/entities/markdown/ui/typography.tsx
```

- [ ] **Step 4: 검증 + 커밋**

```bash
npm run tsc && npm run build && git add -A && git commit -m "refactor: inline simple markdown components into set-md-components"
```

---

## Phase 3: 데이터 페칭 전환 (React Query → router loader)

> React Query를 제거하고 모든 페칭을 TanStack Router loader + React 19 `use()`/Suspense로 통일한다. 이 Phase는 라우트와 MDComponent를 함께 바꾼다.

### Task 3.1: 마크다운 페칭을 loader로 이동

**Files:**

- Modify: `src/entities/markdown/index.tsx` (`useQuery` 제거 → promise/데이터 주입)
- Modify: `src/pages/$locale/posts/$.tsx` (loader에서 `getMarkdown` 호출)

- [ ] **Step 1: MDComponent 인터페이스 변경**

`src/entities/markdown/index.tsx`에서 `useQuery`/`react-query` 제거. `path` 기반 자체 fetch 대신, 라우트 loader가 만든 `Promise<MarkdownElement>`를 받아 `use()`로 언래핑하도록 변경. 에러/로딩은 Suspense + ErrorBoundary(라우트 레벨)로 위임. 예:

```tsx
import { use } from 'react';
// props: { dataPromise: Promise<MarkdownElement>, components?: MDXComponents }
export default function MDComponent({ dataPromise, components: custom }: Props) {
  const data = use(dataPromise);
  const components = setMdxComponents(custom);
  return <data.MDXContent components={components} />;
}
```

(onParseStatus/onFrontmatterLoaded 콜백은 loader 반환값으로 대체)

- [ ] **Step 2: 상세 라우트 loader에서 getMarkdown 호출**

`src/pages/$locale/posts/$.tsx`의 `loader`에서 `getMarkdown(path)`로 promise를 만들고 컴포넌트에서 `<Suspense>`로 감싼 `<MDComponent dataPromise={...} />`로 렌더. frontmatter(제목/날짜/TOC)도 loader 데이터에서 가져온다.

- [ ] **Step 3: 검증 + 커밋**

```bash
npm run tsc && npm run build && git add -A && git commit -m "refactor: load markdown via router loader and React use()"
```

### Task 3.2: 포스트 목록 페칭을 loader로 이동

**Files:**

- Modify: `src/pages/$locale/posts/index.tsx` (loader에서 getPosts)
- Modify: `src/features/post/ui/post-card-list.tsx` (props로 posts 받기)

- [ ] **Step 1: posts/index.tsx loader 추가**

`loader`에서 `getPosts({ locale, size })`를 호출(또는 promise 전달). `PostCardList`가 `useSuspenseQuery` 대신 loader 데이터/ promise를 받도록 변경.

- [ ] **Step 2: post-card-list.tsx 변경**

react-query 의존 제거. posts(또는 promise)를 props로 받아 렌더. Suspense fallback은 라우트에서.

- [ ] **Step 3: 검증 + 커밋**

```bash
npm run tsc && npm run build && git add -A && git commit -m "refactor: load post list via router loader"
```

### Task 3.3: QueryClientProvider 제거

**Files:**

- Modify: `src/pages/__root.tsx` (QueryClientProvider/QueryClient/react-query devtools 제거)

- [ ] **Step 1: \_\_root.tsx 정리**

`QueryClientProvider`, `QueryClient`, `ReactQueryDevtoolsPanel` import/사용 제거. `<Outlet/>`/`HeadContent`/Router devtools는 유지. 루트에 ErrorBoundary가 필요하면 라우트 `errorComponent`로 충분(이미 존재).

- [ ] **Step 2: 잔여 react-query 참조 확인**

Run: `grep -rn "react-query\|useQuery\|useSuspenseQuery\|QueryClient" src`
Expected: 매칭 없음.

- [ ] **Step 3: 검증 + 커밋**

```bash
npm run tsc && npm run build && git add -A && git commit -m "refactor: remove react-query QueryClientProvider"
```

---

## Phase 4: FSD 재구성

### Task 4.1: about-block을 features/post로 이동

**Files:**

- Move: `src/features/about/ui/about-block.tsx` → `src/features/post/ui/about-block.tsx`
- Delete: `src/features/about/` (빈 디렉터리)
- Modify: `src/pages/$locale/index.tsx`, `src/pages/$locale/about.tsx` (import 경로 변경)

- [ ] **Step 1: 파일 이동**

```bash
git mv src/features/about/ui/about-block.tsx src/features/post/ui/about-block.tsx
```

빈 `src/features/about` 정리.

- [ ] **Step 2: import 경로 갱신**

`@/features/about/ui/about-block` → `@/features/post/ui/about-block` 로 전 참조 변경.

Run: `grep -rn "features/about" src`
Expected: 매칭 없음.

- [ ] **Step 3: 검증 + 커밋**

```bash
npm run tsc && git add -A && git commit -m "refactor: merge about-block into post feature"
```

### Task 4.2: locale 관련을 shared/locale로 묶기

**Files:**

- Move/rename:
  - `src/shared/providers/locale-provider.tsx` → `src/shared/locale/provider.tsx`
  - `src/shared/stores/locale-store.ts` → `src/shared/locale/store.ts`
  - `src/shared/components/toggle/locale-toggle/index.tsx` → `src/shared/locale/toggle.tsx`
  - `src/shared/config/i18n/index.ts` → `src/shared/locale/config.ts`
  - `src/shared/config/i18n/schema.ts` → `src/shared/locale/schema.ts`
  - `src/shared/config/i18n/types.ts` → `src/shared/locale/types.ts`
  - `src/shared/config/i18n/locales/{ko,ja}.json` → `src/shared/locale/locales/{ko,ja}.json`
- Delete: 빈 `providers/`, `stores/`, `components/toggle/`, `config/i18n/`

- [ ] **Step 1: 파일 이동(git mv)**

```bash
mkdir -p src/shared/locale/locales
git mv src/shared/providers/locale-provider.tsx src/shared/locale/provider.tsx
git mv src/shared/stores/locale-store.ts src/shared/locale/store.ts
git mv src/shared/components/toggle/locale-toggle/index.tsx src/shared/locale/toggle.tsx
git mv src/shared/config/i18n/index.ts src/shared/locale/config.ts
git mv src/shared/config/i18n/schema.ts src/shared/locale/schema.ts
git mv src/shared/config/i18n/types.ts src/shared/locale/types.ts
git mv src/shared/config/i18n/locales/ko.json src/shared/locale/locales/ko.json
git mv src/shared/config/i18n/locales/ja.json src/shared/locale/locales/ja.json
```

- [ ] **Step 2: 내부 상대 import 및 외부 참조 갱신**

이동된 파일들 사이의 상대 경로, 그리고 외부에서의 `@/shared/providers/locale-provider`·`@/shared/stores/locale-store`·`@/shared/components/toggle/locale-toggle`·`@/shared/config/i18n` 참조를 `@/shared/locale/*`로 전부 변경.

Run: `grep -rn "shared/providers/locale\|shared/stores/locale\|toggle/locale-toggle\|config/i18n" src`
Expected: 매칭 없음.

- [ ] **Step 3: 빈 디렉터리 정리**

`providers/`, `stores/`, `components/toggle/`, `config/i18n/`가 비었으면 제거.

- [ ] **Step 4: 검증 + 커밋**

```bash
npm run tsc && npm run build && git add -A && git commit -m "refactor: group locale modules under shared/locale"
```

### Task 4.3: pages → app/routes 이동 + router 설정 변경

**Files:**

- Move: `src/pages/` → `src/app/routes/`
- Move: `src/shared/config/route/routeTree.gen.ts` → `src/app/routeTree.gen.ts`
- Modify: `vite.config.ts` (`routesDirectory`, `generatedRouteTree`)
- Modify: routeTree를 import하는 곳(`src/app/main.tsx` 등)

- [ ] **Step 1: 디렉터리 이동**

```bash
git mv src/pages src/app/routes
git mv src/shared/config/route/routeTree.gen.ts src/app/routeTree.gen.ts
```

빈 `src/shared/config/route/` 정리.

- [ ] **Step 2: vite.config.ts router 플러그인 경로 변경**

```ts
tanstackRouter({
  routesDirectory: './src/app/routes',
  generatedRouteTree: './src/app/routeTree.gen.ts',
  routeFileIgnorePattern: '\\.test\\.tsx?$',
  autoCodeSplitting: mode !== 'test',
}),
```

- [ ] **Step 3: routeTree import 경로 갱신**

`main.tsx` 등에서 `@/shared/config/route/routeTree.gen` → `@/app/routeTree.gen`. (routeTree.gen.ts는 dev 서버가 재생성하므로, 한 번 `npm run dev`로 재생성 확인)

- [ ] **Step 4: 잔여 참조 확인**

Run: `grep -rn "src/pages\|shared/config/route\|@/pages" src vite.config.ts`
Expected: 매칭 없음.

- [ ] **Step 5: 검증 + 커밋**

```bash
npm run tsc && npm run build && git add -A && git commit -m "refactor: move routes into app layer (drop pages layer)"
```

---

## Phase 5: 테마 자동 + 푸터

### Task 5.1: prefers-color-scheme 자동 다크 모드

**Files:**

- Modify: `src/app/globals.css` (`.dark` 클래스 토글 → `@media (prefers-color-scheme: dark)`)

- [ ] **Step 1: globals.css 확인**

Run: `grep -n "dark\|prefers-color-scheme\|--bg\|--ink" src/app/globals.css | head -40`
다크 토큰이 `.dark`(또는 `[data-theme]`) 셀렉터에 정의됐는지 확인.

- [ ] **Step 2: 다크 토큰을 미디어 쿼리로 전환**

`.dark { --bg: ...; }` 형태를 `@media (prefers-color-scheme: dark) { :root { --bg: ...; } }`로 변경. 라이트 토큰은 `:root` 기본값 유지. JS 토글 의존 제거.

- [ ] **Step 3: 검증 + 커밋**

```bash
npm run build && git add -A && git commit -m "feat: system-based dark mode via prefers-color-scheme"
```

### Task 5.2: 푸터에 이메일 링크 추가

**Files:**

- Modify: `src/shared/components/layout/footer.tsx`

- [ ] **Step 1: 이메일 mailto 추가**

```tsx
export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-10 py-6 text-center text-ink3">
      <a
        href="mailto:kiss.yagni.dry@gmail.com"
        className="hover:text-ink underline-offset-2 hover:underline"
      >
        kiss.yagni.dry@gmail.com
      </a>
      <p className="mt-1">© {currentYear} Chanho Kim&apos;s dev Blog. All rights reserved.</p>
    </footer>
  );
}
```

- [ ] **Step 2: 검증 + 커밋**

```bash
npm run tsc && git add -A && git commit -m "feat: add contact email to footer"
```

---

## Phase 6: React Compiler 적용

### Task 6.1: @rolldown/plugin-babel + reactCompilerPreset 설정

**Files:**

- Modify: `package.json` (devDependencies 추가)
- Modify: `vite.config.ts`

- [ ] **Step 1: 의존성 설치**

```bash
npm i -D @rolldown/plugin-babel @babel/core @babel/plugin-transform-runtime @babel/runtime
```

(`babel-plugin-react-compiler`는 이미 설치됨)

- [ ] **Step 2: vite.config.ts 수정**

```ts
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
// plugins 배열에서 react() 다음에 추가:
react(),
babel({ presets: [reactCompilerPreset({ target: '19' })] }),
```

- [ ] **Step 3: 빌드/동작 검증**

Run: `npm run build`
Expected: 성공. 빌드 로그에 컴파일러 관련 치명적 오류 없음(규칙 위반 컴포넌트는 자동 스킵).
로컬 `npm run dev`로 홈/목록/상세/about, ko·ja, 라이트·다크 동작 확인.

- [ ] **Step 4: 커밋**

```bash
git add -A && git commit -m "build: enable React Compiler via @rolldown/plugin-babel"
```

---

## Phase 7: 의존성 제거 + 업그레이드

### Task 7.1: 제거 대상 의존성 정리

**Files:** `package.json`

- [ ] **Step 1: sanitize 사용처 확인(dompurify 계열)**

Run: `grep -rn "dompurify\|DOMPurify\|sanitize" src`
contact/turnstile 외 마크다운 sanitize 사용처가 있으면 dompurify는 **유지**. 없으면 제거 대상에 포함.

- [ ] **Step 2: netlify-cli 필요성 판단**

`dev:server`(netlify dev)를 계속 쓸지 결정. functions가 없으므로 불필요하면 제거 + `dev:server` 스크립트 삭제.

- [ ] **Step 3: 제거 실행**

```bash
npm rm @tanstack/react-query @tanstack/react-query-devtools resend @netlify/functions jsdom knip @testing-library/dom @testing-library/react @testing-library/user-event
# dompurify 계열·netlify-cli는 위 판단에 따라
```

또한 `src/shared/test-utils/render-with-router.tsx` 삭제(testing-library 의존), `vitest.setup.ts`의 testing-library 의존 정리.

- [ ] **Step 4: package.json scripts 정리**

`storybook`, `build-storybook` 스크립트 삭제. (필요 시 `dev:server`)

- [ ] **Step 5: vite.config.ts test/groups 정리**

`test.environment`를 `jsdom` → 제거 또는 `node`. codeSplitting groups에서 제거된 패키지(react-query, dompurify 등) 항목 정리.

- [ ] **Step 6: 검증 + 커밋**

```bash
npm run tsc && npm run lint && npm run build && git add -A && git commit -m "chore: remove unused dependencies and dead test infra"
```

### Task 7.2: buffer 제거 시도(조건부)

**Files:** `vite.config.ts`, `src/shared/types/global.d.ts`

- [ ] **Step 1: buffer alias/optimizeDeps/타입 제거**

`vite.config.ts`의 `resolve.alias.buffer`, `optimizeDeps.include: ['buffer']` 제거. `global.d.ts`의 Buffer polyfill 타입 제거.

- [ ] **Step 2: 빌드/런타임 검증**

Run: `npm run build`
포스트 상세(gray-matter 경로)까지 `npm run dev`로 동작 확인. **gray-matter가 Buffer를 요구해 실패하면 되돌린다**(`buffer` 유지).

- [ ] **Step 3: 커밋**

```bash
git add -A && git commit -m "chore: drop buffer polyfill (verified)"
```

(되돌린 경우: `chore: keep buffer polyfill (required by gray-matter)`)

### Task 7.3: 의존성 최신 stable 업그레이드 (major 포함)

**Files:** `package.json`

- [ ] **Step 1: minor/patch 일괄 업그레이드**

```bash
npm update
```

이후 `npm run tsc && npm run build`로 검증.

- [ ] **Step 2: major 개별 업그레이드 — 도구류 먼저**

`@types/node@26`, `lint-staged@17`:

```bash
npm i -D @types/node@latest lint-staged@latest
npm run tsc
```

- [ ] **Step 3: major — lucide-react 1.x**

```bash
npm i lucide-react@latest
```

Run: `grep -rn "from 'lucide-react'" src` 로 사용 아이콘 확인 후, 1.x에서 이름이 바뀐 아이콘이 있으면 교체. `npm run tsc && npm run build`.

- [ ] **Step 4: major — oxlint 1.x**

```bash
npm i -D oxlint@latest
npm run lint
```

1.0 룰 변경으로 에러가 나면 `.oxlintrc.json`을 조정하거나 코드 수정. (런타임 영향 없음)

- [ ] **Step 5: major — oxfmt 0.55**

```bash
npm i -D oxfmt@latest
npm run fmt
```

전체 재포맷 diff를 **별도 커밋**으로 분리.

- [ ] **Step 6: pre-release — @typescript/native-preview**

stable이 없으므로 최신 dev로 갱신하거나(`npm i -D @typescript/native-preview@latest`), 보조 타입체커가 불필요하면 제거. 사용처(`tsc` 스크립트가 tsgo를 쓰는지) 확인 후 결정.

- [ ] **Step 7: 최종 검증 + 커밋**

```bash
npm run tsc && npm run lint && npm run build
git add -A && git commit -m "chore: upgrade dependencies to latest stable"
# 재포맷은 분리:
# git commit -m "style: reformat with oxfmt 0.55"
```

---

## Phase 8: 최종 검증

### Task 8.1: 전체 검증 및 수동 QA

- [ ] **Step 1: 전체 명령 통과**

```bash
npm run tsc && npm run lint && npm run test:once && npm run build
```

Expected: 전부 통과(test는 0개 → passWithNoTests).

- [ ] **Step 2: 수동 동작 확인** (`npm run dev`)

- 홈: About 소개만 표시(최근 글 없음)
- Posts 목록: 태그·검색 UI 없음, 목록/페이징 정상
- 포스트 상세: 본문 렌더(코드 하이라이트·표·인용·Mermaid·이미지), TOC 동작
- About 페이지
- ko ↔ ja 전환(LocaleToggle)
- 라이트/다크: OS 설정에 따라 자동 전환
- 푸터 이메일 mailto 링크
- 404/500 에러 페이지
- 헤더 nav: About, Posts만(Contact 없음)

- [ ] **Step 3: 잔여물 최종 스캔**

Run: `grep -rn "contact\|react-query\|tag\|search\|theme-toggle\|features/about\|src/pages\|config/i18n" src`
Expected: 의도된 잔여(예: i18n 키)만 존재.

- [ ] **Step 4: 최종 커밋(필요 시)**

```bash
git add -A && git commit -m "chore: final cleanup for blog simplification"
```

### Task 8.2: PR 생성

- [ ] **Step 1: 기존 PR 확인** (규칙: 있으면 push만)

Run: `gh pr list --head feat/blog-simplification`

- [ ] **Step 2: develop으로 PR** (규칙: feature → develop)

기존 PR이 없으면 `feat/blog-simplification` → `develop` PR 생성. (사용자 승인 후)

---

## Self-Review 결과 (스펙 대비)

- contact 삭제(§4) → Task 1.1 ✓ / 태그(§2) → 1.2 ✓ / 검색(§2) → 1.3 ✓
- 부가기능 TOC만 유지(§2) → 1.4 ✓ / en 제거(§2) → 1.5 ✓
- 마크다운 통합(§4) → 2.1 ✓ / React Query 제거(§6) → Phase 3 ✓
- about→post(§4) → 4.1 ✓ / locale 묶기(§4) → 4.2 ✓ / pages→app/routes(§4) → 4.3 ✓
- 테마 자동(§2) → 5.1 ✓ / 푸터 이메일(§5) → 5.2 ✓
- React Compiler(§6-2) → Phase 6 ✓ / 의존성 제거(§6) → 7.1·7.2 ✓ / 업그레이드(§6-3) → 7.3 ✓
- 검증 기준(§7) → Phase 8 ✓

**주의(구현 중 확인):** dompurify·netlify-cli·buffer는 사용처 확인 후 제거 여부 확정. routeTree.gen.ts는 dev 서버가 재생성. major 업그레이드는 패키지별 검증.
