# 블로그 최소화 재구성 설계

- 작성일: 2026-06-19
- 상태: 리뷰 대기
- 목표: 개인 블로그를 구조적·컴포넌트적으로 가장 간소화한 형태로 되돌린다.

## 1. 배경 / 목표

현재 블로그는 다국어(ko/en/ja), 태그, 검색, contact 폼, 다수의 부가 기능과
5단계 FSD(app/pages/entities/features/shared)로 기능이 넓게 퍼져 있다.
이를 **읽기 중심의 최소 블로그**로 단순화한다.

원칙: KISS / YAGNI. 동작을 유지하면서 불필요한 기능·컴포넌트·레이어를 제거·통합한다.
디자인 언어는 기존 `DESIGN.md`(무채색 에디토리얼)를 그대로 따른다.

## 2. 확정된 결정 사항 (범위)

| 항목          | 결정                                                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 메뉴          | Home, About, Posts 3개만. **Contact 삭제**                                                                                       |
| 태그 / 검색   | **삭제** (UI·필터·관련 유틸 전부)                                                                                                |
| 다국어        | **ko / ja 유지, en 제거**. `$locale` 라우팅·언어 토글 유지                                                                       |
| 포스트 데이터 | 외부 Git raw URL fetch **유지**(axios). **React Query 제거** → TanStack Router loader + Suspense/use()로 페칭 통일               |
| 마크다운      | 기능 전부 유지(Mermaid·코드 하이라이트·표·인용·Obsidian 이미지 등). **컴포넌트 파일만 통합**. 현 unified/@mdx-js 파이프라인 유지 |
| 부가 기능     | **TOC(목차)만 유지**                                                                                                             |
| 다크모드      | 토글 제거. `prefers-color-scheme`로 **시스템 자동 전환**(dark 토큰 유지)                                                         |
| 홈 최근 글    | **제거** → 홈은 About 소개만                                                                                                     |
| FSD           | **4단계: app / entities / features / shared** (pages 레이어 제거)                                                                |
| 푸터          | 저작권 + 이메일 `kiss.yagni.dry@gmail.com`(mailto)                                                                               |
| 의존성        | 제거 정리 후 남은 패키지를 **최신 stable로 업그레이드**(major 포함, §6-3)                                                        |

## 3. 최종 디렉토리 구조 (목표)

```
src/
  app/
    main.tsx
    globals.css                 # prefers-color-scheme 기반 자동 다크
    routes/                     # ← 기존 src/pages 이동 (app이 라우팅 담당)
      __root.tsx
      $locale.tsx               # Header/Footer 레이아웃
      $locale/
        index.tsx               # 홈 = About 소개만
        about.tsx               # post의 about-block 사용
        posts/
          index.tsx             # 목록 (태그·검색 없음)
          $.tsx                 # 상세 (+ TOC)
    routeTree.gen.ts            # router plugin generated

  entities/
    markdown/
      index.tsx                 # MDComponent (렌더러)
      model/markdown.schema.ts
      util/
        get-markdown.ts
        get-frontmatter.ts
        set-md-components.tsx   # 단순 컴포넌트 인라인 통합 대상
        remark-obsidian-image.ts
        rehype-unwrap-images.ts
      ui/                       # 복잡 로직 컴포넌트만 파일 유지
        code-block.tsx
        mermaid-diagram.tsx
        image-block.tsx

  features/
    post/
      model/post.schema.ts
      ui/
        about-block.tsx         # ← features/about에서 이동
        post-card-list.tsx      # ← post-card 통합
        table-of-contents.tsx
      util/
        get-posts.ts            # locale + published + 페이징만

  shared/
    locale/                     # ← 흩어진 locale 관련을 기능 단위로 묶음
      provider.tsx              # (구) providers/locale-provider
      store.ts                  # (구) stores/locale-store
      toggle.tsx                # (구) components/toggle/locale-toggle
      config.ts                 # (구) config/i18n/index
      schema.ts
      types.ts
      locales/
        ko.json
        ja.json
    components/
      layout/header.tsx
      layout/footer.tsx
      error-page/
      ui/button/
      ui/link/
      ui/optimized-image/
    config/
      api/
    types/
      common.schema.ts
      global.d.ts
      mdx.d.ts
    util/
      build-meta.ts
      sanitize.ts
```

## 4. 레이어별 변경

### app

