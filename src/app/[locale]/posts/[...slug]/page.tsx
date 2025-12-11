'use server';

import MDComponent from '@/entities/markdown';

interface PostDetailPageProps {
  params: Promise<{ locale: LocaleType; slug: string[] }>;
}

export default async function PostDetailPage(props: PostDetailPageProps) {
  const { locale, slug } = await props.params;

  const path = [locale, 'posts', ...slug].join('/') + '.mdx';
  return <MDComponent path={path} />;
}
