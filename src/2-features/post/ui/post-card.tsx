import { format, isValid } from 'date-fns';
import { Link2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Frontmatter } from '@/1-entities/markdown/model/markdown.schema';
import Button from '@/5-shared/components/ui/button';
import Link from '@/5-shared/components/ui/link';
import OptimizedImage from '@/5-shared/components/ui/optimized-image';
import TagChip from './tag-chip';

type PostCardVariant = 'basic' | 'compact' | 'simple';

interface PostCardProps extends Frontmatter {
  locale: string;
  variant: PostCardVariant;
}

// ============================================================================
// Basic 레이아웃 (12열 그리드, 이미지 좌측, summary 포함)
// ============================================================================

function BasicLayout({
  title,
  thumbnail,
  createdAt,
  path,
  summary,
  tags,
  locale,
}: Omit<PostCardProps, 'variant'>) {
  const { t } = useTranslation();

  return (
    <article className="grid grid-cols-12 gap-y-4 gap-4 rounded-lg border border-zinc-100 bg-white p-6 shadow dark:border-zinc-800 dark:bg-gray-800">
      <div className="col-span-full md:col-span-6">
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <OptimizedImage
            src={thumbnail || '/image/context.png'}
            alt={title}
            width={400}
            height={225}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </div>
      <div className="col-span-full flex flex-col gap-0.5 md:col-span-6">
        <div className="text-lg font-bold">{title}</div>
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          {format(createdAt, 'yyyy-MM-dd')}
        </div>
        {tags && tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagChip key={tag} tag={tag} locale={locale} />
            ))}
          </div>
        )}
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

// ============================================================================
// Compact 레이아웃 (고정 높이 flex, 이미지 상단)
// ============================================================================

function CompactLayout({
  title,
  thumbnail,
  createdAt,
  path,
  tags,
  locale,
}: Omit<PostCardProps, 'variant'>) {
  // 썸네일이 없을 경우 기본 이미지 사용
  const thumbnailUrl = thumbnail || '/image/context.png';

  // index.json 등 JSON에서 오는 createdAt은 문자열이므로 Date로 정규화
  const date =
    createdAt instanceof Date ? createdAt : new Date(createdAt as string);
  const formattedDate = isValid(date) ? format(date, 'yyyy-MM-dd') : '—';

  return (
    <article className="group flex h-72 flex-col overflow-hidden rounded-lg border border-zinc-100 bg-white shadow transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-gray-800 md:h-80">
      {/* 썸네일 - 상단 */}
      <div className="h-40 w-full shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-700 md:h-32">
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
            {formattedDate}
          </time>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <TagChip key={tag} tag={tag} locale={locale} />
              ))}
            </div>
          )}
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

// ============================================================================
// Simple 레이아웃 (그리드, 이미지 없음)
// ============================================================================

function SimpleLayout({
  title,
  createdAt,
  path,
  summary,
}: Omit<PostCardProps, 'variant'>) {
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
          render={<Link href={['/posts', ...path].join('/')} />}
        >
          <Link2 size={16} />
          Read More
        </Button>
      </div>
    </article>
  );
}

// ============================================================================
// PostCard — variant에 따라 레이아웃 선택
// ============================================================================

export default function PostCard({ variant, ...props }: PostCardProps) {
  if (variant === 'basic') return <BasicLayout {...props} />;
  if (variant === 'compact') return <CompactLayout {...props} />;
  return <SimpleLayout {...props} />;
}