- `src/pages` → `src/app/routes`로 이동. vite router plugin의 `routesDirectory`(및 `generatedRouteTree` 경로)만 조정.
- `contact` 라우트 삭제.
- `__root.tsx`: `QueryClientProvider`/`QueryClient` 및 React Query devtools 제거. 데이터 페칭은 router loader로 통일.
- 홈(`$locale/index.tsx`): `RecentPostBlock` 제거 → About 소개만.
- `$locale.tsx`: Header/Footer 레이아웃 유지. immersive/scroll 관련 의존 제거.

### entities/markdown (기능 유지, 통합)

- 단순 컴포넌트(`blockquote`, inline `code`, `table-wrapper`, `typography`)는 `set-md-components.tsx`로 **인라인 통합**.
- 복잡 로직(`code-block` 하이라이트, `mermaid-diagram`, `image-block`)은 파일 유지.
- 파이프라인(remark/rehype 플러그인, MDX evaluate) 변경 없음.
- `index.tsx`(MDComponent): `useQuery` 제거 → 라우트 loader에서 `getMarkdown` 수행, 컴포넌트는 `use()`/Suspense로 결과를 받는다(인터페이스가 path 기반 자체 fetch → 데이터/promise 주입으로 변경).

### features/post

- **제거**: `post-search-input`, `tag-chip`, `tag-filter-bar`, `post-navigation`, `recent-post-block`, `util/get-available-tags`, `util/get-series-posts`, `util/calc-reading-time`(읽기 시간 표시도 함께 제거).
- `post-card` → `post-card-list`로 통합. `table-of-contents` 유지.
- `get-posts.ts`: `tags`/`query`/`DEV_ONLY_TAGS` 필터 제거 → `locale` + `published` + 페이징만. draft/비공개 제어는 `published` 필드로 일원화.
- `post.schema.ts`: `GetPostsProps`의 `tags`/`query` 제거.
- **about 통합**: `features/about/ui/about-block.tsx` → `features/post/ui/about-block.tsx`로 이동, `features/about` 폴더 제거.

### shared

- **locale 기능 단위 통합**: `providers/locale-provider`, `stores/locale-store`, `components/toggle/locale-toggle`, `config/i18n/*`를 `shared/locale/`로 모음.
- **제거**: `components/toggle/theme-toggle`, `components/scroll-progress-bar`, `components/turnstile`, `hooks/use-scroll-progress`, `hooks/use-immersive-reader`, `stores/theme-store`, `providers/theme-provider`, `config/i18n/locales/en.json`.
- 빈 폴더(`hooks/`, `providers/`, `stores/`)는 정리.
- `globals.css`: 다크 토큰은 유지하되 `.dark` 클래스 토글 대신 `@media (prefers-color-scheme: dark)`로 적용.

### contact 전면 삭제

- `features/contact/` 전체, `routes/$locale/contact.tsx`, `components/turnstile/`.
- **Netlify function 삭제**: `netlify/functions/mail.mts`(유일 function) + `netlify/functions/tsconfig.node.json`. `netlify.toml`의 functions 관련 설정 정리.
- 관련 의존성은 §6 참조(`resend`·`@netlify/functions` 제거 확정, `dompurify` 계열·`netlify-cli`는 조건부).

## 5. 메뉴 / 푸터

- Header `nav`: **About, Posts** (+ 로고 = Home). Contact 링크 제거. `ThemeToggle` import·immersive 로직 제거.
- Footer: 기존 저작권 줄 + `kiss.yagni.dry@gmail.com` mailto 링크 1줄 추가.

## 6. 의존성 / 도구 정리

### 제거 (확정)

| 대상                                                                              | 근거                                                            |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `@tanstack/react-query` (+ `@tanstack/react-query-devtools`)                      | router loader + Suspense/use()로 대체                           |
| `resend`                                                                          | contact 메일 발송 전용                                          |
| `@netlify/functions`                                                              | `netlify/functions/mail.mts`(contact 메일) 전용 → function 삭제 |
| `@testing-library/dom` · `@testing-library/react` · `@testing-library/user-event` | 테스트 파일 0개, 미사용(죽은 인프라)                            |
| `jsdom`                                                                           | 컴포넌트 테스트 환경 미사용                                     |
| `knip`                                                                            | 미사용 도구                                                     |
| storybook 스크립트 (`storybook`, `build-storybook`)                               | storybook 패키지 부재, 스크립트만 잔존                          |

### 조건부

