> ✅ **완료** — 2026-04-11

# Series 기능 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 내 글(Posts)과 외부 스크랩 자료를 하나의 주제로 묶어 발행하는 Series 메뉴를 추가한다.

**Architecture:** `blog-content` 리포지터리의 `series/index.json`에서 시리즈 데이터를 fetch한다. FSD 규칙에 따라 `2-features/series/`에 model/util/ui를 배치하고 `4-pages/$locale/series/`에 라우트를 추가한다.

**Tech Stack:** React 19, TanStack Router v1, Zod, @tanstack/react-query

**전제 조건:** Plan 1 (디자인 개편) 완료. 헤더에 Series 메뉴가 이미 추가되어 있어야 한다.

**중요:** `blog-content` 리포지터리에 `series/index.json` 파일을 별도로 추가해야 한다 (이 플랜 범위 밖). 플랜 완료 후 콘텐츠 리포 작업을 진행한다.

---

## 파일 맵

| 동작 | 파일                                            | 내용               |
| ---- | ----------------------------------------------- | ------------------ |
| 생성 | `src/2-features/series/model/series.schema.ts`  | Zod 스키마 + 타입  |
| 생성 | `src/2-features/series/util/get-series.ts`      | fetch 유틸         |
| 생성 | `src/2-features/series/util/get-series.test.ts` | fetch 유틸 테스트  |
| 생성 | `src/2-features/series/ui/series-list.tsx`      | 시리즈 목록 UI     |
| 생성 | `src/2-features/series/ui/series-detail.tsx`    | 시리즈 상세 UI     |
| 생성 | `src/4-pages/$locale/series/index.tsx`          | 시리즈 목록 라우트 |
| 생성 | `src/4-pages/$locale/series/$slug.tsx`          | 시리즈 상세 라우트 |

---

## Task 1: 데이터 스키마 + fetch 유틸

**Files:**

- Create: `src/2-features/series/model/series.schema.ts`
- Create: `src/2-features/series/util/get-series.ts`
- Create: `src/2-features/series/util/get-series.test.ts`

- [ ] **Step 1: series.schema.ts 작성**

```ts
import { z } from 'zod';

/** 시리즈 아이템 타입: 내 글(post) 또는 스크랩(scrap) */
const seriesItemSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('post'),
    /** blog-content 내 경로 (예: "ko/fsd-retrospective") */
    path: z.string(),
    title: z.string(),
  }),
  z.object({
    type: z.literal('scrap'),
    /** 외부 URL */
    url: z.string().url(),
    title: z.string(),
    /** 선택적 한 줄 코멘트 */
    comment: z.string().optional(),
  }),
]);

export const seriesSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.string(),
  items: z.array(seriesItemSchema),
});

export type Series = z.infer<typeof seriesSchema>;
export type SeriesItem = z.infer<typeof seriesItemSchema>;
export type PostItem = Extract<SeriesItem, { type: 'post' }>;
export type ScrapItem = Extract<SeriesItem, { type: 'scrap' }>;
```

- [ ] **Step 2: get-series.test.ts 작성**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// fetch 모킹
global.fetch = vi.fn();

import { getSeries, getSeriesBySlug } from './get-series';

const mockSeriesList = [
  {
    slug: 'fsd-architecture',
    title: 'FSD 아키텍처 탐구',
    description: 'Feature-Sliced Design 실무 적용',
    createdAt: '2026-03-01',
    items: [
      { type: 'post', path: 'ko/fsd-retrospective', title: 'FSD 6개월 후기' },
      { type: 'scrap', url: 'https://feature-sliced.design', title: '공식 문서' },
    ],
  },
];

describe('getSeries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('시리즈 목록을 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSeriesList,
    } as Response);

    const result = await getSeries('https://example.com');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('fsd-architecture');
    expect(result[0].title).toBe('FSD 아키텍처 탐구');
  });

  it('fetch 실패 시 빈 배열을 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
    } as Response);

    const result = await getSeries('https://example.com');
    expect(result).toEqual([]);
  });
});

describe('getSeriesBySlug', () => {
  it('slug로 시리즈 하나를 찾는다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSeriesList,
    } as Response);

    const result = await getSeriesBySlug('fsd-architecture', 'https://example.com');
    expect(result).not.toBeNull();
    expect(result?.slug).toBe('fsd-architecture');
    expect(result?.items).toHaveLength(2);
  });

  it('없는 slug는 null을 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSeriesList,
    } as Response);

    const result = await getSeriesBySlug('nonexistent', 'https://example.com');
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 3: 테스트 실행 — 실패 확인**

