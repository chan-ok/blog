'use server';

import Post from '@/features/post/ui/post';
import { LocaleType } from '@/shared/types/common.schema';

interface PostDetailPageProps {
  params: Promise<{ locale: LocaleType; slug: string[] }>;
}

export default async function PostDetailPage(props: PostDetailPageProps) {
  const { locale, slug } = await props.params;

  return <Post locale={locale} slug={['posts', ...slug]} extension="mdx" />;
}
