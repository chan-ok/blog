> ✅ **완료** — 2026-04-11

# Book Aesthetic — 디자인 전면 개편 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 블로그 전체를 Noto Serif 세리프 폰트 + 흑백 팔레트 + 마스트헤드 헤더 + 목차형 포스트 목록 + 에디토리얼 홈 화면으로 개편한다.

**Architecture:** CSS custom properties로 색상 토큰을 정의하고 Tailwind v4 `@theme inline`으로 유틸리티 클래스에 연결한다. 각 컴포넌트는 새 토큰(`bg-bg`, `text-ink` 등)을 사용하도록 교체한다.

**Tech Stack:** React 19, Tailwind CSS v4, Google Fonts (Noto Serif KR/JP/Noto Serif)

---

## 파일 맵

| 동작 | 파일                                           | 내용                                      |
| ---- | ---------------------------------------------- | ----------------------------------------- |
| 수정 | `index.html`                                   | Google Fonts URL → Noto Serif 계열로 교체 |
| 수정 | `src/0-app/globals.css`                        | CSS 토큰 + Tailwind @theme 등록 + 폰트 룰 |
| 수정 | `src/4-pages/$locale.tsx`                      | base layout bg/text → 토큰 클래스         |
| 수정 | `src/3-widgets/header.tsx`                     | 마스트헤드로 전면 교체                    |
| 수정 | `src/2-features/about/ui/about-block.tsx`      | 에디토리얼 인트로로 교체                  |
| 수정 | `src/2-features/post/ui/recent-post-block.tsx` | TOC 스타일 최근 글                        |
| 수정 | `src/4-pages/$locale/index.tsx`                | 홈 레이아웃                               |
| 수정 | `src/2-features/post/ui/post-card.tsx`         | 단일 TOC 행 컴포넌트로 교체               |
| 수정 | `src/2-features/post/ui/post-card-list.tsx`    | TOC 헤더 + 목록                           |
| 수정 | `src/1-entities/markdown/ui/typography.tsx`    | 헤딩 스타일                               |
| 수정 | `src/1-entities/markdown/ui/blockquote.tsx`    | 모노크롬 스타일                           |
| 수정 | `src/2-features/post/ui/tag-chip.tsx`          | 사각형 모노크롬                           |

---

## Task 1: CSS 토큰 + 폰트 설정

**Files:**

- Modify: `index.html`
- Modify: `src/0-app/globals.css`

- [ ] **Step 1: index.html — Google Fonts URL 교체**

`index.html`의 Google Fonts `<link>` 와 인라인 `<style>` 전체를 교체한다:

```html
<!-- 기존 라인 10-37 대체 -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&family=Noto+Serif+JP:wght@400;600;700&family=Noto+Serif:ital,wght@0,400;0,600;1,400&display=swap"
  rel="stylesheet"
/>
```

인라인 `<style>` 블록(폰트 패밀리 지정)은 **삭제**한다. globals.css에서 처리한다.

- [ ] **Step 2: globals.css — CSS 토큰 + Tailwind @theme + 폰트**

`src/0-app/globals.css`를 다음으로 교체한다:

```css
@import 'tailwindcss';
@import 'highlight.js/styles/github-dark.css';

/* 다크모드 variant */
@custom-variant dark (&:where(.dark, .dark *));

/* ── 색상 토큰 (라이트) ── */
:root {
  --bg: #f7f8fa;
  --bg2: #f0f1f4;
  --ink: #0f1117;
  --ink2: #3a3d47;
  --ink3: #8a8e9a;
  --rule: #e2e4ea;
}

/* ── 색상 토큰 (다크) ── */
.dark {
  --bg: #12141a;
  --bg2: #1c1f28;
  --ink: #e8eaf0;
  --ink2: #a8acba;
  --ink3: #6a6e7e;
  --rule: #2a2e3a;
}

/* ── Tailwind v4 토큰 등록 ── */
@theme inline {
  --color-bg: var(--bg);
  --color-bg2: var(--bg2);
  --color-ink: var(--ink);
  --color-ink2: var(--ink2);
  --color-ink3: var(--ink3);
  --color-rule: var(--rule);
}

/* ── 기본 폰트 (KR/JP/EN 세리프 통일) ── */
html,
body {
  font-family: 'Noto Serif KR', 'Noto Serif JP', 'Noto Serif', serif;
  background-color: var(--bg);
  color: var(--ink);
}

html {
  scrollbar-gutter: stable;
}

/* ── 마크다운 헤딩 앵커 아이콘 숨김 ── */
.anchor-icon {
  display: none;
}

/* ── TOC 클릭 스크롤 오프셋 ── */
.mdx-content h1[id],
.mdx-content h2[id],
.mdx-content h3[id],
.mdx-content h4[id],
.mdx-content h5[id],
.mdx-content h6[id] {
  scroll-margin-top: 5rem;
}
```

