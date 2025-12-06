import PostBasicCard from '@/features/post/ui/post-basic-card';
import { getPosts } from '../util/get-posts';

interface PostCardListProps {
  locale: LocaleType;
}

export default async function PostCardList({ locale }: PostCardListProps) {
  const pagingPosts = await getPosts({ locale });
  const posts = pagingPosts.posts;

  return (
    <div className="flex flex-col gap-4">
      {posts.length > 0 ? (
        posts.map((post) => <PostBasicCard key={post.id} {...post} />)
      ) : (
        <p>No posts found</p>
      )}
    </div>
  );
}
