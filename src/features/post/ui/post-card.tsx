import { Post } from '../model/post.schema';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="mb-6 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-2 text-xl font-semibold">{post.title}</h2>
      <p className="mb-3 text-gray-700">{post.summary}</p>
      <a href={post.path} className="text-blue-600 hover:underline">
        더 읽기 →
      </a>
    </article>
  );
}
