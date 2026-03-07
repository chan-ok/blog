import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { z } from 'zod';

import PostCardList, {
  PostCardListSkeleton,
} from '@/2-features/post/ui/post-card-list';
import TagFilterBar from '@/2-features/post/ui/tag-filter-bar';
import { getAvailableTags } from '@/2-features/post/util/get-posts';
import { parseLocale } from '@/5-shared/types/common.schema';

const searchSchema = z.object({
  tags: z.string().optional(),
});

export const Route = createFileRoute('/$locale/posts/')({
  component: PostsPageWithSuspense,
  validateSearch: (search) => searchSchema.parse(search),
  // TODO: SEO 메타 태그는 Phase 4에서 react-helmet-async로 처리
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

  const { data: availableTags } = useSuspenseQuery({
    queryKey: ['availableTags', parsedLocale],
    queryFn: () => getAvailableTags({ locale: parsedLocale }),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <>
      <TagFilterBar
        locale={locale}
        availableTags={availableTags}
        selectedTags={tags}
      />
      <Suspense fallback={<PostCardListSkeleton />}>
        <PostCardList locale={parsedLocale} tags={tags} />
      </Suspense>
    </>
  );
}
