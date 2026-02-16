import { Frontmatter } from '@/1-entities/markdown/model/markdown.schema';
import Button from '@/5-shared/components/ui/button';
import Link from '@/5-shared/components/ui/link';

import { format } from 'date-fns';
import { Link2 } from 'lucide-react';

interface Props extends Frontmatter {
  locale: string;
}

export default function PostCompactCard({
  title,
  createdAt,
  path,
  thumbnail,
}: Props) {
  // 썸네일이 없을 경우 기본 이미지 사용
  const thumbnailUrl = thumbnail || '/images/default-thumbnail.jpg';

  return (
    <article className="group flex h-40 flex-col overflow-hidden rounded-lg border border-zinc-100 bg-white shadow transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-gray-800 md:h-36 md:flex-row">
      {/* 썸네일 - 모바일: 상단, 데스크톱: 좌측 */}
      <div className="h-32 w-full shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-700 md:h-full md:w-40">
        <img
          src={thumbnailUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="flex flex-col gap-1">
          <h3 className="line-clamp-2 text-base font-bold leading-tight">
            {title}
          </h3>
          <time className="text-xs text-gray-500 dark:text-gray-400">
            {format(createdAt, 'yyyy-MM-dd')}
          </time>
        </div>

        {/* Read More 버튼 */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            className="text-xs"
            nativeButton={false}
            render={<Link href={['/posts', ...path].join('/')} />}
          >
            <Link2 size={14} />
            Read More
          </Button>
        </div>
      </div>
    </article>
  );
}
