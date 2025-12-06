import PostCard from '@/features/post/ui/post-card';
import { getPosts } from '../util/get-posts';

interface PostCardListProps {
  locale: LocaleType;
}

export default async function PostCardList({ locale }: PostCardListProps) {
  const pagingPosts = await getPosts({ locale });
  const posts = pagingPosts.posts;

  return (
    <>
      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <p>No posts found</p>
      )}
    </>
  );
}
