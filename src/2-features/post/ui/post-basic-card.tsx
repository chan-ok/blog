import { format } from 'date-fns';
import { Link2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Frontmatter } from '@/1-entities/markdown/model/markdown.schema';
import Button from '@/5-shared/components/ui/button';
import Link from '@/5-shared/components/ui/link';
import OptimizedImage from '@/5-shared/components/ui/optimized-image';

interface Props extends Frontmatter {
  locale: string;
}

export default function PostBasicCard({
  title,
  thumbnail,
  createdAt,
  path,
  summary,
}: Props) {
  const { t } = useTranslation();

  return (
    <article className="grid grid-cols-12 gap-y-4 gap-4 rounded-lg border border-zinc-100 bg-white p-6 shadow dark:border-zinc-800 dark:bg-gray-800">
      <div className="col-span-full md:col-span-6">
        <OptimizedImage
          src={thumbnail || '/image/context.png'}
          alt={title}
          width={200}
          height={200}
          className="h-full w-full object-cover"
          priority
        />
      </div>
      <div className="col-span-full flex flex-col gap-0.5 md:col-span-6">
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
            render={<Link href={['/posts', ...path].join('/')} />}
          >
            <Link2 size={16} />
            {t('post.readMore')}
          </Button>
        </div>
      </div>
    </article>
  );
}