```bash
pnpm test run src/2-features/series/util/get-series.test.ts
```

Expected: FAIL (파일 없음)

- [ ] **Step 4: get-series.ts 구현**

```ts
import { seriesSchema, type Series } from '../model/series.schema';

const BASE_URL =
  'https://raw.githubusercontent.com/chan-ok/blog-content/main';

/**
 * blog-content 리포지터리에서 전체 시리즈 목록을 fetch한다.
 * 실패 시 빈 배열을 반환한다.
 */
export async function getSeries(baseUrl: string = BASE_URL): Promise<Series[]> {
  try {
    const res = await fetch(`${baseUrl}/series/index.json`);
    if (!res.ok) return [];

    const raw = await res.json();
    const parsed = seriesSchema.array().safeParse(raw);
    if (!parsed.success) return [];

    return parsed.data;
  } catch {
    return [];
  }
}

/**
 * slug에 해당하는 시리즈를 반환한다. 없으면 null.
 */
export async function getSeriesBySlug(
  slug: string,
  baseUrl: string = BASE_URL
): Promise<Series | null> {
  const list = await getSeries(baseUrl);
  return list.find((s) => s.slug === slug) ?? null;
}
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

```bash
pnpm test run src/2-features/series/util/get-series.test.ts
```

Expected: PASS

- [ ] **Step 6: 커밋**

```bash
git add src/2-features/series/
git commit -m "feat(series): 시리즈 스키마 + fetch 유틸 추가"
```

---

## Task 2: 시리즈 목록 UI

**Files:**

- Create: `src/2-features/series/ui/series-list.tsx`

목차형 스타일 적용 (Plan 1과 동일한 TOC 스타일).

- [ ] **Step 1: series-list.tsx 작성**

```tsx
import { format } from 'date-fns';
import Link from '@/5-shared/components/ui/link';
import type { Series } from '../model/series.schema';

interface SeriesListProps {
  seriesList: Series[];
  locale: string;
}

/**
 * 시리즈 목록 — TOC 형태로 표시.
 * 각 항목: 번호 · 시리즈 제목 · 항목 수 · 날짜
 */
