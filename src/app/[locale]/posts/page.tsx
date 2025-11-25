import PostCardList from '@/features/post-card-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Posts',
  description: 'Posts 페이지 설명입니다.',
};

export default async function PostsPage() {
  return <PostCardList />;
}
