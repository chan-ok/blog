# Astro 기반 React·Vue·Svelte 블로그 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Obsidian·별도 콘텐츠 저장소를 유지하면서, 동일한 블로그 전체를 Astro 위의 React·Vue·Svelte로 제공하고 URL로 선택한다.

**Architecture:** Astro가 파일 라우팅·콘텐츠 수집·Markdown 변환·페이지 데이터·정적 HTML 문서를 담당한다. 세 프레임워크는 같은 데이터 계약과 CSS를 사용하면서 전체 화면과 상호작용을 각각 구현한다. 기존 prefix 없는 URL은 React로 유지하고 외부 배포 연동은 마지막 수동 단계로 남긴다.

**Tech Stack:** Node.js 24, pnpm 11.18.0, Astro 및 공식 React·Vue·Svelte 통합, React 19, Vue 3, Svelte 5, TypeScript, Tailwind CSS 4, Sätteri(`@astrojs/markdown-satteri`), Zod, YAML, Mermaid, DOMPurify, 서버 HTML allowlist 정화, Vitest, Playwright.

**Spec:** [승인된 설계](../specs/2026-10-20-astro-migration-design.md). 사용자가 2026-10-20 문서를 승인했다.

## Global Constraints

- Node.js 24와 pnpm 11.18.0을 유지한다. 기존 고립 checkout과 현재 feature 브랜치를 사용하고 요청 없는 Git worktree를 만들지 않는다.
- 홈·글 목록·글 상세·소개, 헤더·푸터·언어 선택과 상호작용 전체가 세 프레임워크의 구현 대상이다.
- `/react/ko/`, `/vue/ko/`, `/svelte/ko/` 및 각 `ja` 경로를 제공한다. 기존 prefix 없는 `/ko`, `/ja` 경로는 React 기본 화면으로 유지한다.
- Markdown 수집·공개 정책·날짜·번역·URL 생성·디자인 CSS는 공통으로 둔다. UI 컴포넌트·상태·수명 주기는 각 프레임워크로 구현한다.
- `BLOG_CONTENT_DIR`을 우선하고 기본값은 프로젝트 옆 `../blog-content`다. 서버 전용 설정이며 브라우저에 로컬 경로를 노출하지 않는다.
- `.md`·`.mdx`는 모두 비실행 Markdown으로 처리한다. Obsidian 작성 파일을 일괄 변경하거나 새 필수 frontmatter 필드를 요구하지 않는다.
- Markdown engine은 Astro 7 기본 Sätteri다. 기존 remark/rehype 플러그인의 직접 호환을 가정하지 않고 Sätteri mdast/hast 플러그인으로 이식한다. Sätteri 출력에도 최종 HTML 정화를 적용한다.
- 운영은 `published: true`이고 `test`, `draft` 태그가 없는 글만 생성한다. 개발 목록은 `published: true`, 개발 상세는 초안을 허용한다.
- 본문 2 MiB, frontmatter 64 KiB, YAML alias 최대 20과 mapping·중복 key 제한을 보존한다. 파일 기반 처리에서는 byte 길이도 확인한다.
- 문서·주석·커밋 메시지는 한국어를 사용한다. 사용자 대면 문구는 ko/ja 사전으로 관리한다.
- TLS·체크섬·패키지 검증과 `minimumReleaseAge: 1440` 정책을 우회하지 않는다. 기존 사용자의 파일·변경을 보존한다.
- `netlify.toml`, Build Hook, 콘텐츠 원격 checkout 자동화 및 `blog-content`의 기존 인덱스 생성 자동화는 이번 구현에서 변경하지 않는다. 설정값은 나중에 사용자가 수동 입력한다.
- 현재 운영 배포 준비 완료나 자동 배포 연결 완료를 주장하지 않는다. 세 프레임워크·개발·정적 빌드의 검증 결과와 외부 배포 검증을 구분한다.

## Review Focus

- YAML 날짜의 timezone·null·누락 차이로 서버 HTML과 hydration 결과가 달라지는 입력: ISO 데이터와 공통 표시값으로 일치해야 한다. Task 2·4·7에서 검증한다.
- 한글·공백·밑줄·동일 제목·중첩 폴더 및 percent encoding: 기존 URL은 유지하고 충돌·traversal은 진단해야 한다. Task 1·2·7에서 검증한다.
- 번역 글이 없는 상태의 locale/framework 전환: framework와 글 경로를 유지하고 없는 번역은 404여야 한다. Task 1·7에서 검증한다.
- 외부 디렉터리의 파일 삭제·같은 이미지 경로의 내용 교체: stale entry·초안 HTML·오래된 이미지가 남지 않아야 한다. Task 2·4·7에서 검증한다.
- Markdown에 섞인 스크립트·이벤트 속성·MDX 표현식 및 서버 경로: 세 HTML 삽입 지점과 hydration에서도 실행·유출되지 않아야 한다. Task 3·4·7에서 검증한다.

## 파일과 책임