- [ ] **Step 3: 개발 서버 실행 후 폰트 적용 확인**

```bash
pnpm dev
```

브라우저에서 `http://localhost:5173/ko` 접속. 폰트가 세리프로 변경됐는지 확인.
배경색이 `#f7f8fa`(밝은 회색빛)로 바뀌었는지 확인.

- [ ] **Step 4: 커밋**

```bash
git add index.html src/0-app/globals.css
git commit -m "style: Noto Serif 폰트 + 흑백 CSS 토큰 적용"
```

---

## Task 2: 기본 레이아웃 배경색 교체

**Files:**

- Modify: `src/4-pages/$locale.tsx`

- [ ] **Step 1: LocaleLayout 배경 클래스 교체**

`src/4-pages/$locale.tsx`의 `LocaleLayout` 함수에서 div 클래스를 수정한다:

```tsx
// 기존
<div className="flex flex-col min-h-screen bg-white text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">

// 변경
<div className="flex flex-col min-h-screen bg-bg text-ink transition-colors duration-200">
```

- [ ] **Step 2: 타입 체크**

```bash
pnpm tsc --noEmit
```

에러 없어야 한다.

- [ ] **Step 3: 커밋**

```bash
git add src/4-pages/\$locale.tsx
git commit -m "style: 레이아웃 배경색 CSS 토큰으로 교체"
```

---

## Task 3: 헤더 → 마스트헤드

**Files:**

- Modify: `src/3-widgets/header.tsx`

현재 헤더는 좌측 로고 + 우측 nav floating 방식이다.
새 헤더는 중앙 마스트헤드 + 하단 nav 바 방식으로 완전히 교체한다.
메뉴: About / Posts / Series / Contact + ThemeToggle + LocaleToggle.

- [ ] **Step 1: header.tsx 전체 교체**

```tsx
import { useRouterState } from '@tanstack/react-router';

import Link from '@/5-shared/components/ui/link';
import LocaleToggle from '@/5-shared/components/toggle/locale-toggle';
import ThemeToggle from '@/5-shared/components/toggle/theme-toggle';

export default function Header() {
  const { location } = useRouterState();
  const pathname = location.pathname;

  const isActive = (path: string) => pathname.includes(path);

  const navLinkClass = (path: string) =>
    [
      'text-[11px] tracking-[1.5px] uppercase px-5 py-2.5',
      'border-r border-rule transition-colors duration-150',
      'hover:bg-ink hover:text-bg',
      isActive(path) ? 'bg-ink text-bg' : 'text-ink2',
    ].join(' ');

  return (
    <header className="border-b-2 border-ink bg-bg">
      {/* 마스트헤드 영역 */}
      <div className="flex flex-col items-center pt-6 pb-0 px-10">
        <Link
          href="/"
          aria-label="Home"
          className="text-[28px] sm:text-[32px] font-bold tracking-[8px] uppercase text-ink no-underline"
        >
          Chanho.dev
        </Link>
        <p className="text-[10px] tracking-[2.5px] text-ink3 mt-1 mb-3">개발 · 사유 · 기록</p>
      </div>

      {/* nav 바 */}
      <nav className="flex items-center border-t border-rule" aria-label="주요 네비게이션">
        {/* 좌측 경계선 */}
        <span className="border-l border-rule self-stretch" />

        <Link href="/about" aria-label="About" className={navLinkClass('/about')}>
          About
        </Link>
        <Link href="/posts" aria-label="Posts" className={navLinkClass('/posts')}>
          Posts
        </Link>
        <Link href="/series" aria-label="Series" className={navLinkClass('/series')}>
          Series
        </Link>
        <Link href="/contact" aria-label="Contact" className={navLinkClass('/contact')}>
          Contact
        </Link>

        {/* 토글 영역 */}
        <span className="ml-auto flex items-center border-l border-rule px-2">
          <ThemeToggle />
          <LocaleToggle />
        </span>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: ThemeToggle 스타일 업데이트**

`src/5-shared/components/toggle/theme-toggle/index.tsx`의 `buttonClassName`을 새 팔레트에 맞게 수정한다:

```tsx
const buttonClassName = clsx(
  'flex items-center h-9 px-3 gap-1',
  'text-[11px] text-ink3 cursor-pointer',
  'hover:bg-ink hover:text-bg transition-colors duration-150',
  'outline-none select-none'
);
```

- [ ] **Step 3: 개발 서버에서 헤더 시각 확인**

`http://localhost:5173/ko` 에서:

