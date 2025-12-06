import { Frontmatter } from '@/entities/mdx/model/mdx.schema';
import { format } from 'date-fns';
import Link from 'next/link';

export default function PostCard({
  title,
  createdAt,
  path,
  summary,
}: Frontmatter) {
  const formattedDate = format(createdAt, 'yyyy-MM-dd');
  const href = ['/posts', ...path].join('/');
  return (
    <article className="mb-6 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      <p className="mb-2 text-sm text-gray-500">{formattedDate}</p>
      <p className="mb-3 text-gray-700">{summary}</p>
      <Link href={href} className="text-blue-600 hover:underline">
        더 읽기 →
      </Link>
    </article>
  );
}
