import PostCard from '@/features/post/ui/post-card';
import fs from 'node:fs';
import path from 'node:path';
import { Post } from '../model/post.schema';

interface PostCardListProps {
  locale: string;
}

export default async function PostCardList({ locale }: PostCardListProps) {
  const filePath = path.join(
    process.cwd(),
    'public',
    'posts-index',
    locale + '.json'
  );
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const posts: Post[] = JSON.parse(fileContent);

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
