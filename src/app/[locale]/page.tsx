'use server';

import MDXComponent from '@/entities/mdx';

interface AboutProps {
  params: Promise<{ locale: LocaleType }>;
}

export default async function AboutPage({ params }: AboutProps) {
  const { locale } = await params;

  return <MDXComponent locale={locale} slug={['about']} />;
}
