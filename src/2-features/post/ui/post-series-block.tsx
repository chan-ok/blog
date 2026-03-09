import { Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { getSeriesPosts } from '../util/get-series-posts';

type PostSeriesBlockProps = {
  /** 시리즈 식별자 (같은 series 값을 가진 포스트끼리 묶임) */
  series: string;
  /** 현재 포스트 경로 (강조 표시용, 예: "ai-doodle/post-title") */
  currentPath: string;
  /** 현재 locale */
  locale: string;
};

/**
 * PostSeriesBlock 컴포넌트
 *
 * 현재 포스트가 속한 시리즈의 포스트 목록을 보여줍니다.
 * 현재 포스트는 강조(bold + 포인트 색상)하고 링크를 비활성화합니다.
 * 다른 포스트는 TanStack Router <Link>로 이동 가능합니다.
 */
export default function PostSeriesBlock({
  series,
  currentPath,
  locale,
}: PostSeriesBlockProps) {
  const { t } = useTranslation();

  const { data: seriesPosts } = useSuspenseQuery({
    queryKey: ['series-posts', locale, series],
    queryFn: () => getSeriesPosts({ locale, series }),
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });

  // 시리즈 포스트가 1개 이하이면 블록 노출 불필요
  if (!seriesPosts || seriesPosts.length <= 1) {
    return null;
  }

  return (
    <div className="my-6 rounded-lg border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950/30">
      {/* 시리즈 제목 */}
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
        {series}
      </p>
      <h2 className="mb-4 text-base font-bold text-gray-900 dark:text-gray-100">
        {t('post.series.otherPosts')}
      </h2>

      {/* 시리즈 포스트 목록 */}
      <ol className="flex flex-col gap-2">
        {seriesPosts.map((post, index) => {
          // 포스트의 경로: path 배열을 슬래시로 이어 붙임
          const postPath = post.path.join('/');
          const isCurrent = postPath === currentPath;

          return (
            <li key={postPath} className="flex items-baseline gap-2">
              {/* 순번 */}
              <span
                className={`shrink-0 text-sm tabular-nums ${
                  isCurrent
                    ? 'font-bold text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {index + 1}.
              </span>

              {isCurrent ? (
                /* 현재 포스트: 링크 없이 강조 표시 */
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {post.title}
                  {post.createdAt && (
                    <span className="ml-2 font-normal text-gray-500 dark:text-gray-400">
                      {format(new Date(post.createdAt), 'yyyy-MM-dd')}
                    </span>
                  )}
                </span>
              ) : (
                /* 다른 포스트: 상세 페이지 링크 */
                <Link
                  to="/$locale/posts/$"
                  params={{ locale, _splat: postPath }}
                  className="text-sm text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  {post.title}
                  {post.createdAt && (
                    <span className="ml-2 text-gray-400 dark:text-gray-500">
                      {format(new Date(post.createdAt), 'yyyy-MM-dd')}
                    </span>
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * PostSeriesBlock 스켈레톤: useSuspenseQuery 로딩 중 표시
 */
export function PostSeriesBlockSkeleton() {
  return (
    <div className="my-6 rounded-lg border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950/30">
      <div className="mb-1 h-3 w-20 animate-pulse rounded bg-blue-200 dark:bg-blue-800" />
      <div className="mb-4 h-4 w-40 animate-pulse rounded bg-blue-200 dark:bg-blue-800" />
      <div className="flex flex-col gap-2">
        <div className="h-4 w-full animate-pulse rounded bg-blue-100 dark:bg-blue-900" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-blue-100 dark:bg-blue-900" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-blue-100 dark:bg-blue-900" />
      </div>
    </div>
  );
}
