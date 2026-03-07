import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { z } from 'zod';
import PostCardList, {
  PostCardListSkeleton,
} from '@/2-features/post/ui/post-card-list';
import { parseLocale } from '@/5-shared/types/common.schema';

export const Route = createFileRoute('/$locale/posts/')({
  component: PostsPage,
  validateSearch: (search) => {
    return z
      .object({
        tags: z.string().optional(),
      })
      .parse(search);
  },
  // TODO: SEO 메타 태그는 Phase 4에서 react-helmet-async로 처리
});

function PostsPage() {
  const { locale } = Route.useParams();

  return (
    <Suspense fallback={<PostCardListSkeleton />}>
      <PostCardList locale={parseLocale(locale)} />
    </Suspense>
  );
}
