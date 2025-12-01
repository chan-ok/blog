'use server';

import { notFound } from 'next/navigation';

interface PostDetailPageProps {
  params: Promise<{ locale: string; slug: string[] }>;
}

const locales = ['ko', 'ja', 'en'] as const;
type Locale = (typeof locales)[number];

export default async function PostDetailPage(props: PostDetailPageProps) {
  const { slug, locale } = await props.params;

  if (!slug.length || !locales.includes(locale as Locale)) {
    return notFound();
  }

  const path = `#/posts/${locale}/${slug.join('/')}.mdx`;
  console.log(path);

  const MarkdownModule = await import(path);
  return <MarkdownModule.default />;
}