- 로고가 중앙 대문자로 표시되는지
- tagline "개발 · 사유 · 기록"이 보이는지
- About / Posts / Series / Contact 4개 nav 항목이 구분선과 함께 표시되는지
- 현재 경로 항목이 반전(검정 배경)으로 강조되는지

- [ ] **Step 4: 타입 체크**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 5: 커밋**

```bash
git add src/3-widgets/header.tsx src/5-shared/components/toggle/theme-toggle/index.tsx
git commit -m "feat(header): 마스트헤드 스타일로 전면 교체, Series 메뉴 추가"
```

---

## Task 4: 홈 화면 — 에디토리얼 표지

**Files:**

- Modify: `src/2-features/about/ui/about-block.tsx`
- Modify: `src/2-features/post/ui/recent-post-block.tsx`
- Modify: `src/4-pages/$locale/index.tsx`

홈 화면 구조:

```
[소개 레이블]
[큰 소개 문구 2~3줄]
[한 단락 소개]
──────────────────
[최근 글 레이블]
[목차형 글 목록 5개]
```

- [ ] **Step 1: about-block.tsx → 에디토리얼 인트로**

```tsx
import { useTranslation } from 'react-i18next';

export default function AboutBlock() {
  const { t } = useTranslation();

  return (
    <div className="mb-10">
      {/* 소개 레이블 */}
      <p className="text-[9px] tracking-[4px] uppercase text-ink3 mb-6">소개</p>

      {/* 큰 소개 문구 */}
      <h1 className="text-[28px] sm:text-[34px] font-bold leading-[1.3] text-ink mb-5 tracking-[-0.3px]">
        {t('about.greeting')}
      </h1>

      {/* 한 단락 본문 */}
      <p className="text-[15px] leading-[2.0] text-ink2 max-w-lg whitespace-pre-line">
        {t('about.introduction')}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: recent-post-block.tsx → TOC 스타일**

```tsx
import { use } from 'react';
import { useTranslation } from 'react-i18next';
import { format, isValid } from 'date-fns';

import Link from '@/5-shared/components/ui/link';
import type { LocaleType } from '@/5-shared/types/common.schema';
import { PagingPosts } from '../model/post.schema';

interface RecentPostBlockProps {
  locale: LocaleType;
  postsPromise: Promise<PagingPosts>;
}

