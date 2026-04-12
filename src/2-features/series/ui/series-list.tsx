import { format } from "date-fns";
import { useTranslation } from "react-i18next";

import Link from "@/5-shared/components/ui/link";
import type { Series } from "../model/series.schema";

interface SeriesListProps {
  seriesList: Series[];
  locale: string;
}

/**
 * 시리즈 목록 — TOC 형태로 표시.
 * 각 항목: 번호 · 시리즈 제목 · 항목 수 · 날짜
 */
export default function SeriesList({ seriesList, locale }: SeriesListProps) {
  const { t } = useTranslation();

  if (seriesList.length === 0) {
    return (
      <p className="text-ink3 text-sm py-8 text-center">{t("series.empty")}</p>
    );
  }

  return (
    <ol>
      {seriesList.map((series, idx) => {
        const num = String(idx + 1).padStart(2, "0");
        const date = new Date(series.createdAt);
        const formattedDate = format(date, "yyyy.MM");
        const href = `/${locale}/series/${series.slug}`;

        return (
          <li
            key={series.slug}
            className="flex items-baseline gap-3 py-4 border-b border-rule first:border-t"
          >
            <span className="text-[9px] text-ink3 min-w-[18px] shrink-0">
              {num}
            </span>
            <Link href={href} className="flex-1 group">
              <span className="block text-[15px] font-semibold text-ink leading-[1.35] mb-1 group-hover:underline underline-offset-2">
                {series.title}
              </span>
              {series.description && (
                <span className="text-[10px] text-ink3">
                  {series.description}
                </span>
              )}
            </Link>
            <span className="text-[10px] text-ink3 shrink-0 tabular-nums">
              {series.items.length}편 · {formattedDate}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function SeriesListSkeleton() {
  return (
    <ol>
      {[...Array(3)].map((_, i) => (
        <li
          key={i}
          className="flex gap-3 py-4 border-b border-rule first:border-t"
        >
          <div className="w-4 h-3 bg-bg2 rounded animate-pulse" />
          <div className="flex-1 h-4 bg-bg2 rounded animate-pulse" />
          <div className="w-16 h-3 bg-bg2 rounded animate-pulse" />
        </li>
      ))}
    </ol>
  );
}
