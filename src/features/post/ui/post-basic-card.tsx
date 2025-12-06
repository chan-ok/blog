import { Frontmatter } from '@/entities/mdx/model/mdx.schema';
import { Button } from '@base-ui-components/react';
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
    <article className="grid grid-cols-12 gap-y-4 gap-4 p-6 rounded-lg border border-zinc-100 bg-white shadow">
      <div className="col-span-6">
        <Image
          src={thumbnail || '/image/context.png'}
          alt={title}
          width={200}
          height={200}
          className="w-full h-full object-cover"
          preload
        />
      </div>
      <div className="col-span-6 flex flex-col gap-0.5">
        <div className="text-lg font-bold">{title}</div>
        <div className="mb-2 text-sm text-gray-500">
          {format(createdAt, 'yyyy-MM-dd')}
        </div>
        <div className="flex-1">{summary}</div>
        <div className="">
          <Link href={['/posts', ...path].join('/')}>
            <Button className="flex items-center place-self-end gap-2 px-4 py-2 text-sm text-white rounded bg-zinc-600 hover:bg-zinc-700">
              <Link2 size={16} />
              Read More
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
