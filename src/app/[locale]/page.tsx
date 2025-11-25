'use server';

import About from '@/features/about';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage(props: HomePageProps) {
  const { locale } = await props.params;
  return <About params={{ locale }} />;
}
