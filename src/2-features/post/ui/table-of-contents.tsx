import { useEffect, useRef, useState, Suspense } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { getSeriesPosts } from "../util/get-series-posts";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
  /** 시리즈 식별자 — 있으면 시리즈 섹션을 TOC 위에 표시 */
  series?: string;
  /** 현재 포스트 경로 (시리즈 강조 표시용) */
  currentPath?: string;
  /** 현재 locale */
  locale?: string;
}

/** 시리즈 포스트 목록 (useSuspenseQuery 사용 — Suspense 래핑 필요) */
function SeriesSection({
  series,
  currentPath,
  locale,
}: {
  series: string;
  currentPath: string;
  locale: string;
}) {
  const { data: seriesPosts } = useSuspenseQuery({
    queryKey: ["series-posts", locale, series],
    queryFn: () => getSeriesPosts({ locale, series }),
    staleTime: 1000 * 60 * 5,
  });

  if (!seriesPosts || seriesPosts.length <= 1) return null;

  return (
    <div className="mb-4 pb-4 border-b border-rule">
      <p className="mb-2 text-[9px] tracking-[3px] uppercase text-ink3">
        {series}
      </p>
      <ol className="flex flex-col gap-2">
        {seriesPosts.map((post, index) => {
          const postPath = post.path.join("/");
          const isCurrent = postPath === currentPath;
          const num = String(index + 1).padStart(2, "0");

          return (
            <li key={postPath} className="flex items-start gap-2">
              <span className="text-[9px] text-ink3 shrink-0 mt-0.5">
                {num}
              </span>
              {isCurrent ? (
                <span className="text-[11px] font-bold text-ink leading-normal">
                  {post.title}
                </span>
              ) : (
                <Link
                  to="/$locale/posts/$"
                  params={{ locale, _splat: postPath }}
                  className="text-[11px] text-ink2 hover:text-ink leading-normal"
                >
                  {post.title}
                  {post.createdAt && (
                    <span className="ml-1.5 text-[10px] text-ink3 tabular-nums">
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

function SeriesSkeleton() {
  return (
    <div className="mb-4 pb-4 border-b border-rule">
      <div className="mb-1 h-2 w-12 animate-pulse rounded bg-bg2" />
      <div className="mb-3 h-3 w-28 animate-pulse rounded bg-bg2" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-full animate-pulse rounded bg-bg2" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-bg2" />
        <div className="h-3 w-4/6 animate-pulse rounded bg-bg2" />
      </div>
    </div>
  );
}

export default function TableOfContents({
  headings,
  series,
  currentPath,
  locale,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (headings.length === 0) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const handleObserve = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingRef.current) return;

      const visibleEntries = entries.filter((entry) => entry.isIntersecting);

      if (visibleEntries.length > 0) {
        const topEntry = visibleEntries.reduce((top, entry) => {
          return entry.boundingClientRect.top < top.boundingClientRect.top
            ? entry
            : top;
        });
        setActiveId(topEntry.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(handleObserve, {
      rootMargin: "0px 0px -70% 0px",
      threshold: 0,
    });

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [headings]);

  const handleHeadingClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      isScrollingRef.current = true;
      setActiveId(id);
      setIsOpen(false);

      element.scrollIntoView({ behavior: "smooth", block: "start" });

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    }
  };

  const hasSeries = Boolean(series && currentPath && locale);
  const hasHeadings = headings.length > 0;

  // 시리즈도 없고 헤딩도 없으면 렌더링 안 함
  if (!hasSeries && !hasHeadings) return null;

  const mobileLabel = hasSeries ? "Series · Contents" : "Contents";

  const tocList = hasHeadings ? (
    <nav role="navigation" aria-label="Table of contents">
      {hasSeries && (
        <p className="mb-2 text-[9px] tracking-[3px] uppercase text-ink3">
          Contents
        </p>
      )}
      <ul className="space-y-1">
        {headings.map(({ id, text, level }, index) => {
          const isActive = activeId === id;
          const indentClass =
            level === 1
              ? "pl-2 text-[12px] font-medium"
              : level === 2
                ? "pl-3 text-[12px]"
                : "pl-6 text-[11px]";

          return (
            <li key={`${id}-${index}`}>
              <button
                onClick={() => handleHeadingClick(id)}
                className={[
                  "block w-full text-left transition-colors py-1.5",
                  "border-l-2 leading-normal",
                  indentClass,
                  isActive
                    ? "font-semibold text-ink border-ink"
                    : "text-ink3 border-transparent hover:text-ink2 hover:border-rule",
                ].join(" ")}
                type="button"
              >
                {text}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  ) : null;

  const fullContent = (
    <>
      {hasSeries && (
        <Suspense fallback={<SeriesSkeleton />}>
          <SeriesSection
            series={series!}
            currentPath={currentPath!}
            locale={locale!}
          />
        </Suspense>
      )}
      {hasHeadings && tocList}
    </>
  );

  return (
    <>
      {/* 모바일/중간: 접이식 (xl=1280px 미만에서 표시) */}
      <div className="mb-8 xl:hidden">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between border border-rule bg-bg2 px-4 py-3 text-left transition-colors hover:bg-bg"
          aria-expanded={isOpen}
          type="button"
        >
          <span className="text-[11px] tracking-[2px] uppercase font-medium text-ink">
            {mobileLabel}
          </span>
          {isOpen ? (
            <ChevronUp size={16} className="text-ink3" aria-hidden="true" />
          ) : (
            <ChevronDown size={16} className="text-ink3" aria-hidden="true" />
          )}
        </button>

        {isOpen && (
          <div className="border border-t-0 border-rule bg-bg p-4">
            {fullContent}
          </div>
        )}
      </div>

      {/* 데스크탑: fixed 사이드바 */}
      <aside className="fixed top-44 hidden max-h-[calc(100vh-12rem)] overflow-y-auto xl:block xl:w-40 xl:left-[calc(50%+28rem+1rem)] 2xl:w-60 2xl:left-[calc(50%+28rem+2.25rem)]">
        <div className="p-4 border-l border-rule">{fullContent}</div>
      </aside>
    </>
  );
}
