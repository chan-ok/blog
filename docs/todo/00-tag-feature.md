# 태그 기능 강화 (최우선)

## 배경
- 현재 포스트 목록 카드에 태그 표시가 없음
- 상단 네비게이션 메뉴에 태그 메뉴가 없음
- 태그 필터링 기능은 백엔드 로직에만 존재 (`get-posts.ts`)
- 태그별 포스트 목록 페이지 미구현

## 작업 항목

### A. 포스트 카드에 태그 표시 추가

**대상 컴포넌트**:
- `src/2-features/post/ui/post-basic-card.tsx` (홈 페이지 기본 카드)
- `src/2-features/post/ui/post-simple-card.tsx` (포스트 목록 단순 카드)

**구현 내용**:
```tsx
// PostBasicCard 예시
import { Tag } from 'lucide-react';

interface PostBasicCardProps {
  // ... 기존 props
  tags: string[];
}

// 카드 하단에 태그 표시
<div className="flex flex-wrap gap-2 mt-2">
  {tags.map((tag) => (
    <Link
      key={tag}
      to="/$locale/tags/$tag"
      params={{ locale, tag }}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
    >
      <Tag size={12} />
      {tag}
    </Link>
  ))}
</div>
```

### B. 상단 네비게이션에 태그 메뉴 추가

**대상 파일**:
- `src/3-widgets/header.tsx`

**구현 내용**:
```tsx
// 기존: Home, Posts, About, Contact
// 추가: Tags (Posts와 About 사이)
<Link
  to="/$locale/tags"
  params={{ locale }}
  className="..."
>
  {t('nav.tags')} {/* i18n 키 추가 필요 */}
</Link>
```

### C. 태그 목록 페이지 (`/$locale/tags/index.tsx`)

**경로**: `src/4-pages/$locale/tags/index.tsx`

**구현 내용**:
- 모든 포스트에서 태그 수집
- 태그별 포스트 수 표시
- 태그 클릭 시 `/$locale/tags/$tag`로 이동
- 인기순/이름순 정렬 옵션

**예상 코드**:
```tsx
import { createFileRoute } from '@tanstack/react-router';
import { getAllTags } from '@/2-features/post/util/get-all-tags'; // 신규 유틸
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/tags/')({
  component: TagsPage,
  loader: async ({ params }) => {
    const tags = await getAllTags(params.locale);
    return { tags };
  },
});

function TagsPage() {
  const { tags } = Route.useLoaderData();
  const { locale } = Route.useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Tags</h1>
      <div className="flex flex-wrap gap-4">
        {tags.map(({ tag, count }) => (
          <Link
            key={tag}
            to="/$locale/tags/$tag"
            params={{ locale, tag }}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <span className="font-semibold">{tag}</span>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              ({count})
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### D. 태그별 포스트 목록 페이지 (`/$locale/tags/$tag.tsx`)

**경로**: `src/4-pages/$locale/tags/$tag.tsx`

**구현 내용**:
- URL 파라미터로 태그 필터링
- `get-posts.ts`의 `tags` 파라미터 활용
- 기존 `PostCardList` 재활용

**예상 코드**:
```tsx
import { createFileRoute } from '@tanstack/react-router';
import { getPosts } from '@/2-features/post/util/get-posts';
import PostCardList from '@/2-features/post/ui/post-card-list';

export const Route = createFileRoute('/$locale/tags/$tag')({
  component: TagPostsPage,
  loader: async ({ params }) => {
    const { locale, tag } = params;
    const { items, total } = await getPosts({
      locale,
      page: 0,
      size: 20,
      tags: [tag],
    });
    return { items, total, tag };
  },
});

function TagPostsPage() {
  const { items, tag } = Route.useLoaderData();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        Tag: <span className="text-blue-600 dark:text-blue-400">{tag}</span>
      </h1>
      <PostCardList items={items} />
    </div>
  );
}
```

### E. 신규 유틸리티: `get-all-tags.ts`

**경로**: `src/2-features/post/util/get-all-tags.ts`

**구현 내용**:
```ts
import { getAllPostsData } from './get-posts-data';

interface TagCount {
  tag: string;
  count: number;
}

export async function getAllTags(locale: string): Promise<TagCount[]> {
  const allPosts = await getAllPostsData(locale);
  
  const tagMap = new Map<string, number>();
  
  allPosts.forEach((post) => {
    post.tags?.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count); // 포스트 수 내림차순
}
```

### F. i18n 번역 키 추가

**파일**: `public/locales/ko/translation.json`, `en/translation.json`

```json
{
  "nav": {
    "tags": "태그" // en: "Tags"
  },
  "tags": {
    "title": "모든 태그",
    "postsCount": "{{count}}개의 포스트"
  }
}
```

## 예상 파일 구조
```
src/4-pages/$locale/tags/
├── index.tsx          # 태그 목록 페이지
└── $tag.tsx           # 태그별 포스트 목록

src/2-features/post/util/
└── get-all-tags.ts    # 태그 수집 유틸리티 (신규)

src/2-features/post/ui/
├── post-basic-card.tsx    # 태그 표시 추가
└── post-simple-card.tsx   # 태그 표시 추가

src/3-widgets/
└── header.tsx         # 태그 메뉴 추가
```

## Phase별 작업 계획
- **Phase 1**: 태그 메뉴 추가 + 태그 목록 페이지
- **Phase 2**: 태그별 포스트 목록 페이지 + 유틸리티
- **Phase 3**: 포스트 카드에 태그 표시
- **Phase 4**: i18n 번역 + 전체 통합 테스트

## 테스팅 요구사항
- **Unit 테스트**: `get-all-tags.ts` 로직 검증
- **E2E 테스트**: 태그 클릭 → 필터링된 포스트 목록 확인
- **Storybook**: PostBasicCard, PostSimpleCard에 tags props 추가

## 공통 참고사항
- 코드 스타일: `docs/code-style.md` 준수
- 아키텍처: FSD 레이어 규칙 (`docs/architecture-rules.md`) 준수
- 테스팅: TDD (Red/Green/Refactor), 커버리지 80%+ (`docs/testing.md`)
- 언어: 한국어 문서/주석/커밋, 영어 코드 (`docs/language-rules.md`)
- Git: feature branch → develop PR (`docs/git-flow.md`)