| 영역 | 파일 | 책임 |
| --- | --- | --- |
| URL·공통 타입 | `src/lib/presentation/{types,routes}.ts` | framework·locale·페이지 구분, 링크·canonical 계약 |
| 작성 파일 | `src/lib/content/{types,vault,metadata,visibility}.ts` | 안전한 루트와 파일 탐색, 메타데이터·공개 정책 |
| Markdown | `src/lib/markdown/{processor,render,sanitize,obsidian}.ts` | Sätteri 공통 설정, 비실행 본문·목차·callout·이미지·코드 변환 |
| 이미지 | `src/lib/content/assets.ts`, `src/integrations/content-assets.ts` | 참조 이미지 검증·개발 제공·정적 출력 |
| 컬렉션 | `src/content.config.ts`, `src/lib/content/loader.ts` | Astro Content Layer와 외부 vault 변경 감시 |
| 화면 데이터 | `src/lib/presentation/{page-model,about}.ts` | 공통 직렬화 props, 정렬·표시·메타데이터 |
| Astro | `astro.config.mjs`, `src/layouts/DocumentLayout.astro`, `src/components/FrameworkPage.astro`, `src/pages/**` | route 생성·프레임워크 선택·HTML head |
| React | `src/frameworks/react/**` | 네 페이지와 전체 공통 UI·상태·이벤트 |
| Vue | `src/frameworks/vue/**` | 같은 UI 계약의 독립 Vue 구현 |
| Svelte | `src/frameworks/svelte/**` | 같은 UI 계약의 독립 Svelte 구현 |
| 공유 리소스 | `src/lib/i18n/**`, `src/lib/browser/**`, `src/styles/**` | 번역·안전한 Mermaid/Clipboard 로직·디자인 |
| 검증 | `src/lib/**/*.test.ts`, `tests/browser/**`, `tests/integration/**`, `scripts/verify-static-build.ts` | 순수 정책·UI·watcher·최종 산출물 검증 |

## Task 1: URL과 프레임워크 공통 계약

**Files:** Create `src/lib/presentation/types.ts`, `src/lib/presentation/routes.ts`, `src/lib/presentation/routes.test.ts`, `src/lib/i18n/messages.ts`; Move `src/shared/locale/locales/{ko,ja}.json` to `src/lib/i18n/locales/{ko,ja}.json` when all imports are migrated.

**Interfaces:**

```ts
type Framework = 'react' | 'vue' | 'svelte';
type Locale = 'ko' | 'ja';
interface RouteContext { framework: Framework; locale: Locale; explicitFramework: boolean }
type PageRef = { kind: 'home' | 'posts' | 'about' } | { kind: 'post'; slug: string[] };
function pageHref(context: RouteContext, page: PageRef): string;
function canonicalHref(locale: Locale, page: PageRef): string;
function getMessages(locale: Locale): Messages;
```

`Messages`는 기존 ko 사전을 기준으로 한 동일 key 구조다. 기존 사전은 소비자를 옮기기 전까지 남겨두며 framework 선택·코드 복사·이미지 오류 문구를 두 언어에 추가한다. `slug`는 decode된 안전한 세그먼트 배열이고 href 생성 시 한 번만 encode한다.

- [ ] **Step 1:** `routes.test.ts`에 실패 테스트를 작성한다.

```ts
expect(pageHref({ framework: 'vue', locale: 'ko', explicitFramework: true },
  { kind: 'posts' })).toBe('/vue/ko/posts/');
expect(pageHref({ framework: 'react', locale: 'ja', explicitFramework: false },
  { kind: 'about' })).toBe('/ja/about/');
expect(canonicalHref('ko', { kind: 'posts' })).toBe('https://chan-ok.com/ko/posts');
```

추가 assertion: framework 변경은 locale·post slug를 유지하고, locale 변경은 framework·post slug를 유지한다. `../`, 잘못된 percent encoding, 중복 decode 입력은 거부한다. 한글 URL은 한 번만 encode하고 동일한 canonical에서 trailing slash 규칙을 일관되게 사용한다.
- [ ] **Step 2:** `pnpm test:once src/lib/presentation/routes.test.ts`를 실행해 새 모듈 부재로 실패하는지 확인한다.
- [ ] **Step 3:** 타입과 순수 URL 생성 함수를 구현한다. `https://chan-ok.com`을 canonical 기준으로 사용하고 prefix 없는 React 경로도 지원한다. unknown framework·locale은 route 생성 대상에 넣지 않는다.
- [ ] **Step 4:** 위 테스트를 다시 실행해 모든 assertion 통과를 확인한다.
- [ ] **Step 5:** 관련 파일만 stage하고 `feat(routes): 프레임워크별 블로그 URL 계약 추가`로 커밋한다.

## Task 2: 별도 Obsidian 저장소 직접 수집

