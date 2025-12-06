'use server';

import Post from '@/features/post/ui/post';
import { LocaleType } from '@/shared/types/common.schema';

interface AboutProps {
  params: Promise<{ locale: LocaleType }>;
}

export default async function AboutPage({ params }: AboutProps) {
  const { locale } = await params;

  return <Post locale={locale} slug={['about']} />;
}
