'use server';

import MDComponent from '@/entities/markdown';
import { notFound } from 'next/navigation';

interface PostDetailPageProps {
  params: Promise<{ locale: LocaleType; slug: string[] }>;
}

export default async function PostDetailPage(props: PostDetailPageProps) {
  const { locale, slug } = await props.params;

  if (!slug || slug.length === 0) {
    return notFound();
  }

  const path = [locale, ...slug].join('/') + '.mdx';

  return <MDComponent path={path} />;
}