**Files:** Create `src/lib/content/{types,vault,metadata,visibility}.ts`, `src/lib/content/{vault,metadata,visibility}.test.ts`, `tests/fixtures/vault.ts`; Reuse/migrate `src/entities/markdown/util/parse-markdown.ts`, `src/shared/util/text-security.ts`, `src/features/post/util/post-visibility.ts` and their existing tests.

**Interfaces:**

```ts
interface PostMetadata {
  title: string; createdAt: string; updatedAt?: string | null;
  tags: string[]; published: boolean; thumbnail?: string; summary?: string; series?: string;
}
interface VaultPost {
  id: string; locale: Locale; slug: string[]; metadata: PostMetadata;
  body: string; sourcePath: string;
}
function resolveVaultDirectory(projectRoot: string, override?: string): Promise<string>;
function readVaultPosts(root: string): Promise<VaultPost[]>;
function isVisible(metadata: PostMetadata, production: boolean, surface: 'list' | 'detail'): boolean;
function createTestVault(): Promise<{ root: string; cleanup(): Promise<void> }>;
```

`sourcePath`는 서버 내부 전용이며 PageModel에는 넣지 않는다. `id`는 locale과 정규화한 상대 파일 경로로 안정되게 생성한다. 날짜는 Zod/YAML 처리 후 ISO 문자열로 만들고 `updatedAt: null`을 보존한다. 테스트 vault는 임시 디렉터리에 ko·ja, published/draft/test 글, 중첩 경로, 이미지, 숨김 파일을 만든다.

- [ ] **Step 1:** 실제 작성 파일을 건드리지 않는 임시 fixture로 테스트를 작성한다. `readVaultPosts()`는 `.md`·`.mdx`만 읽고 en·index.json·숨김 폴더를 무시해야 한다. 공백 파일명을 기존처럼 `_`로 바꾸고 폴더명은 보존한다. 동일 slug의 `.md`/`.mdx`, 공백/밑줄 충돌은 파일명을 포함해 실패해야 한다.
- [ ] **Step 2:** `pnpm test:once src/lib/content`를 실행해 신규 수집기의 부재로 실패함을 확인한다.
- [ ] **Step 3:** 수집·메타데이터·공개 정책을 구현한다. 파일과 symlink의 realpath가 vault를 벗어나면 거부하고, 권한 오류를 빈 목록으로 감추지 않는다. 기존 Markdown/YAML 제한과 테스트를 새 순수 모듈로 이관한다. 루트가 없는 경우 `BLOG_CONTENT_DIR` 설정 방법을 포함해 실패한다.
- [ ] **Step 4:** 다음 assertion을 포함해 재검증한다.

```ts
expect(isVisible(published, true, 'detail')).toBe(true);
expect(isVisible({ ...published, tags: ['test'] }, true, 'detail')).toBe(false);
expect(isVisible({ ...published, published: false }, false, 'detail')).toBe(true);
expect(isVisible({ ...published, published: false }, false, 'list')).toBe(false);
```

날짜·null·파일 삭제 후 재수집, UTF-8 byte 크기 제한, 중복 YAML key·alias·루트 탈출도 검증한다. 실제 `/workspace/blog-content` 수집 결과를 기존 ko/index.json의 경로와 비교해 호환성을 확인한다.
- [ ] **Step 5:** `feat(content): Obsidian 저장소의 Markdown 직접 수집`으로 커밋한다. `blog-content` 파일과 workflow는 변경하지 않는다.

## Task 3: 프레임워크 독립 Markdown과 안전한 HTML

**Files:** Create `src/lib/markdown/{processor,render,sanitize,obsidian}.ts`, `src/lib/markdown/{render,sanitize}.test.ts`, `src/lib/browser/mermaid.ts`, `src/lib/browser/mermaid.test.ts`; Port the behavior of `src/entities/markdown/util/{remark-obsidian-image,rehype-unwrap-images}.ts` to Sätteri plugins and migrate `src/entities/markdown/ui/mermaid-diagram.test.ts`; Modify `tests/browser/fixtures/mermaid-security-entry.ts` to import the new pure browser module.

**Interfaces:**

```ts
type SanitizedHtml = string & { readonly __sanitizedHtml: unique symbol };
interface Heading { id: string; text: string; level: number }
interface CompiledMarkdown { html: SanitizedHtml; headings: Heading[] }
interface MarkdownOptions {
  context: RouteContext;
  resolveImage(path: string): Promise<string | undefined>;
}
function renderMarkdown(body: string, options: MarkdownOptions): Promise<CompiledMarkdown>;
function sanitizeMarkdownHtml(html: string): SanitizedHtml;
function isSafeMermaidCss(css: string): boolean;
function hardenMermaidSvg(svg: string): string;
function sanitizeMermaidSvg(svg: string): string;
function mountMermaid(root: HTMLElement): Promise<() => void>;
```

