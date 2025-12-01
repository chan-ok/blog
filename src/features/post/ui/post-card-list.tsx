import PostCard from '@/features/post/ui/post-card';
import fs from 'node:fs';
import path from 'node:path';
import { Post } from '../model/post.schema';

export default function PostCardList() {
  const filePath = path.join(process.cwd(), 'public', 'posts-index.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const posts: Post[] = JSON.parse(fileContent);

  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </>
  );
}
