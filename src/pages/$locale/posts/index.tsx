import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { z } from 'zod';

import PostCardList, { PostCardListSkeleton } from '@/features/post/ui/post-card-list';
import PostSearchInput from '@/features/post/ui/post-search-input';
import TagFilterBar from '@/features/post/ui/tag-filter-bar';
import { getAvailableTags } from '@/features/post/util/get-available-tags';
import { parseLocale } from '@/shared/types/common.schema';
import { buildMeta, buildCanonicalLink, getPostsDescription } from '@/shared/util/build-meta';

const searchSchema = z.object({
  tags: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute('/$locale/posts/')({
  component: PostsPageWithSuspense,
  validateSearch: (search) => searchSchema.parse(search),
  // 포스트 목록 페이지 메타태그
  head: ({ params }) => {
    const locale = params.locale;
    const description = getPostsDescription(locale);
    return {
      meta: buildMeta({
        title: 'Posts | chan-ok.com',
        description,
        locale,
        path: `/${locale}/posts`,
      }),
      links: buildCanonicalLink(`/${locale}/posts`),
    };
  },
});

function PostsPageWithSuspense() {
  return (
    <Suspense fallback={<PostCardListSkeleton />}>
      <PostsPage />
    </Suspense>
  );
}

function PostsPage() {
  const { locale } = Route.useParams();
  const search = useSearch({ from: Route.fullPath });
  const parsedLocale = parseLocale(locale);
  const tags = search.tags
    ? search.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];
  const query = search.q ?? '';

  const { data: availableTags } = useSuspenseQuery({
    queryKey: ['availableTags', parsedLocale],
    queryFn: () => getAvailableTags({ locale: parsedLocale }),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <>
      {/* 페이지 헤더 */}
      <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-rule">
        <p className="text-[9px] tracking-[4px] uppercase text-ink3">All Posts</p>
      </div>
      <PostSearchInput locale={locale} initialValue={query} selectedTags={tags} />
      <TagFilterBar locale={locale} availableTags={availableTags} selectedTags={tags} />
      <Suspense fallback={<PostCardListSkeleton />}>
        <PostCardList locale={parsedLocale} tags={tags} query={query} />
      </Suspense>
    </>
  );
}
