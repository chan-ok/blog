import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import Link from '@/shared/components/ui/link';
import type { LocaleType } from '@/shared/types/common.schema';
import { getPosts } from '../util/get-posts';

interface PostNavigationProps {
  /** 현재 포스트 path (예: "2024/my-post") */
  currentPath: string;
  locale: LocaleType;
}

/**
 * 포스트 상세 하단 이전/다음 포스트 네비게이션.
 * 전체 포스트 날짜 내림차순 기준으로 prev(오래된)/next(최신)를 표시한다.
 */
export default function PostNavigation({ currentPath, locale }: PostNavigationProps) {
  const { t } = useTranslation();

  const { data: allPosts } = useSuspenseQuery({
    queryKey: ['posts-all', locale],
    queryFn: () => getPosts({ locale, size: Number.MAX_SAFE_INTEGER }).then((r) => r.posts),
    staleTime: 1000 * 60 * 5,
  });

  const currentIndex = allPosts.findIndex((post) => post.path.join('/') === currentPath);

  if (currentIndex === -1) return null;

  // 날짜 내림차순: index+1 = 더 오래된 포스트(이전), index-1 = 더 최신 포스트(다음)
  const prevPost = allPosts[currentIndex + 1] ?? null;
  const nextPost = allPosts[currentIndex - 1] ?? null;

  if (!prevPost && !nextPost) return null;

  return (
    <nav
      className="flex justify-between gap-4 py-8 border-t border-rule"
      aria-label="포스트 네비게이션"
    >
      {/* 이전 포스트 (더 오래된) */}
      <div className="flex-1 min-w-0">
        {prevPost && (
          <Link
            href={`/${locale}/posts/${prevPost.path.join('/')}`}
            className="group flex flex-col gap-1"
          >
            <span className="flex items-center gap-1 text-[10px] tracking-[1.5px] uppercase text-ink3">
              <ChevronLeft size={12} aria-hidden="true" />
              {t('post.prev')}
            </span>
            <span className="text-[13px] font-medium text-ink2 group-hover:text-ink group-hover:underline underline-offset-2 leading-snug line-clamp-2">
              {prevPost.title}
            </span>
          </Link>
        )}
      </div>

      {/* 다음 포스트 (더 최신) */}
      <div className="flex-1 min-w-0 text-right">
        {nextPost && (
          <Link
            href={`/${locale}/posts/${nextPost.path.join('/')}`}
            className="group flex flex-col gap-1 items-end"
          >
            <span className="flex items-center gap-1 text-[10px] tracking-[1.5px] uppercase text-ink3">
              {t('post.next')}
              <ChevronRight size={12} aria-hidden="true" />
            </span>
            <span className="text-[13px] font-medium text-ink2 group-hover:text-ink group-hover:underline underline-offset-2 leading-snug line-clamp-2">
              {nextPost.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}

export function PostNavigationSkeleton() {
  return (
    <div className="flex justify-between gap-4 py-8 border-t border-rule">
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-2 w-16 bg-bg2 rounded animate-pulse" />
        <div className="h-4 w-32 bg-bg2 rounded animate-pulse" />
      </div>
      <div className="flex-1 flex flex-col gap-2 items-end">
        <div className="h-2 w-16 bg-bg2 rounded animate-pulse" />
        <div className="h-4 w-32 bg-bg2 rounded animate-pulse" />
      </div>
    </div>
  );
}
