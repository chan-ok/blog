import { Frontmatter } from '@/entities/mdx/model/mdx.schema';
import { Button } from '@base-ui-components/react';
import { format } from 'date-fns';
import { Link2 } from 'lucide-react';
import Link from 'next/link';

export default function PostSimpleCard({
  title,
  createdAt,
  path,
  summary,
}: Frontmatter) {
  return (
    <article className="grid grid-cols-12 gap-y-4 gap-4 p-6 rounded-lg border border-zinc-100 bg-white shadow dark:border-zinc-800 dark:bg-gray-800">
      <div className="col-span-full flex items-baseline gap-2">
        <div className="text-lg font-bold">{title}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {format(createdAt, 'yyyy-MM-dd')}
        </div>
      </div>
      <div className="col-span-9 flex flex-col gap-0.5">{summary}</div>
      <div className="col-span-3 flex-1 place-self-end">
        <Link href={['/posts', ...path].join('/')}>
          <Button className="flex items-center place-self-end gap-2 px-4 py-2 text-sm text-white rounded bg-zinc-600 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600">
            <Link2 size={16} />
            Read More
          </Button>
        </Link>
      </div>
    </article>
  );
}
