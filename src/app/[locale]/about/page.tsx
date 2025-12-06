'use server';

import MDXComponent from '@/entities/mdx';

interface AboutPageProps {
  params: Promise<{ locale: LocaleType }>;
}

export default async function AboutPage(props: AboutPageProps) {
  const { locale } = await props.params;

  return <MDXComponent locale={locale} slug={['about']} />;
}
