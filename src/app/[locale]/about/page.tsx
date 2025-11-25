import About from '@/features/about';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About 페이지 설명입니다.',
};

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage(props: AboutPageProps) {
  const params = await props.params;
  return <About params={params} />;
}
