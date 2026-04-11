import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

import SeriesList, {
  SeriesListSkeleton,
} from '@/2-features/series/ui/series-list';
import { getSeries } from '@/2-features/series/util/get-series';
import { buildMeta, buildCanonicalLink } from '@/5-shared/util/build-meta';

export const Route = createFileRoute('/$locale/series/')({
  // 시리즈 목록 페이지 메타태그
  head: ({ params }) => {
    const locale = params.locale;
    return {
      meta: buildMeta({
        title: 'Series | chan-ok.com',
        description:
          '연재 시리즈 — 포스트와 외부 스크랩으로 구성된 큐레이션 컬렉션',
        locale,
        path: `/${locale}/series`,
      }),
      links: buildCanonicalLink(`/${locale}/series`),
    };
  },
  component: SeriesPageWithSuspense,
});

function SeriesPageWithSuspense() {
  return (
    <Suspense fallback={<SeriesListSkeleton />}>
      <SeriesPage />
    </Suspense>
  );
}

function SeriesPage() {
  const { locale } = Route.useParams();

  const { data: seriesList } = useSuspenseQuery({
    queryKey: ['series'],
    queryFn: () => getSeries(),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="py-14 max-w-2xl">
      {/* 페이지 헤더 */}
      <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-rule">
        <p className="text-[9px] tracking-[4px] uppercase text-ink3">Series</p>
      </div>
      <SeriesList seriesList={seriesList} locale={locale} />
    </div>
  );
}
