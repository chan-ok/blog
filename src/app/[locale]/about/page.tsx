'use server';

import { getPost } from '@/features/post/util/get-post';
import { LocaleSchema, LocaleType } from '@/shared/types/common.schema';
import { notFound, redirect } from 'next/navigation';

interface AboutProps {
  params: Promise<{ locale: LocaleType }>;
}

export default async function AboutPage({ params }: AboutProps) {
  const { locale } = await params;

  if (!LocaleSchema.safeParse(locale).success) {
    redirect('/ko/about');
  }

  try {
    const MdContent = await getPost(locale, 'about', 'md');
    if (!MdContent) throw notFound();

    return <MdContent />;
  } catch (e: unknown) {
    console.error('Failed to fetch post', e);
    throw notFound();
  }
}
