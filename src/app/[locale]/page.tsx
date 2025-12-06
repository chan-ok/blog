'use server';

import AboutBlock from '@/features/about/ui/about-block';
import RecentPostBlock from '@/features/post/ui/recent-post-block';

interface AboutProps {
  params: Promise<{ locale: LocaleType }>;
}

export default async function AboutPage({ params }: AboutProps) {
  const { locale } = await params;

  return (
    <div className="flex flex-col gap-8">
      <AboutBlock locale={locale} />
      <RecentPostBlock locale={locale} />
    </div>
  );
}
