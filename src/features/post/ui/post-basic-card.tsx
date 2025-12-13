'use client';

import { Frontmatter } from '@/entities/markdown/model/markdown.schema';
import { format } from 'date-fns';
import { Link2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function PostBasicCard({
  title,
  thumbnail,
  createdAt,
  path,
  summary,
}: Frontmatter) {
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
          <Link
            href={['/posts', ...path].join('/')}
            className="flex items-center place-self-end gap-2 px-4 py-2 text-sm text-white rounded-full bg-zinc-600 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
          >
            <Link2 size={16} />
            Read More
          </Link>
        </div>
      </div>
    </article>
  );
}