`SanitizedHtml`은 정화 함수에서만 생성한다. `resolveImage`는 Task 4의 안전한 이미지 resolver를 받는다. 실행·정화 이전 원문은 framework props로 보내지 않는다.
`processor.ts`는 공식 `SatteriMarkdownProcessorOptions`를 만드는 `createProcessorOptions(): SatteriMarkdownProcessorOptions`를 제공한다. 렌더러와 이후 Astro 통합이 같은 GFM·heading·highlight 설정 및 Sätteri 플러그인 정의를 공유한다. framework별 링크와 `resolveImage`를 통한 자산 URL 변환은 `render.ts`가 처리하고, 모든 변환 뒤 정화한다. 특정 페이지의 locale·framework를 전역 processor 상태에 저장하지 않는다.

- [ ] **Step 1:** 테스트에서 GFM 표, 중복 제목의 고유 앵커와 목차, INFO/WARNING/DANGER/SUCCESS callout, Obsidian 이미지, 코드 하이라이트·복사 대상, Mermaid 코드 marker를 확인한다. 원문 `<script>`, 이벤트 속성, `javascript:` 링크와 MDX import/표현식은 실행 가능한 출력이 되면 안 된다.

```ts
expect(result.html).not.toMatch(/<script|onerror=|javascript:/i);
expect(result.headings.map((heading) => heading.id)).toEqual(['same', 'same-1']);
```

본문 내 기존 블로그 내부 링크는 선택한 framework를 유지하도록 변환하고 외부 링크·이미지 경로·fragment는 구별한다. 일반 문장·링크가 섞인 Obsidian 이미지 문단의 텍스트도 보존한다.
- [ ] **Step 2:** 새 테스트를 실행해 렌더러 부재로 실패하는지 확인한다.
- [ ] **Step 3:** 공식 Astro 7 패키지와 호환되는 `@astrojs/markdown-satteri` 및 플러그인 타입을 직접 사용하는 `satteri`를 의존성으로 선언한다. 공식 `createSatteriMarkdownProcessor()`로 문자열 렌더러를 만들고 `render()` 결과의 HTML·heading metadata를 공통 반환 타입으로 매핑한다. `.mdx` 내용도 Markdown 문자열로만 전달하며 MDX renderer·`mdxToJs`를 호출하지 않는다. Astro 기본 기능의 GFM·heading·Shiki 하이라이트를 사용하고 Obsidian·callout·이미지/링크 처리는 Sätteri mdast/hast visitor와 context API로 이식한다. 기존 unist visitor·remark/rehype 플러그인을 설정에 그대로 넣지 않는다. 서버 HTML 정화는 `sanitize-html`과 타입 선언을 직접 의존성으로 기록해 구현하며, raw HTML은 제외하고 코드 하이라이트에 필요한 좁은 속성만 허용한다. 코드·Mermaid 원문은 escape하고 모든 변환 뒤 최종 allowlist 정화를 실행한다. 플러그인 재사용을 이유로 별도의 unified Markdown 파이프라인으로 자동 fallback하지 않는다.
- [ ] **Step 4:** 기존 Mermaid strict 설정과 SVG/CSS/URL hardening을 `mermaid.ts`로 옮기고 기존 테스트를 새 모듈에 적용한다. 브라우저 구현은 필요한 경우에만 Mermaid를 import하고 cleanup 시 작업·listener를 정리한다. `pnpm test:once src/lib/markdown src/lib/browser` 및 기존 Mermaid 보안 브라우저 테스트를 실행한다. browser 실행 시 설치된 Chromium과 현재 인증서 제약을 보존한다.
- [ ] **Step 5:** `feat(markdown): 세 프레임워크가 공유하는 안전한 렌더링 추가`로 커밋한다.

## Task 4: Astro와 React의 전체 페이지를 연결하는 첫 수직 구현

**Files:** Create `astro.config.mjs`, `src/content.config.ts`, `src/lib/content/{loader,assets}.ts`, `src/integrations/content-assets.ts`, `src/lib/presentation/{page-model,about}.ts`, `src/layouts/DocumentLayout.astro`, `src/components/FrameworkPage.astro`; Create `src/pages/index.astro`, `src/pages/404.astro`, `src/pages/[locale]/{index,about}.astro`, `src/pages/[locale]/posts/{index,[...slug]}.astro` and equivalent `src/pages/[framework]/[locale]/**`; Create `src/frameworks/react/{BlogPage,Header,Footer,HomePage,PostsPage,PostPage,AboutPage,TableOfContents,MarkdownBody}.tsx`; Create `src/styles/global.css`, `vitest.config.ts`, `tests/integration/static-build.test.ts`, `scripts/verify-static-build.ts`; Modify package/lockfile/tsconfigs, `playwright.config.ts`, `src/shared/security-config.test.ts`.

**Interfaces:**

