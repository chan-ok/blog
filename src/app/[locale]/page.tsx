import { Suspense } from 'react';
import AboutBlock from '@/features/about/ui/about-block';
import RecentPostBlock, {
  RecentPostBlockSkeleton,
} from '@/features/post/ui/recent-post-block';
import { getPosts } from '@/features/post/util/get-posts';

interface AboutProps {
  params: Promise<{ locale: LocaleType }>;
}

export default async function AboutPage({ params }: AboutProps) {
  const { locale } = await params;
  const postsPromise = getPosts({ locale, size: 3 });

  return (
    <div className="flex flex-col min-h-screen  gap-8">
      <AboutBlock />
      <Suspense fallback={<RecentPostBlockSkeleton />}>
        <RecentPostBlock locale={locale} postsPromise={postsPromise} />
      </Suspense>
    </div>
  );
}
