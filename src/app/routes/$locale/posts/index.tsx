import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { createFileRoute } from '@tanstack/react-router';

import PostCardList, { PostCardListSkeleton } from '@/features/post/ui/post-card-list';

import { parseLocale } from '@/shared/locale/schema';
import { buildMeta, buildCanonicalLink, getPostsDescription } from '@/shared/util/build-meta';
import { getPosts } from '@/features/post/util/get-posts';

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
        title: 'Posts | chanho.kim',
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
  const { t } = useTranslation();

  return (
    <div className="pb-16">
      <div className="mb-8 border-b border-rule pb-4">
        <p className="text-[11px] tracking-[0.2em] uppercase text-ink3">{t('post.recentPosts')}</p>
        <h1 className="mt-3 text-[clamp(1.9rem,4vw,2.5rem)] font-semibold leading-tight text-ink">
          {t('post.recentPosts')}
        </h1>
      </div>
      <Suspense fallback={<PostCardListSkeleton />}>
        <PostCardList locale={locale} postsPromise={postsPromise} />
      </Suspense>
    </div>
  );
}