| 대상                                                          | 판단                                                                                                      |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `buffer` (vite `alias`·`optimizeDeps`·`global.d.ts` polyfill) | 제거 시도 → `gray-matter` 등이 Buffer를 요구하면 빌드/런타임 검증 후 유지                                 |
| `dompurify` / `isomorphic-dompurify`                          | `shared/util/sanitize.ts` 등 마크다운 sanitize 사용처 확인 → contact/turnstile 전용이면 제거, 아니면 유지 |
| `netlify-cli`                                                 | functions 삭제 후 `dev:server`(netlify dev)가 불필요하면 제거                                             |

### 유지

`mermaid`, `highlight.js`, `rehype-*`, `remark-*`, `@mdx-js/mdx`, `i18next`/`react-i18next`(ko/ja), `axios`, `@tanstack/react-router`, `vitest`(유닛 골격, environment node), **`babel-plugin-react-compiler`(유지 → React Compiler 적용, §6-2)**.

### 신규 설치

- `@rolldown/plugin-babel`(+ 그 peer인 `@babel/core`·`@babel/plugin-transform-runtime`·`@babel/runtime`) — React Compiler를 빌드에 통합하기 위한 babel 플러그인(§6-2).

> 제거는 구현 단계에서 실제 import 사용처를 grep으로 확인한 뒤 진행한다.

## 6-1. 빌드 / 설정(vite.config.ts) 변경

- `tanstackRouter.routesDirectory`: `./src/pages` → `./src/app/routes`.
- `generatedRouteTree`: `./src/shared/config/route/routeTree.gen.ts` → `./src/app/routeTree.gen.ts`.
- `define`의 `VITE_TURNSTILE_SITE_KEY` 제거(turnstile 삭제).
- `resolve.alias.buffer` · `optimizeDeps.include: ['buffer']`: buffer 제거 시 함께 정리.
- `build` codeSplitting groups: 제거된 패키지(react-query, dompurify 등) 그룹 정리.
- `test`: `environment: 'jsdom'` → node로 정리, `vitest.setup.ts`의 testing-library 의존 제거, 테스트 0개라 `passWithNoTests` 유지.
- 테스트용 분기(`autoCodeSplitting: mode !== 'test'`, `routeFileIgnorePattern`)는 vitest 골격 유지 시 그대로 둔다.
- `package.json` scripts: `storybook`·`build-storybook` 삭제.

## 6-2. React Compiler 적용

React Compiler는 **빌드 타임 컴파일러**다. "1.0 정식 출시"는 컴파일러의 안정화를 의미하며, React 라이브러리에는 컴파일 결과가 사용하는 런타임(`react/compiler-runtime`)만 포함된다. 자동 메모이제이션을 삽입하는 **컴파일 작업 자체는 빌드 시점에 별도 플러그인**이 수행해야 한다. 공식 문서(`react.dev/learn/react-compiler/installation`)도 Vite 환경의 모든 도입 방법에서 `babel-plugin-react-compiler`를 사용한다.

현 스택(`@vitejs/plugin-react` v6.0.1 + rolldown-vite)의 공식 권장 방식:

```ts
// vite.config.ts
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

plugins: [
  tailwindcss(),
  tanstackRouter({
    /* ... */
  }),
  react(),
  babel({ presets: [reactCompilerPreset({ target: '19' })] }),
  ViteImageOptimizer({
    /* ... */
  }),
];
```

- peer deps: `@rolldown/plugin-babel`(신규, 0.2.x) + 그 peer인 `@babel/core`·`@babel/plugin-transform-runtime`·`@babel/runtime`, `babel-plugin-react-compiler`(유지, 1.0.0).
- **Vite 8 정합 확인**: `@vitejs/plugin-react` v6.0.1이 peer로 `vite ^8.0.0` + `@rolldown/plugin-babel`(`^0.1.7 || ^0.2.0`) + `babel-plugin-react-compiler`(`^1.0.0`)를 명시 → 현 스택(Vite 8.0.10 + plugin-react v6 + rolldown)과 정확히 일치. plugin-react v6.0.0부터 Vite 7 이하 미지원.
- `target: '19'`(React 19) → `react/compiler-runtime` 사용. preset이 client 환경에만 적용되고 `optimizeDeps`도 자동 구성.
- 적용 후 빌드·동작 검증. 자동 메모이제이션이 되므로 불필요한 수동 `useMemo`/`useCallback`은 점진 정리 가능(별도, 강제 아님).