```ts
interface ContentAsset { publicPath: string; sourcePath: string; digest: string; mime: string }
interface AssetRegistry {
  resolve(path: string): Promise<string | undefined>;
  entries(): ContentAsset[];
}
function createAssetRegistry(vaultRoot: string): AssetRegistry;
interface PageModel {
  context: RouteContext; page: PageRef; messages: Messages; year: number;
  navigation: { label: string; href: string; active: boolean }[];
  frameworkLinks: { framework: Framework; href: string; active: boolean }[];
  localeLinks: { locale: Locale; href: string; active: boolean }[];
  meta: {
    title: string; description: string; canonical: string; image?: string;
    type: 'website' | 'article'; locale: Locale; publishedTime?: string; tags: string[];
  };
  posts: PostCardModel[]; article?: ArticleModel;
}
interface PostCardModel { title: string; href: string; dateLabel: string; thumbnail?: string; summary?: string }
interface ArticleModel { title?: string; dateLabel?: string; html: SanitizedHtml; headings: Heading[] }
function buildPageModel(context: RouteContext, page: PageRef, production: boolean): Promise<PageModel>;
class PageNotFoundError extends Error {}
// 각 framework의 최상위 화면은 같은 { model: PageModel } props를 받는다.
```

`buildPageModel`은 Astro 컬렉션에서 글을 읽으며 존재하지 않거나 비공개인 글 요청에는 `PageNotFoundError`를 던진다. Astro 개발 요청은 이를 404로 처리하고, 프로덕션에서는 공개 entry만 getStaticPaths에 넣는다. 다른 오류는 404로 숨기지 않는다. About은 기존 HTTPS README를 제한된 fetch로 읽고 같은 렌더러를 거친다. Footer·프로필·최근 글 수(홈 4, 목록 최대 10)를 유지한다. 날짜는 공통 계층에서 UTC 기준 `yyyy.MM`(목록)·`yyyy.MM.dd`(상세) 표시 문자열로 만들며 hydration 중 재계산하지 않는다. Footer의 연도도 서버에서 `year`로 전달한다.

- [ ] **Step 1:** 실제 vault와 임시 About fixture를 입력으로 프로덕션 HTML 검증을 작성한다. prefix 없는 React 경로와 `/react/{ko,ja}`의 네 화면에서 초기 HTML에 본문·번역·canonical이 있어야 하고 draft/test 상세 파일은 없어야 한다. missing image·vault 밖 symlink·`.mdx` 자산 요청은 거부되어야 한다. 같은 이미지 이름의 내용 교체는 digest URL을 바꿔야 한다.
- [ ] **Step 2:** 현재 Vite 앱으로 테스트를 실행해 정적 글 HTML·Astro route가 없어서 실패함을 확인한다.
- [ ] **Step 3:** Task 3에서 도입한 Astro에 공식 UI 통합을 설정한다. 2026-10-20 확인 기준 후보는 `astro@7.4.1`, `@astrojs/markdown-satteri@0.4.4`, `@astrojs/react@7.1.0`, `@astrojs/vue@7.1.1`, `@astrojs/svelte@9.1.0`, `vue@3.5.44`, `svelte@5.57.2`다. Svelte 통합과 checker는 TypeScript 7을 지원하지 않으므로 `typescript@6.0.3`과 호환되는 checker를 사용하고 `@typescript/native-preview` 기반 검사에 의존하지 않는다. 직접 사용하는 Vite도 Astro 통합의 `^8.3.4` 범위와 정렬한다. `markdown.processor`에는 공식 `satteri()`를 설정하고 Task 3의 공통 플러그인·옵션을 적용한다. 레지스트리 metadata·공식 문서를 다시 확인하고 실제 설치 버전을 lockfile에 기록한다. 서명·release-age·peer 오류를 무시하는 옵션은 사용하지 않는다.
- [ ] **Step 4:** `dev/build/preview`를 Astro로 전환하고, 독립 `vitest.config.ts`로 기존 순수 테스트를 실행하게 한다. `@astrojs/check`, `vue-tsc`, `svelte-check`, `tsx`를 실제 사용하는 개발 의존성으로 선언한다. 확인된 checker 후보는 각각 `0.9.11`, `3.3.13`, `4.7.7`이며 TypeScript 6 호환성을 재확인한다. `typecheck`는 `astro check && tsc --noEmit && vue-tsc --noEmit -p tsconfig.vue.json && svelte-check --tsconfig ./tsconfig.svelte.json`으로 구성한다. React JSX는 TSX 설정에, Vue와 Svelte는 전용 tsconfig에 포함하고 빈 구현 단계를 통과시키려고 검사를 비활성화하지 않는다. 기존 실행 파일 이름을 고정하던 테스트는 실제 새 검사와 보안 계약을 확인하도록 변경한다.
- [ ] **Step 5:** custom Content Layer loader와 이미지 integration을 구현한다. 공개 정책을 적용한 페이지가 참조하는 이미지만 MIME·경로 확인 후 digest URL로 제공·출력한다. vault 전체를 public에 복사하지 않는다. SVG를 지원할 경우 외부 로딩·스크립트를 제거하거나 안전한 raster 출력으로 바꾸고 악성 SVG 테스트를 둔다. 생성 자산은 별도 전용 출력 영역에서만 정리하며 사용자의 public 파일을 삭제하지 않는다. 개발 draft 자산을 프로덕션 출력에 재사용하지 않는다.
- [ ] **Step 6:** 모든 React 페이지·헤더·푸터·언어/framework 링크를 `PageModel`로 구현한다. 서버 HTML을 렌더링하고 `client:load`로 hydrate하며 `client:only`는 사용하지 않는다. 기존 Tailwind 토큰·레이아웃·번역·프로필 로딩 상태를 유지한다. 목차·복사 상태는 React hooks로 관리하고 Markdown HTML은 Task 3의 정화 결과만 삽입한다.
- [ ] **Step 7:** prefix 없는 경로와 React prefix 경로를 생성하고 `/`와 invalid route 처리를 구현한다. `DocumentLayout`에서 SEO head를 출력하고 `FrameworkPage`에서 구체적 framework 컴포넌트를 조건부 선택한다. Vue/Svelte 페이지는 해당 Task 완료 전 route 생성 대상에 넣지 않는다. 기존 Netlify 설정은 수정하지 않는다.
- [ ] **Step 8:** 타입 검사·React 단위/브라우저 테스트·`pnpm build`·`pnpm verify:build`를 실행한다. `verify:build`는 현재 run의 dist를 검사하는 `tsx scripts/verify-static-build.ts`이며 prefix 없는/React HTML, 비공개 산출물 부재, 안전한 자산·메타데이터를 검증한다. 클라이언트 props에 `sourcePath`, vault root, 비공개 본문이 없어야 한다.
- [ ] **Step 9:** `feat(astro): React 전체 블로그를 정적 페이지로 전환`으로 커밋한다.

