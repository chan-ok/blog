'use server';

import MDXComponent from '@/entities/mdx';

interface PostDetailPageProps {
  params: Promise<{ locale: LocaleType; slug: string[] }>;
}

export default async function PostDetailPage(props: PostDetailPageProps) {
  const { locale, slug } = await props.params;

  return (
    <MDXComponent locale={locale} slug={['posts', ...slug]} extension="mdx" />
  );
}
