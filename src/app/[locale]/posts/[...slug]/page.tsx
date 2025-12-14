'use server';

import { notFound } from 'next/navigation';

import MDComponent from '@/entities/markdown';
import Reply from '@/shared/components/reply';

interface PostDetailPageProps {
  params: Promise<{ locale: LocaleType; slug: string[] }>;
}

export default async function PostDetailPage(props: PostDetailPageProps) {
  const { locale, slug } = await props.params;

  if (!slug || slug.length === 0) {
    return notFound();
  }

  const path = [locale, ...slug].join('/') + '.mdx';

  return (
    <>
      <MDComponent path={path} />
      <Reply locale={locale} />
    </>
  );
}
