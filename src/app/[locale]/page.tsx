'use server';

import { getPost } from '@/features/post/util/get-post';
import { LocaleType } from '@/shared/types/common.schema';
import { notFound } from 'next/navigation';

interface AboutProps {
  params: Promise<{ locale: LocaleType }>;
}

export default async function AboutPage({ params }: AboutProps) {
  const { locale } = await params;

  try {
    const MdContent = await getPost(locale, 'about', 'md');
    if (!MdContent) {
      console.error('Failed to fetch post at home');
      throw notFound();
    }

    return <MdContent />;
  } catch (e: unknown) {
    console.error('Failed to fetch post', e);
    throw notFound();
  }
}
