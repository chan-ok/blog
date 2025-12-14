'use client';

import Image from 'next/image';

import { Frontmatter } from '@/entities/markdown/model/markdown.schema';
import Button from '@/shared/components/ui/button';
import Link from '@/shared/components/ui/link';

import { format } from 'date-fns';
import { Link2 } from 'lucide-react';

interface Props extends Frontmatter {
  locale: string;
}

export default function PostBasicCard({
  locale,
  title,
  thumbnail,
  createdAt,
  path,
  summary,
}: Props) {
  return (
    <article className="grid grid-cols-12 gap-y-4 gap-4 p-6 rounded-lg border border-zinc-100 bg-white shadow dark:border-zinc-800 dark:bg-gray-800">
      <div className="col-span-full md:col-span-6">
        <Image
          src={thumbnail || '/image/context.png'}
          alt={title}
          width={200}
          height={200}
          className="w-full h-full object-cover"
          preload
        />
      </div>
      <div className="col-span-full md:col-span-6 flex flex-col gap-0.5">
        <div className="text-lg font-bold">{title}</div>
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          {format(createdAt, 'yyyy-MM-dd')}
        </div>
        <div className="flex-1">{summary}</div>
        <div className="">
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
      </div>
    </article>
  );
}