export default function RecentPostBlock({ locale, postsPromise }: RecentPostBlockProps) {
  const { t } = useTranslation();
  const pagingPosts = use(postsPromise);
  const posts = pagingPosts.posts;

  if (!posts || posts.length === 0) {
    return (
      <div>
        <p className="text-[9px] tracking-[4px] uppercase text-ink3 mb-5">
          {t('post.recentPosts')}
        </p>
        <p className="text-ink3 text-sm">{t('post.noPosts')}</p>
      </div>
    );
  }

  return (
    <div>
      {/* 구분선 */}
      <hr className="border-t border-rule mb-8" />

      {/* 레이블 */}
      <p className="text-[9px] tracking-[4px] uppercase text-ink3 mb-5">{t('post.recentPosts')}</p>

      {/* 목차형 목록 */}
      <ol>
        {posts.map((post, idx) => {
          const date =
            post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt as string);
          const formattedDate = isValid(date) ? format(date, 'yyyy.MM') : '—';
          const href = `/${locale}/posts/${post.path.join('/')}`;
          const num = String(idx + 1).padStart(2, '0');

          return (
            <li
              key={post.path.join('/')}
              className="flex items-baseline gap-3 py-4 border-b border-rule first:border-t"
            >
              <span className="text-[9px] text-rule min-w-[18px] shrink-0">{num}</span>
              <Link href={href} className="flex-1 group">
                <span className="block text-[15px] font-semibold text-ink leading-[1.35] mb-1 group-hover:underline underline-offset-2">
                  {post.title}
                </span>
                {post.tags && post.tags.length > 0 && (
                  <span className="text-[10px] text-ink3">{post.tags.join(' · ')}</span>
                )}
              </Link>
              <span className="text-[10px] text-ink3 shrink-0 tabular-nums">{formattedDate}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function RecentPostBlockSkeleton() {
  return (
    <div>
      <hr className="border-t border-rule mb-8" />
      <div className="h-3 w-24 bg-bg2 rounded mb-5 animate-pulse" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-3 py-4 border-b border-rule first:border-t">
          <div className="w-4 h-3 bg-bg2 rounded animate-pulse" />
          <div className="flex-1 h-4 bg-bg2 rounded animate-pulse" />
          <div className="w-12 h-3 bg-bg2 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: index.tsx — loader에서 size 5로 변경**

`src/4-pages/$locale/index.tsx`의 loader에서 `size: 3` → `size: 5`로 변경한다:

```tsx
loader: async ({ params }) => {
  const locale = parseLocale(params.locale);
  const postsPromise = getPosts({ locale, size: 5 });
  return { postsPromise };
},
```

홈 컴포넌트의 wrapper div 클래스 업데이트:

```tsx
function HomePage() {
  const { locale } = Route.useParams();
  const { postsPromise } = Route.useLoaderData();

  return (
    <div className="py-16 max-w-2xl">
      <AboutBlock />
      <Suspense fallback={<RecentPostBlockSkeleton />}>
        <RecentPostBlock locale={parseLocale(locale)} postsPromise={postsPromise} />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 4: 홈 화면 시각 확인**

`http://localhost:5173/ko` 에서:

- 소개 레이블 → 큰 소개 문구 → 본문 → 구분선 → 최근 글 레이블 → 목록 순서인지
- 목록이 번호 · 제목 · 날짜 형태인지

- [ ] **Step 5: 커밋**

```bash
git add src/2-features/about/ui/about-block.tsx \
        src/2-features/post/ui/recent-post-block.tsx \
        src/4-pages/\$locale/index.tsx
git commit -m "feat(home): 에디토리얼 표지 + 목차형 최근 글 목록으로 교체"
```

---

## Task 5: PostCard → TOC 행 컴포넌트

**Files:**

- Modify: `src/2-features/post/ui/post-card.tsx`
- Modify: `src/2-features/post/ui/post-card-list.tsx`
- Test: `src/2-features/post/ui/post-card.test.tsx`
- Test: `src/2-features/post/ui/post-card-list.test.tsx`

기존 `basic`, `compact`, `simple` variant를 모두 제거하고 단일 TOC 행으로 교체한다.

- [ ] **Step 1: post-card.test.tsx 수정**

기존 테스트가 `variant` prop과 카드 레이아웃을 테스트하고 있다면 새 인터페이스에 맞게 수정한다. 먼저 파일을 확인하고 다음 내용으로 교체한다:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithRouter } from '@/5-shared/test-utils/render-with-router';

vi.mock('@/5-shared/components/ui/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import PostCard from './post-card';

const mockProps = {
  title: '테스트 포스트',
  path: ['2024', 'test-post'],
  createdAt: new Date('2024-03-15'),
  tags: ['개발', 'React'],
  locale: 'ko' as const,
  index: 1,
};

describe('PostCard', () => {
  it('제목이 렌더링되어야 한다', () => {
    render(<PostCard {...mockProps} />);
    expect(screen.getByText('테스트 포스트')).toBeInTheDocument();
  });

  it('태그가 표시되어야 한다', () => {
    render(<PostCard {...mockProps} />);
    expect(screen.getByText('개발 · React')).toBeInTheDocument();
  });

  it('날짜가 yyyy.MM 형식으로 표시되어야 한다', () => {
    render(<PostCard {...mockProps} />);
    expect(screen.getByText('2024.03')).toBeInTheDocument();
  });

  it('번호가 두 자리로 표시되어야 한다', () => {
    render(<PostCard {...mockProps} />);
    expect(screen.getByText('01')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
pnpm test run src/2-features/post/ui/post-card.test.tsx
```

Expected: FAIL (컴포넌트 인터페이스가 아직 변경 전)

- [ ] **Step 3: post-card.tsx 전면 교체**

```tsx
import { format, isValid } from 'date-fns';

import Link from '@/5-shared/components/ui/link';
import type { Frontmatter } from '@/1-entities/markdown/model/markdown.schema';
import type { LocaleType } from '@/5-shared/types/common.schema';

interface PostCardProps extends Frontmatter {
  locale: LocaleType;
  /** 목록에서의 순번 (1부터 시작) */
  index: number;
}

/**
 * TOC(목차) 형태의 포스트 행 컴포넌트.
 * 번호 · 제목+태그 · 날짜를 한 행에 표시한다.
 */
export default function PostCard({ title, path, createdAt, tags, locale, index }: PostCardProps) {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt as string);
  const formattedDate = isValid(date) ? format(date, 'yyyy.MM') : '—';
  const href = `/${locale}/posts/${path.join('/')}`;
  const num = String(index).padStart(2, '0');

  return (
    <li className="flex items-baseline gap-3 py-4 border-b border-rule">
      <span className="text-[9px] text-rule min-w-[18px] shrink-0">{num}</span>
      <Link href={href} className="flex-1 group">
        <span className="block text-[15px] sm:text-base font-semibold text-ink leading-[1.35] mb-1 group-hover:underline underline-offset-2">
          {title}
        </span>
        {tags && tags.length > 0 && (
          <span className="text-[10px] text-ink3">{tags.join(' · ')}</span>
        )}
      </Link>
      <span className="text-[10px] text-ink3 shrink-0 tabular-nums">{formattedDate}</span>
    </li>
  );
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
pnpm test run src/2-features/post/ui/post-card.test.tsx
```

Expected: PASS

- [ ] **Step 5: post-card-list.tsx 업데이트**

`variant` 대신 `index`를 넘기도록 수정한다. "포스트 없음" 메시지도 스타일 업데이트:

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import type { LocaleType } from '@/5-shared/types/common.schema';
import PostCard from '@/2-features/post/ui/post-card';
import { getPosts } from '../util/get-posts';

interface PostCardListProps {
  locale: LocaleType;
  tags?: string[];
}

export default function PostCardList({ locale, tags = [] }: PostCardListProps) {
  const { t } = useTranslation();

  const { data: pagingPosts } = useSuspenseQuery({
    queryKey: ['posts', locale, tags],
    queryFn: () => getPosts({ locale, tags }),
    retry: 3,
    staleTime: 1000 * 60 * 5,
  });

  const posts = pagingPosts.posts;

  if (!posts || posts.length === 0) {
    return <p className="text-ink3 text-sm py-8 text-center">{t('post.noPosts')}</p>;
  }

  return (
    <ol>
      {posts.map((post, idx) => (
        <PostCard key={post.path.join('/')} index={idx + 1} locale={locale} {...post} />
      ))}
    </ol>
  );
}

export function PostCardListSkeleton() {
  return (
    <ol>
      {[...Array(5)].map((_, i) => (
        <li key={i} className="flex gap-3 py-4 border-b border-rule">
          <div className="w-4 h-3 bg-bg2 rounded animate-pulse" />
          <div className="flex-1 h-4 bg-bg2 rounded animate-pulse" />
          <div className="w-12 h-3 bg-bg2 rounded animate-pulse" />
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 6: post-card-list.test.tsx 업데이트**

PostCard mock에서 `variant` prop 대신 `index` prop을 확인하도록 수정한다:

```tsx
vi.mock('@/2-features/post/ui/post-card', () => ({
  default: ({ title }: { title: string }) => <li data-testid="post-card">{title}</li>,
}));
```

나머지 테스트 로직은 동일하게 유지한다.

- [ ] **Step 7: posts 페이지에 목록 헤더 추가**

`src/4-pages/$locale/posts/index.tsx`의 `PostsPage` 함수에 페이지 헤더를 추가한다:

```tsx
function PostsPage() {
  const { locale } = Route.useParams();
  // ... 기존 로직 유지 ...

  return (
    <>
      {/* 페이지 헤더 */}
      <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-rule">
        <p className="text-[9px] tracking-[4px] uppercase text-ink3">All Posts</p>
      </div>
      <TagFilterBar locale={locale} availableTags={availableTags} selectedTags={tags} />
      <Suspense fallback={<PostCardListSkeleton />}>
        <PostCardList locale={parsedLocale} tags={tags} />
      </Suspense>
    </>
  );
}
```

- [ ] **Step 8: 전체 테스트 실행**

```bash
pnpm test run
```

Expected: 모든 테스트 PASS

- [ ] **Step 9: 커밋**

```bash
git add src/2-features/post/ui/post-card.tsx \
        src/2-features/post/ui/post-card.test.tsx \
        src/2-features/post/ui/post-card-list.tsx \
        src/2-features/post/ui/post-card-list.test.tsx \
        src/4-pages/\$locale/posts/index.tsx
git commit -m "feat(post): PostCard를 TOC 행 형태로 교체, PostCardList 업데이트"
```

---

## Task 6: 마크다운 헤딩 스타일

**Files:**

- Modify: `src/1-entities/markdown/ui/typography.tsx`

- [ ] **Step 1: typography.tsx 교체**

```tsx
import React from 'react';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  id?: string;
}

function h1({ children, id, ...rest }: HeadingProps) {
  return (
    <h1
      id={id}
      className="group border-b border-ink pb-3 pt-16 mb-6 text-[28px] font-bold leading-tight dark:border-ink"
      {...rest}
    >
      {children}
    </h1>
  );
}

function h2({ children, id, ...rest }: HeadingProps) {
  return (
    <h2
      id={id}
      className="group border-b border-rule pb-2 pt-12 mb-4 text-[22px] font-bold"
      {...rest}
    >
      {children}
    </h2>
  );
}

function h3({ children, id, ...rest }: HeadingProps) {
  return (
    <h3 id={id} className="group pt-10 mb-4 text-[18px] font-bold" {...rest}>
      {children}
    </h3>
  );
}

function h4({ children, id, ...rest }: HeadingProps) {
  return (
    <h4 id={id} className="group pt-7 mb-3 text-[16px] font-semibold" {...rest}>
      {children}
    </h4>
  );
}

function h5({ children, id, ...rest }: HeadingProps) {
  return (
    <h5 id={id} className="group pt-5 mb-3 text-[15px] font-semibold" {...rest}>
      {children}
    </h5>
  );
}

function h6({ children, id, ...rest }: HeadingProps) {
  return (
    <h6 id={id} className="group pt-4 mb-2 text-[14px] font-semibold text-ink2" {...rest}>
      {children}
    </h6>
  );
}

const Typography = { h1, h2, h3, h4, h5, h6 };

export default Typography;
```

- [ ] **Step 2: 커밋**

```bash
git add src/1-entities/markdown/ui/typography.tsx
git commit -m "style(markdown): 헤딩 스타일 모노크롬·여백 강화"
```

---

## Task 7: Blockquote 모노크롬

**Files:**

- Modify: `src/1-entities/markdown/ui/blockquote.tsx`

콜아웃(`[!INFO]`, `[!WARNING]`, `[!DANGER]`, `[!SUCCESS]`)도 색상 제거 — 흑백 계열 + 아이콘으로만 구분한다.

- [ ] **Step 1: blockquote.tsx의 CALLOUT_CONFIGS 교체**

`CALLOUT_CONFIGS` 상수를 다음으로 교체한다:

```tsx
const CALLOUT_CONFIGS: Record<CalloutType, CalloutConfig> = {
  INFO: {
    icon: Info,
    bgColor: 'bg-bg2',
    iconColor: 'text-ink3',
    borderColor: 'border-rule',
  },
  WARNING: {
    icon: AlertTriangle,
    bgColor: 'bg-bg2',
    iconColor: 'text-ink2',
    borderColor: 'border-rule',
  },
  DANGER: {
    icon: AlertOctagon,
    bgColor: 'bg-bg2',
    iconColor: 'text-ink',
    borderColor: 'border-ink',
  },
  SUCCESS: {
    icon: CheckCircle,
    bgColor: 'bg-bg2',
    iconColor: 'text-ink3',
    borderColor: 'border-rule',
  },
};
```

콜아웃 렌더링의 제목 클래스도 업데이트:

```tsx
// 기존
<p className="font-semibold text-gray-900 dark:text-gray-100">

// 변경
<p className="font-semibold text-ink">
```

콜아웃 본문 클래스도 업데이트:

```tsx
// 기존
<div className="text-gray-700 dark:text-gray-300">

// 변경
<div className="text-ink2">
```

일반 blockquote 클래스 교체:

```tsx
// 기존
<blockquote className="my-6 border-l-4 border-gray-300 bg-gray-50 pl-4 pr-4 py-2 italic text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">

// 변경
<blockquote className="my-8 border-l-[3px] border-ink bg-bg2 pl-7 pr-6 py-5 italic text-ink2 text-[15px] leading-[1.9]">
```

- [ ] **Step 2: blockquote 테스트 실행**

```bash
pnpm test run src/1-entities/markdown/ui/blockquote.test.tsx
```

Expected: PASS (스타일만 변경, 로직 동일)

- [ ] **Step 3: 커밋**

```bash
git add src/1-entities/markdown/ui/blockquote.tsx
git commit -m "style(markdown): blockquote·콜아웃 모노크롬 팔레트로 교체"
```

---

## Task 8: TagChip 사각형 모노크롬

**Files:**

- Modify: `src/2-features/post/ui/tag-chip.tsx`

- [ ] **Step 1: tag-chip.tsx 교체**

```tsx
import Link from '@/5-shared/components/ui/link';

interface TagChipProps {
  tag: string;
  locale: string;
}

/**
 * TagChip: 사각형 테두리만 있는 모노크롬 태그 칩.
 */
export default function TagChip({ tag, locale }: TagChipProps) {
  const href = `/${locale}/posts?tags=${encodeURIComponent(tag)}`;

  return (
    <Link
      href={href}
      className="border border-rule text-[9px] text-ink3 px-2 py-0.5 hover:border-ink hover:text-ink transition-colors duration-150"
      aria-label={`태그: ${tag}`}
    >
      {tag}
    </Link>
  );
}
```

- [ ] **Step 2: 전체 테스트 최종 실행**

```bash
pnpm test run
```

Expected: 모든 테스트 PASS

- [ ] **Step 3: 타입 체크 + 린트**

```bash
pnpm tsc --noEmit && pnpm lint
```

- [ ] **Step 4: 브라우저에서 전체 화면 확인**

`http://localhost:5173/ko` 에서 다음을 확인:

1. 홈: 마스트헤드 헤더, 에디토리얼 소개, 목차형 최근 글
2. `/ko/posts`: 목차형 포스트 목록, 사각형 태그 칩
3. 포스트 상세: 세리프 본문, 새 헤딩 스타일, 모노크롬 인용구
4. 다크모드 토글 후 모든 요소 정상 표시

- [ ] **Step 5: 커밋**

```bash
git add src/2-features/post/ui/tag-chip.tsx
git commit -m "style(tag): TagChip 사각형 모노크롬 스타일로 교체"
```

---

## 완료 기준

- [ ] 전체 테스트 PASS (`pnpm test run`)
- [ ] 타입 오류 없음 (`pnpm tsc --noEmit`)
- [ ] 린트 오류 없음 (`pnpm lint`)
- [ ] 브라우저에서 라이트/다크 모드 모두 정상
- [ ] KR/JP/EN 세리프 폰트 로딩 확인
