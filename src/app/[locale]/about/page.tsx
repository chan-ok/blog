'use server';

import Post from '@/features/post/ui/post';
import { LocaleType } from '@/shared/types/common.schema';

interface AboutPageProps {
  params: Promise<{ locale: LocaleType }>;
}

export default async function AboutPage(props: AboutPageProps) {
  const { locale } = await props.params;

  return <Post locale={locale} slug={['about']} />;
}
