import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import AboutBlock from '@/2-features/about/ui/about-block';
import RecentPostBlock, {
  RecentPostBlockSkeleton,
} from '@/2-features/post/ui/recent-post-block';
import { getPosts } from '@/2-features/post/util/get-posts';
import { parseLocale } from '@/5-shared/types/common.schema';

export const Route = createFileRoute('/$locale/')({
  // loader: 데이터 prefetch (옵션)
  loader: async ({ params }) => {
    const locale = parseLocale(params.locale);
    const postsPromise = getPosts({ locale, size: 3 });
    return { postsPromise };
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
