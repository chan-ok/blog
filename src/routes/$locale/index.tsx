import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import AboutBlock from '@/features/about/ui/about-block';
import RecentPostBlock, {
  RecentPostBlockSkeleton,
} from '@/features/post/ui/recent-post-block';
import { getPosts } from '@/features/post/util/get-posts';

export const Route = createFileRoute('/$locale/')({
  // loader: 데이터 prefetch (옵션)
  loader: async ({ params }) => {
    const locale = params.locale as LocaleType;
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
          locale={locale as LocaleType}
          postsPromise={postsPromise}
        />
      </Suspense>
    </div>
  );
}
