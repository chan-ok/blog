'use server';

import { getPost } from '@/features/post/util/get-post';
import { LocaleType } from '@/shared/types/common.schema';
import { notFound } from 'next/navigation';

interface PostDetailPageProps {
  params: Promise<{ locale: LocaleType; slug: string[] }>;
}

export default async function PostDetailPage(props: PostDetailPageProps) {
  const { slug, locale } = await props.params;

  try {
    const MdxContent = await getPost(locale, slug.join('/'));
    if (!MdxContent) throw notFound();

    return <MdxContent />;
  } catch (e: unknown) {
    console.error('Failed to fetch post', e);
    throw notFound();
  }
}