## Task 5: Vue 전체 화면의 동등한 구현

**Files:** Create `src/frameworks/vue/{BlogPage,Header,Footer,HomePage,PostsPage,PostPage,AboutPage,TableOfContents,MarkdownBody}.vue`, `tests/browser/framework-pages.test.ts`; Modify `src/components/FrameworkPage.astro`, route generation, `tests/browser/home-responsive.test.ts`.

**Interfaces:** 모든 Vue 페이지는 Task 4의 `{ model: PageModel }`을 사용한다. Vue `defineProps`·Composition API·수명 주기로 상태와 cleanup을 구현한다. Task 1·3·4의 공통 함수 외에 React 컴포넌트를 import하지 않는다.

- [ ] **Step 1:** 동일한 `framework-pages.test.ts`를 React/Vue URL에 적용한다. 두 locale의 네 화면, 헤더·푸터·framework/locale 링크, 초기 본문, 코드 복사 상태, 접이식 목차, 프로필 이미지 로딩과 오류를 같은 assertion으로 확인한다. `home-responsive.test.ts`의 기존 320/375/768/1023/1440px 검사도 두 framework에 적용한다.
- [ ] **Step 2:** Vue URL에 대해 테스트를 실행해 route·화면 부재로 실패함을 확인한다.
- [ ] **Step 3:** 같은 CSS·props로 Vue UI를 구현한다. `v-html`은 `article.html`에만 사용하고, DOM이 준비된 뒤 목차·Mermaid를 초기화하며 해제 시 observer·listener를 정리한다. 프레임워크 전환은 동일한 글과 locale을 가리키는 실제 링크다.
- [ ] **Step 4:** Astro의 구체적 Vue 컴포넌트 분기와 Vue 정적 경로 생성을 추가한다. `vue-tsc`·전체 typecheck·두 framework의 브라우저 테스트·정적 빌드를 실행한다. Vue 페이지에 React UI나 React 클라이언트 entry가 요청되지 않음을 확인한다.
- [ ] **Step 5:** `feat(vue): 블로그 전체 화면의 Vue 구현 추가`로 커밋한다.

## Task 6: Svelte 전체 화면의 동등한 구현

**Files:** Create `src/frameworks/svelte/{BlogPage,Header,Footer,HomePage,PostsPage,PostPage,AboutPage,TableOfContents,MarkdownBody}.svelte`; Modify `src/components/FrameworkPage.astro`, route generation and `tests/browser/{framework-pages,home-responsive}.test.ts`.

**Interfaces:** 모든 Svelte 페이지는 Task 4의 `{ model: PageModel }`을 사용한다. Svelte 5의 props·반응성·수명 주기로 구현하고 React/Vue UI를 import하지 않는다. 외부 Mermaid/Clipboard 로직만 공통 모듈로 재사용한다.

