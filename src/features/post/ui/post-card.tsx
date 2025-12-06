import { format } from 'date-fns';
import Link from 'next/link';
import { Post } from '../../../entities/mdx/model/mdx.schema';
interface PostCardProps {
  post: Post;
}

export default async function PostCard({ post }: PostCardProps) {
  const formattedDate = format(post.createdAt, 'yyyy-MM-dd');
  const href = ['/posts', ...post.path].join('/');
  return (
    <article className="mb-6 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-2 text-xl font-semibold">{post.title}</h2>
      <p className="mb-2 text-sm text-gray-500">{formattedDate}</p>
      <p className="mb-3 text-gray-700">{post.summary}</p>
      <Link href={href} className="text-blue-600 hover:underline">
        더 읽기 →
      </Link>
    </article>
  );
}
