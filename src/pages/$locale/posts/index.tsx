import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

import PostCardList, { PostCardListSkeleton } from '@/features/post/ui/post-card-list';
import { getPosts } from '@/features/post/util/get-posts';
import { parseLocale } from '@/shared/types/common.schema';
import { buildMeta, buildCanonicalLink, getPostsDescription } from '@/shared/util/build-meta';

export const Route = createFileRoute('/$locale/posts/')({
  loader: ({ params }) => {
    const locale = parseLocale(params.locale);

    return {
      locale,
      postsPromise: getPosts({ locale }),
    };
  },
  component: PostsPageWithSuspense,
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
  const { locale, postsPromise } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-[760px] pb-16">
      {/* 페이지 헤더 */}
      <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-rule">
        <p className="text-[9px] tracking-[4px] uppercase text-ink3">All Posts</p>
      </div>
      <Suspense fallback={<PostCardListSkeleton />}>
        <PostCardList locale={locale} postsPromise={postsPromise} />
      </Suspense>
    </div>
  );
}
