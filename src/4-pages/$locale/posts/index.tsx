import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import PostCardList from '@/2-features/post/ui/post-card-list';

export const Route = createFileRoute('/$locale/posts/')({
  component: PostsPage,
  // TODO: SEO 메타 태그는 Phase 4에서 react-helmet-async로 처리
});

function PostsPage() {
  const { locale } = Route.useParams();

  return (
    <Suspense fallback={<div className="animate-pulse">Loading posts...</div>}>
      <PostCardList locale={locale as LocaleType} />
    </Suspense>
  );
}
