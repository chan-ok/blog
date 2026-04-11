import { createFileRoute, notFound } from '@tanstack/react-router';

import SeriesDetail from '@/2-features/series/ui/series-detail';
import { getSeriesBySlug } from '@/2-features/series/util/get-series';
import { buildMeta, buildCanonicalLink } from '@/5-shared/util/build-meta';

export const Route = createFileRoute('/$locale/series/$slug')({
  // loader: 시리즈 데이터를 미리 로드하고 SEO 메타태그에 사용한다.
  loader: async ({ params }) => {
    const { slug } = params;
    const series = await getSeriesBySlug(slug);
    if (!series) throw notFound();
    return { series };
  },
  // 시리즈 상세 페이지 메타태그
  head: ({ params, loaderData }) => {
    const { locale, slug } = params;
    if (!loaderData) return {};

    const { series } = loaderData;
    const path = `/${locale}/series/${slug}`;

    return {
      meta: buildMeta({
        title: `${series.title} | chan-ok.com`,
        description: series.description ?? `${series.title} — chan-ok.com`,
        locale,
        path,
      }),
      links: buildCanonicalLink(path),
    };
  },
  component: SeriesDetailPage,
});

function SeriesDetailPage() {
  const { locale } = Route.useParams();
  const { series } = Route.useLoaderData();

  return (
    <div className="py-14 max-w-2xl">
      <SeriesDetail series={series} locale={locale} />
    </div>
  );
}
