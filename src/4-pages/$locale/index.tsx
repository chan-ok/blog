import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

import AboutBlock from '@/2-features/about/ui/about-block';
import RecentPostBlock, {
  RecentPostBlockSkeleton,
} from '@/2-features/post/ui/recent-post-block';
import { getPosts } from '@/2-features/post/util/get-posts';
import { parseLocale } from '@/5-shared/types/common.schema';
import {
  buildMeta,
  buildCanonicalLink,
  getHomeDescription,
} from '@/5-shared/util/build-meta';

export const Route = createFileRoute('/$locale/')({
  // loader: 데이터 prefetch (옵션)
  loader: async ({ params }) => {
    const locale = parseLocale(params.locale);
    const postsPromise = getPosts({ locale, size: 3 });
    return { postsPromise };
  },
  // 홈 페이지 메타태그: 언어별 설명 포함
  head: ({ params }) => {
    const locale = params.locale;
    const description = getHomeDescription(locale);
    return {
      meta: buildMeta({
        title: 'chan-ok.com',
        description,
        locale,
        path: `/${locale}`,
      }),
      links: buildCanonicalLink(`/${locale}`),
    };
  },
  component: HomePage,
});

function HomePage() {
  const { locale } = Route.useParams();
  const { postsPromise } = Route.useLoaderData();

  return (
    <div className="flex flex-col min-h-screen gap-8">
      <AboutBlock />
      <Suspense fallback={<RecentPostBlockSkeleton />}>
        <RecentPostBlock
          locale={parseLocale(locale)}
          postsPromise={postsPromise}
        />
      </Suspense>
    </div>
  );
}
