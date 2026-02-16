import { Frontmatter } from '@/1-entities/markdown/model/markdown.schema';
import Button from '@/5-shared/components/ui/button';
import Link from '@/5-shared/components/ui/link';

import { format } from 'date-fns';
import { Link2 } from 'lucide-react';

interface Props extends Frontmatter {
  locale: string;
}
export default function PostSimpleCard({
  title,
  createdAt,
  path,
  summary,
  tags,
}: Props) {
  return (
    <article className="grid grid-cols-12 gap-y-4 gap-4 p-6 rounded-lg border border-zinc-100 bg-white shadow dark:border-zinc-800 dark:bg-gray-800">
      <div className="col-span-full flex items-baseline gap-2">
        <div className="text-lg font-bold">{title}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {format(createdAt, 'yyyy-MM-dd')}
        </div>
      </div>
      {tags && tags.length > 0 && (
        <div className="col-span-full flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="col-span-9 flex flex-col gap-0.5">{summary}</div>
      <div className="col-span-3 flex-1 place-self-end">
        <Button
          variant="primary"
          className="place-self-end text-sm"
          nativeButton={false}
          render={<Link href={['/posts', ...path].join('/')} />}
        >
          <Link2 size={16} />
          Read More
        </Button>
      </div>
    </article>
  );
}
