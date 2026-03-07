import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Suspense } from 'react';
import { z } from 'zod';
import PostCardList, {
  PostCardListSkeleton,
} from '@/2-features/post/ui/post-card-list';
import { parseLocale } from '@/5-shared/types/common.schema';

const searchSchema = z.object({
  tags: z.string().optional(),
});

export const Route = createFileRoute('/$locale/posts/')({
  component: PostsPage,
  validateSearch: (search) => searchSchema.parse(search),
  // TODO: SEO 메타 태그는 Phase 4에서 react-helmet-async로 처리
});

function PostsPage() {
  const { locale } = Route.useParams();
  const search = useSearch({ from: Route.fullPath });
  const tags = search.tags
    ? search.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  return (
    <Suspense fallback={<PostCardListSkeleton />}>
      <PostCardList locale={parseLocale(locale)} tags={tags} />
    </Suspense>
  );
}
