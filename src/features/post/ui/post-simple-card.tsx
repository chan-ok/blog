'use client';

import { Frontmatter } from '@/entities/markdown/model/markdown.schema';
import Button from '@/shared/components/ui/button';
import Link from '@/shared/components/ui/link';

import { format } from 'date-fns';
import { Link2 } from 'lucide-react';

interface Props extends Frontmatter {
  locale: string;
}
export default function PostSimpleCard({
  locale,
  title,
  createdAt,
  path,
  summary,
}: Props) {
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
        <Button
          variant="primary"
          className="place-self-end text-sm"
          nativeButton={false}
          render={<Link href={'/' + [locale, 'posts', ...path].join('/')} />}
        >
          <Link2 size={16} />
          Read More
        </Button>
      </div>
    </article>
  );
}