export default function SeriesList({ seriesList, locale }: SeriesListProps) {
  if (seriesList.length === 0) {
    return (
      <p className="text-ink3 text-sm py-8 text-center">
        아직 발행된 시리즈가 없습니다.
      </p>
    );
  }

  return (
    <ol>
      {seriesList.map((series, idx) => {
        const num = String(idx + 1).padStart(2, '0');
        const date = new Date(series.createdAt);
        const formattedDate = format(date, 'yyyy.MM');
        const href = `/${locale}/series/${series.slug}`;

        return (
          <li
            key={series.slug}
            className="flex items-baseline gap-3 py-4 border-b border-rule first:border-t"
          >
            <span className="text-[9px] text-rule min-w-[18px] shrink-0">
              {num}
            </span>
            <Link href={href} className="flex-1 group">
              <span className="block text-[15px] font-semibold text-ink leading-[1.35] mb-1 group-hover:underline underline-offset-2">
                {series.title}
              </span>
              {series.description && (
                <span className="text-[10px] text-ink3">{series.description}</span>
              )}
            </Link>
            <span className="text-[10px] text-ink3 shrink-0 tabular-nums">
              {series.items.length}편 · {formattedDate}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function SeriesListSkeleton() {
  return (
    <ol>
      {[...Array(3)].map((_, i) => (
        <li key={i} className="flex gap-3 py-4 border-b border-rule first:border-t">
          <div className="w-4 h-3 bg-bg2 rounded animate-pulse" />
          <div className="flex-1 h-4 bg-bg2 rounded animate-pulse" />
          <div className="w-16 h-3 bg-bg2 rounded animate-pulse" />
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/2-features/series/ui/series-list.tsx
git commit -m "feat(series): 시리즈 목록 UI 추가"
```

---

## Task 3: 시리즈 상세 UI

**Files:**

- Create: `src/2-features/series/ui/series-detail.tsx`

내 글(post)과 스크랩(scrap)을 시각적으로 구분하여 표시한다.

- [ ] **Step 1: series-detail.tsx 작성**

```tsx
import { ExternalLink, BookOpen } from 'lucide-react';
import Link from '@/5-shared/components/ui/link';
import type { Series } from '../model/series.schema';

interface SeriesDetailProps {
  series: Series;
  locale: string;
}

/**
 * 시리즈 상세 화면.
 * post: 내부 링크 + 책 아이콘
 * scrap: 외부 링크 + ExternalLink 아이콘 + 코멘트
 */
export default function SeriesDetail({ series, locale }: SeriesDetailProps) {
  return (
    <div>
      {/* 시리즈 헤더 */}
      <div className="mb-10">
        <p className="text-[9px] tracking-[4px] uppercase text-ink3 mb-4">
          Series
        </p>
        <h1 className="text-[28px] font-bold leading-tight text-ink mb-3">
          {series.title}
        </h1>
        {series.description && (
          <p className="text-[15px] leading-[1.9] text-ink2">
            {series.description}
          </p>
        )}
      </div>

      {/* 구분선 */}
      <hr className="border-t border-ink mb-8" />

      {/* 항목 목록 */}
      <ol>
        {series.items.map((item, idx) => {
          const num = String(idx + 1).padStart(2, '0');

          if (item.type === 'post') {
            return (
              <li
                key={item.path}
                className="flex items-start gap-3 py-4 border-b border-rule first:border-t"
              >
                <span className="text-[9px] text-rule min-w-[18px] shrink-0 mt-1">
                  {num}
                </span>
                <BookOpen size={13} className="text-ink3 mt-[3px] shrink-0" />
                <Link
                  href={`/${locale}/posts/${item.path}`}
                  className="flex-1 group"
                >
                  <span className="text-[15px] font-semibold text-ink group-hover:underline underline-offset-2">
                    {item.title}
                  </span>
                  <span className="ml-2 text-[9px] tracking-[1px] uppercase text-ink3">
                    내 글
                  </span>
                </Link>
              </li>
            );
          }

          // scrap
          return (
            <li
              key={item.url}
              className="flex items-start gap-3 py-4 border-b border-rule first:border-t"
            >
              <span className="text-[9px] text-rule min-w-[18px] shrink-0 mt-1">
                {num}
              </span>
              <ExternalLink size={13} className="text-ink3 mt-[3px] shrink-0" />
              <div className="flex-1">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] font-semibold text-ink hover:underline underline-offset-2"
                >
                  {item.title}
                </a>
                <span className="ml-2 text-[9px] tracking-[1px] uppercase text-ink3">
                  스크랩
                </span>
                {item.comment && (
                  <p className="mt-1 text-[12px] text-ink3 leading-[1.6] italic">
                    {item.comment}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/2-features/series/ui/series-detail.tsx
git commit -m "feat(series): 시리즈 상세 UI 추가 (post/scrap 구분 표시)"
```

---

## Task 4: 라우트 추가

**Files:**

- Create: `src/4-pages/$locale/series/index.tsx`
- Create: `src/4-pages/$locale/series/$slug.tsx`

- [ ] **Step 1: series/index.tsx (목록 라우트) 작성**

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

import SeriesList, {
  SeriesListSkeleton,
} from '@/2-features/series/ui/series-list';
import { getSeries } from '@/2-features/series/util/get-series';
import { buildMeta, buildCanonicalLink } from '@/5-shared/util/build-meta';

export const Route = createFileRoute('/$locale/series/')({
  head: ({ params }) => ({
    meta: buildMeta({
      title: 'Series | chan-ok.com',
      description: '주제별 글 모음 — 내 글과 스크랩 자료를 엮은 시리즈',
      locale: params.locale,
      path: `/${params.locale}/series`,
    }),
    links: buildCanonicalLink(`/${params.locale}/series`),
  }),
  component: SeriesPageWrapper,
});

function SeriesPageWrapper() {
  return (
    <Suspense fallback={<SeriesListSkeleton />}>
      <SeriesPage />
    </Suspense>
  );
}

function SeriesPage() {
  const { locale } = Route.useParams();

  const { data: seriesList } = useSuspenseQuery({
    queryKey: ['series'],
    queryFn: () => getSeries(),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="py-14 max-w-2xl">
      <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-rule">
        <p className="text-[9px] tracking-[4px] uppercase text-ink3">Series</p>
      </div>
      <SeriesList seriesList={seriesList} locale={locale} />
    </div>
  );
}
```

- [ ] **Step 2: series/$slug.tsx (상세 라우트) 작성**

```tsx
import { createFileRoute, notFound } from '@tanstack/react-router';
import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

import SeriesDetail from '@/2-features/series/ui/series-detail';
import { getSeriesBySlug } from '@/2-features/series/util/get-series';
import { buildMeta, buildCanonicalLink } from '@/5-shared/util/build-meta';

export const Route = createFileRoute('/$locale/series/$slug')({
  loader: async ({ params }) => {
    const series = await getSeriesBySlug(params.slug);
    if (!series) throw notFound();
    return { series };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return {};
    const { series } = loaderData;
    return {
      meta: buildMeta({
        title: `${series.title} | chan-ok.com`,
        description: series.description ?? `${series.title} — chan-ok.com`,
        locale: params.locale,
        path: `/${params.locale}/series/${params.slug}`,
      }),
      links: buildCanonicalLink(`/${params.locale}/series/${params.slug}`),
    };
  },
  component: SeriesDetailPageWrapper,
});

function SeriesDetailPageWrapper() {
  return (
    <Suspense fallback={<div className="py-14 text-ink3 text-sm">로딩 중...</div>}>
      <SeriesDetailPage />
    </Suspense>
  );
}

function SeriesDetailPage() {
  const { locale, slug } = Route.useParams();

  const { data: series } = useSuspenseQuery({
    queryKey: ['series', slug],
    queryFn: () => getSeriesBySlug(slug),
    staleTime: 1000 * 60 * 5,
  });

  if (!series) throw notFound();

  return (
    <div className="py-14 max-w-2xl">
      <SeriesDetail series={series} locale={locale} />
    </div>
  );
}
```

- [ ] **Step 3: TanStack Router 라우트 트리 재생성**

```bash
pnpm dev
```

TanStack Router가 자동으로 `routeTree.gen.ts`를 갱신한다.
`src/5-shared/config/route/routeTree.gen.ts`에 시리즈 라우트가 추가됐는지 확인한다.

- [ ] **Step 4: 타입 체크**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 5: 브라우저 동작 확인**

`http://localhost:5173/ko/series` 에서:

- "아직 발행된 시리즈가 없습니다." 또는 시리즈 목록 표시 (blog-content에 파일 없을 경우 전자)
- 404 없이 정상 렌더링되는지 확인

- [ ] **Step 6: 전체 테스트 실행**

```bash
pnpm test run
```

Expected: PASS

- [ ] **Step 7: 커밋**

```bash
git add src/4-pages/\$locale/series/ \
        src/5-shared/config/route/routeTree.gen.ts
git commit -m "feat(series): 시리즈 목록·상세 라우트 추가"
```

---

## Task 5: blog-content 리포지터리 준비 (별도 작업)

이 Task는 `blog-content` 리포지터리에서 진행한다. 현재 플랜의 범위 밖이며 Series 기능이 코드 배포된 후 별도로 진행한다.

- [ ] `blog-content` 리포에 `series/index.json` 파일 추가

예시 구조:

```json
[
  {
    "slug": "fsd-architecture",
    "title": "FSD 아키텍처 탐구",
    "description": "Feature-Sliced Design을 실무에 적용하면서 배운 것들",
    "createdAt": "2026-04-01",
    "items": [
      {
        "type": "post",
        "path": "ko/your-post-slug",
        "title": "글 제목"
      },
      {
        "type": "scrap",
        "url": "https://example.com/article",
        "title": "스크랩 제목",
        "comment": "이 글에서 특히 X 부분이 인상적이었다."
      }
    ]
  }
]
```

- [ ] `blog-content` 리포에 커밋 + GitHub Actions로 배포 확인

---

## 완료 기준

- [ ] 전체 테스트 PASS (`pnpm test run`)
- [ ] 타입 오류 없음 (`pnpm tsc --noEmit`)
- [ ] `/ko/series` 접속 시 정상 렌더링
- [ ] `/ko/series/:slug` 접속 시 시리즈 상세 정상 렌더링
- [ ] 없는 slug 접속 시 404 페이지 표시
- [ ] 헤더 Series 메뉴 클릭 시 정상 이동
