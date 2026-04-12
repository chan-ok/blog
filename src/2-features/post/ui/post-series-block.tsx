import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { getSeriesPosts } from "../util/get-series-posts";

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
 * 현재 포스트는 굵게 강조하고 링크를 비활성화합니다.
 * 다른 포스트는 TanStack Router <Link>로 이동 가능합니다.
 */
export default function PostSeriesBlock({
  series,
  currentPath,
  locale,
}: PostSeriesBlockProps) {
  const { data: seriesPosts } = useSuspenseQuery({
    queryKey: ["series-posts", locale, series],
    queryFn: () => getSeriesPosts({ locale, series }),
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });

  // 시리즈 포스트가 1개 이하이면 블록 노출 불필요
  if (!seriesPosts || seriesPosts.length <= 1) {
    return null;
  }

  return (
    <div className="my-8 border border-rule bg-bg2 p-5">
      {/* 시리즈 레이블 */}
      <p className="mb-1 text-[9px] tracking-[4px] uppercase text-ink3">
        Series
      </p>
      <h2 className="mb-5 text-[15px] font-bold text-ink border-b border-rule pb-3">
        {series}
      </h2>

      {/* 시리즈 포스트 목록 */}
      <ol className="flex flex-col">
        {seriesPosts.map((post, index) => {
          const postPath = post.path.join("/");
          const isCurrent = postPath === currentPath;
          const num = String(index + 1).padStart(2, "0");

          return (
            <li
              key={postPath}
              className="flex items-baseline gap-3 py-3 border-b border-rule last:border-b-0"
            >
              {/* 순번 */}
              <span className="text-[9px] text-ink3 shrink-0 min-w-[18px]">
                {num}
              </span>

              {isCurrent ? (
                /* 현재 포스트: 링크 없이 강조 표시 */
                <span className="flex-1 text-[14px] font-bold text-ink">
                  {post.title}
                  {post.createdAt && (
                    <span className="ml-2 font-normal text-[10px] text-ink3 tabular-nums">
                      {format(new Date(post.createdAt), "yyyy.MM")}
                    </span>
                  )}
                </span>
              ) : (
                /* 다른 포스트: 상세 페이지 링크 */
                <Link
                  to="/$locale/posts/$"
                  params={{ locale, _splat: postPath }}
                  className="flex-1 text-[14px] text-ink2 hover:text-ink hover:underline underline-offset-2 transition-colors"
                >
                  {post.title}
                  {post.createdAt && (
                    <span className="ml-2 text-[10px] text-ink3 tabular-nums">
                      {format(new Date(post.createdAt), "yyyy.MM")}
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
    <div className="my-8 border border-rule bg-bg2 p-5">
      <div className="mb-1 h-2 w-16 animate-pulse rounded bg-rule" />
      <div className="mb-5 h-4 w-40 animate-pulse rounded bg-rule pb-3" />
      <div className="flex flex-col gap-3">
        <div className="h-4 w-full animate-pulse rounded bg-rule" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-rule" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-rule" />
      </div>
    </div>
  );
}
