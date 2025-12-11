'use server';

import MDComponent from '@/entities/markdown';

interface AboutPageProps {
  params: Promise<{ locale: LocaleType }>;
}

export default async function AboutPage(props: AboutPageProps) {
  const { locale } = await props.params;

  const path = `README.${locale}.md`;
  const baseUrl = 'https://raw.githubusercontent.com/chan-ok/chan-ok/main';
  return <MDComponent path={path} baseUrl={baseUrl} />;
}