- [ ] **Step 1:** Task 5의 공통 테스트 행렬에 Svelte를 추가한다. JavaScript 없는 초기 본문·탐색과 hydration 뒤 코드 복사·목차·Mermaid가 같은 계약을 만족해야 한다.
- [ ] **Step 2:** Svelte URL에 대해 테스트를 실행해 부재로 실패함을 확인한다.
- [ ] **Step 3:** 같은 CSS·props로 Svelte UI를 구현한다. `{@html}`은 정화된 `article.html`만 받는다. DOM 갱신 뒤 초기화와 cleanup을 연결하고 mount 시 루트 DOM을 교체해 hydration 오류를 만들지 않는다.
- [ ] **Step 4:** Astro의 구체적 Svelte 컴포넌트 분기와 정적 경로 생성을 추가한다. `svelte-check`·전체 typecheck·세 framework 테스트·빌드를 실행한다. Svelte 페이지가 React/Vue 런타임을 요청하지 않는지 확인한다.
- [ ] **Step 5:** `feat(svelte): 블로그 전체 화면의 Svelte 구현 추가`로 커밋한다.

## Task 7: 외부 vault 실시간 갱신과 전체 동등성 검증

**Files:** Modify `src/lib/content/loader.ts`, `src/integrations/content-assets.ts`; Create `tests/integration/vault-watch.test.ts`, `tests/browser/{framework-interactions,framework-security,framework-runtime}.test.ts`, `tests/browser/fixtures/blog-fixture.ts`; Extend `scripts/verify-static-build.ts` and Playwright configuration.

**Interfaces:** `createBlogLoader({ root: string }): Loader`는 Astro `LoaderContext`의 watcher·store API를 사용한다. 초기 load와 add/change/unlink는 같은 검증 함수를 통과하며, 삭제된 entry를 제거하고 중복 watch listener를 만들지 않는다. 이미지 integration은 동일한 vault root를 감시하고 변한 참조 이미지 URL을 갱신한다.

- [ ] **Step 1:** `vault-watch.test.ts`에서 임시 vault와 전용 포트의 Astro 서버를 시작한다. 초기 글 표시 후 파일 추가·제목 수정·삭제·draft 전환 및 같은 이미지 경로의 byte 교체를 수행하고, 제한 시간 내 요청 결과와 digest가 바뀌는지 assertion한다. 테스트가 시작한 프로세스만 정리하고 실제 `blog-content`를 수정하지 않는다.
- [ ] **Step 2:** watcher 테스트를 실행해 자동 갱신이 없는 상태에서 실제로 실패하는지 확인한다.
- [ ] **Step 3:** 외부 경로 watcher와 store 갱신을 구현한다. 삭제·이미지 변경·cache 무효화 처리를 포함하고 디렉터리 부재·파일 오류를 사용자에게 진단한다. change 직후 불완전한 저장 파일을 읽는 경우 짧은 안정화 후 재수집하되 오류를 무한 재시도하지 않는다.
- [ ] **Step 4:** 세 framework × 두 locale × 네 화면의 공통 브라우저 검증을 실행한다. 날짜·텍스트·주요 레이아웃을 같은 입력으로 비교하고 hydration 오류가 없음을 확인한다. 글이 없는 ja에서 글 경로를 유지해 전환하면 404여야 한다. 의도한 framework·locale 외의 탐색 축은 바뀌지 않아야 한다.
- [ ] **Step 5:** 보안 fixture를 세 framework에 렌더링해 `window` marker 실행·새 외부 요청이 없음을 확인한다. 기존 Mermaid 보안 테스트를 유지하고 실제 Mermaid 표시·코드 복사 성공/실패·목차 활성 상태·이미지 fallback을 검증한다. Clipboard API는 성공과 거부를 각각 제어해 UI 결과를 확인한다.
- [ ] **Step 6:** 프레임워크별 프로덕션 브라우저 요청을 dist manifest/생성 HTML에서 찾은 client entry와 대조해 선택하지 않은 두 런타임 entry가 로딩되지 않음을 검증한다. minify된 함수 이름이나 chunk basename 문자열에만 의존하지 않는다. JavaScript disabled context에서도 본문·내부 링크·언어/framework 링크가 동작해야 한다.
- [ ] **Step 7:** 개발 draft 미리보기를 실행한 뒤 새 프로덕션 빌드를 만들어, 오래된 draft HTML·props·자산이 남지 않는지 검사한다. `pnpm typecheck`, `pnpm lint:error`, `pnpm test:once`, `pnpm build`, `pnpm verify:build`, `pnpm exec playwright test --config playwright.config.ts`를 실행한다. runner별 실제 테스트 수와 실패/skip을 기록한다.
- [ ] **Step 8:** `test(blog): 세 프레임워크와 콘텐츠 갱신 동작 검증`으로 커밋한다.

## Task 8: 기존 SPA 정리와 개발 문서·환경 지침 갱신

**Files:** Remove migrated `src/app/**`, old React Markdown/UI/locale consumers and `vite.config.ts`, root `index.html`, obsolete TS project configs after reference checks; Modify `package.json`, `pnpm-lock.yaml`, `.gitignore`, `.oxlintrc.json`, lint-staged settings, README and `docs/{architecture,architecture-rules,development,commands,security,agents}.md`; Update reusable cloud `install_script`·`start_skill` if the configuration tools are available.

