'use server';

import { LocaleSchema } from '@/shared/types/common.schema';
import { notFound } from 'next/navigation';

interface PostDetailPageProps {
  params: Promise<{ locale: string; slug: string[] }>;
}

export default async function PostDetailPage(props: PostDetailPageProps) {
  const { slug, locale } = await props.params;

  if (!slug.length || !LocaleSchema.safeParse(locale).success) {
    return notFound();
  }

  const path = `#/${locale}/posts/${slug.join('/')}.mdx`;
  const MarkdownModule = await import(path);
  return <MarkdownModule.default />;
}
