import PostCard from '@/features/post/post-card';
import { homeCardData } from '@/mock/home';

export default function PostCardList() {
  return (
    <>
      {homeCardData.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </>
  );
}
