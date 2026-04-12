import { BookOpen, ExternalLink } from "lucide-react";

import Link from "@/5-shared/components/ui/link";
import type { Series } from "../model/series.schema";

interface SeriesDetailProps {
  series: Series;
  locale: string;
}

/**
 * 시리즈 상세 화면.
 * post: 내부 링크 + 책 아이콘
 * scrap: 외부 링크 + ExternalLink 아이콘 + 코멘트
 */
export default function SeriesDetail({ series, locale }: SeriesDetailProps) {
  return (
    <div>
      {/* 시리즈 헤더 */}
      <div className="mb-10">
        <p className="text-[9px] tracking-[4px] uppercase text-ink3 mb-4">
          Series
        </p>
        <h1 className="text-[28px] font-bold leading-tight text-ink mb-3">
          {series.title}
        </h1>
        {series.description && (
          <p className="text-[15px] leading-[1.9] text-ink2">
            {series.description}
          </p>
        )}
      </div>

      {/* 구분선 */}
      <hr className="border-t border-ink mb-8" />

      {/* 항목 목록 */}
      <ol>
        {series.items.map((item, idx) => {
          const num = String(idx + 1).padStart(2, "0");

          if (item.type === "post") {
            return (
              <li
                key={item.path}
                className="flex items-start gap-3 py-4 border-b border-rule first:border-t"
              >
                <span className="text-[9px] text-ink3 min-w-[18px] shrink-0 mt-1">
                  {num}
                </span>
                <BookOpen size={13} className="text-ink3 mt-[3px] shrink-0" />
                <Link
                  href={`/${locale}/posts/${item.path}`}
                  className="flex-1 group"
                >
                  <span className="text-[15px] font-semibold text-ink group-hover:underline underline-offset-2">
                    {item.title}
                  </span>
                  <span className="ml-2 text-[9px] tracking-[1px] uppercase text-ink3">
                    내 글
                  </span>
                </Link>
              </li>
            );
          }

          // scrap
          return (
            <li
              key={item.url}
              className="flex items-start gap-3 py-4 border-b border-rule first:border-t"
            >
              <span className="text-[9px] text-ink3 min-w-[18px] shrink-0 mt-1">
                {num}
              </span>
              <ExternalLink size={13} className="text-ink3 mt-[3px] shrink-0" />
              <div className="flex-1">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] font-semibold text-ink hover:underline underline-offset-2"
                >
                  {item.title}
                </a>
                <span className="ml-2 text-[9px] tracking-[1px] uppercase text-ink3">
                  스크랩
                </span>
                {item.comment && (
                  <p className="mt-1 text-[12px] text-ink3 leading-[1.6] italic">
                    {item.comment}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
