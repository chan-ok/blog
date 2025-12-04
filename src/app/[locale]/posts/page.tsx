import PostCardList from '@/features/post/ui/post-card-list';
import { LocaleType } from '@/shared/types/common.schema';
import type { Metadata } from 'next';

export const revalidate = 60; // ISR

export const metadata: Metadata = {
  title: 'Posts',
  description: 'Posts 페이지 설명입니다.',
};

interface Props {
  params: Promise<{ locale: LocaleType }>;
}

export default async function PostsPage(props: Props) {
  const { locale } = await props.params;
  return <PostCardList locale={locale} />;
}
