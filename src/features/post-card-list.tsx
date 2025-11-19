import PostCard from '@/features/post-card';
import { homeCardData } from '@/mock/home';

export default function PostCardList() {
  return (
    <>
      {homeCardData.map((data) => (
        <PostCard key={data.id} title={data.title} summary={data.summary} />
      ))}
    </>
  );
}