## 6-3. 의존성 업그레이드 (최신 stable, major 포함)

제거 예정 패키지를 먼저 정리한 뒤, **남은 의존성을 최신 stable로 업그레이드**한다. 각 major는 breaking을 확인하며 적용하고 `tsc`/`lint`/`build`/동작으로 검증한다.

### major (개별 검토)

| 패키지         | 현재 → 최신  | 주의                                                                  |
| -------------- | ------------ | --------------------------------------------------------------------- |
| `oxlint`       | 0.16 → 1.70  | 1.0 정식. 룰·설정 대폭 변경 → `.oxlintrc.json` 재검토, lint 에러 정리 |
| `oxfmt`        | 0.17 → 0.55  | 포매팅 규칙 변경 → 전체 재포맷 diff 확인                              |
| `lucide-react` | 0.561 → 1.21 | 1.0 정식. 사용 아이콘 export/이름 확인                                |
| `@types/node`  | 25 → 26      | Node 엔진 버전과 정합 확인                                            |
| `lint-staged`  | 16 → 17      | config 형식 호환 확인                                                 |
| `netlify-cli`  | 24 → 26      | §6에서 유지로 결정된 경우에만 업그레이드                              |

### minor/patch (일괄)

vite 8.0.16, react/react-dom 19.2.7, @types/react 19.2.17, @vitejs/plugin-react 6.0.2, @tanstack/react-router 1.170(+ router-vite-plugin·devtools), tailwindcss·@tailwindcss/vite 4.3.1, zod 4.4.3, zustand 5.0.14, date-fns 4.4, axios 1.18, i18next 26.3.1, react-i18next 17.0.8, @base-ui/react 1.6, dompurify·isomorphic-dompurify(유지 시), playwright 1.61, tsx 4.22.4, vitest 4.1.9 등.

### pre-release

- `@typescript/native-preview`: stable 릴리스가 없고 dev 빌드만 존재. 최신 dev로 갱신하되 "안정 버전"은 아님을 인지. 보조 타입체커이므로 불필요하면 제거도 검토.

> 순서: 기능 제거·통합 → 의존성 제거(§6) → 남은 의존성 업그레이드 → 검증. 업그레이드는 제거가 끝난 뒤 수행해 노이즈를 줄인다.

## 7. 검증 기준 (완료 정의)

- `npm run tsc` 타입 통과
- `npm run lint` 통과
- `npm run test:once` 통과(삭제된 기능의 테스트는 함께 제거/수정)
- `npm run build` 성공
- 로컬 확인: 홈(About만) / Posts 목록(태그·검색 없음) / 포스트 상세(+TOC) / About / ko·ja 전환 / 라이트·다크(OS 설정) / 푸터 이메일 링크 / 404·500 페이지

## 8. 비범위 (Out of Scope)

- 포스트 데이터 소스 변경(빌드타임/정적 생성 전환) — 현 런타임 fetch 유지.
- 마크다운 렌더링 엔진 교체.
- 신규 기능 추가(검색·태그·댓글 등) — 이번엔 제거/단순화만.
- 디자인 시스템 변경 — `DESIGN.md` 그대로.

## 9. 리스크 / 주의

- `src/pages` → `src/app/routes` 이동 시 router plugin 설정·생성 경로·`@/` alias import 전수 갱신 필요.
- locale 통합 시 import 경로 광범위 변경 → 한 번에 옮기고 타입체크로 누락 확인.
- en 제거 시 `LocaleSchema`(이미 ko/ja)와 i18n 리소스·라우팅 기본값 일관성 확인.
- 의존성 제거 전 사용처 확인 필수(특히 sanitize 계열).
- React Query 제거로 클라이언트 캐싱·자동 retry가 사라짐 → 재요청 비용은 router loader 캐싱 옵션(staleTime 등)으로 보완 검토.
- React Compiler는 빌드 타임 컴파일러로 babel 통합이 필요하며, babel 경유 변환으로 빌드 시간이 다소 늘 수 있다. 규칙 위반 컴포넌트는 자동 스킵 → 적용 후 빌드 로그·동작 확인.
- 의존성 major 일괄 업그레이드(전부 최신)는 breaking 위험 → 제거 정리 후 별도 단계로 패키지별 검증. `oxlint`/`oxfmt`는 대량 lint 변경·재포맷을 유발할 수 있어 재포맷은 별도 커밋 권장.