**Interfaces:** 개발 명령은 `pnpm dev --host 127.0.0.1 --port 4321`, 프로덕션 미리보기는 `pnpm build` 후 `pnpm preview --host 127.0.0.1 --port 4322`다. 외부 콘텐츠 경로는 `BLOG_CONTENT_DIR`이며 더 이상 `VITE_GIT_RAW_URL`을 필수로 요구하지 않는다. 프런트엔드에 별도 SPA router를 복원하지 않는다.

- [ ] **Step 1:** 파일·의존성 사용처와 기존 91개 테스트의 보존/이관/대체 대응을 확인한다. 렌더링 방식이 바뀐 테스트는 새 행동 검증을 확보한 뒤 옮기고, 실패를 없애기 위해 assertion을 삭제하지 않는다. 옛 소스 파일 존재를 전제하던 설정 테스트는 실제 새 실행·보안 계약으로 바꾼다.
- [ ] **Step 2:** 미사용 TanStack·React Compiler·react-markdown·i18next/Zustand 등의 직접 의존성·과거 진입점만 정리한다. React·Vue·Svelte와 Mermaid/정화·유틸 등 실제 사용 중인 패키지는 보존한다. Husky의 전체 의존성 audit와 보안 헤더 테스트를 제거하지 않는다.
- [ ] **Step 3:** `.astro`·`.vue`·`.svelte`를 포함한 실행 가능한 checker/린트·포맷 구성을 확인한다. oxlint/oxfmt가 지원하지 않는 SFC는 공식 지원 도구를 명시적으로 연결한다. TypeScript/Vue/Svelte 검사가 누락되거나 도구가 없는 script를 문서에 기재하지 않는다. 전체 자동 포맷으로 무관한 변경을 만들지 않는다.
- [ ] **Step 4:** 두 저장소를 나란히 둔 설치·실행, 사용자 지정 vault 경로, 프레임워크 URL 표, Obsidian 편집 미리보기, 초안 정책, 실제 검증 명령을 한국어로 문서화한다. 배포는 미연결이며 Netlify 기존 SPA fallback 조정과 수동 Build Hook 값 입력이 마지막에 필요함을 분리해 기록한다.
- [ ] **Step 5:** cloud 설정 도구가 있으면 현재 draft를 읽고 Astro에 맞는 완전한 설치·시작 지침을 저장한다. 저장 전에 그 명령을 현재 환경에서 실행한다. pnpm 11.18.0 활성화, lockfile 설치, `BLOG_CONTENT_DIR`, 프로세스 재시작·준비 확인과 기존 checkout 사용 원칙을 포함한다. 설치용 임시 sharp/svgo 우회나 Vite 전용 옵션을 새 환경의 필수 조건으로 남기지 않는다. 도메인·secret·배포 설정은 추가하지 않는다.
- [ ] **Step 6:** frozen-lockfile 재설치와 전용 포트의 dev/preview 시작을 확인하고 대표 페이지·이미지를 요청한다. 전체 타입·린트·단위·빌드·정적 산출물·브라우저 검증을 새 명령으로 실행하고 `git diff --check`와 두 저장소의 작업 트리를 확인한다. About의 외부 요청은 실제로 검증하고 fixture 성공과 구별한다. CA trust나 외부 네트워크가 차단되면 TLS를 끄지 말고 해당 결과만 미검증으로 보고한다.
- [ ] **Step 7:** `refactor(blog): 기존 SPA 정리와 Astro 개발 지침 갱신`으로 커밋한다. 완료 보고에 세 framework별 검증, 환경 설정 저장 여부, 배포·수동 설정의 미완료 범위를 명시한다. push·게시·외부 서비스 설정 변경은 이 단계에 포함하지 않는다.

## 구현 참고와 최종 검토

- 공식 문서: [Astro UI frameworks](https://docs.astro.build/en/guides/framework-components/), [Astro Markdown processors](https://docs.astro.build/en/guides/markdown-content/#markdown-processors), [Sätteri processor API](https://docs.astro.build/en/reference/markdown-processors/satteri/), [Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/), [Astro routing](https://docs.astro.build/en/guides/routing/), [Svelte TypeScript](https://svelte.dev/docs/svelte/typescript), [Vue TypeScript](https://vuejs.org/guide/typescript/overview.html).
- Task 1·2·3이 공통 계약을 고정하고 Task 4가 실제 정적 사이트를 만든다. Task 5·6은 동일 계약을 소비하며 Task 7이 전체 결과를 검증하므로 순서대로 실행한다.
- 공통 코드의 잘못을 세 UI에 복제하지 않도록 순수 테스트와 실제 페이지 검증을 함께 사용한다. 문서 검토·구현 방법 선택 전에는 제품 의존성 설치나 제품 코드를 변경하지 않는다.
- 계획 자체의 self-review: URL/SEO, Obsidian/이미지, 공개 정책, 세 framework UI, 상태/cleanup, HMR, 보안, 타입 검사, 기존 자동화 보존, 배포 유예 및 재사용 환경 지침을 각 Task에 배정했다.
