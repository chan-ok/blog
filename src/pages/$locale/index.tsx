import { createFileRoute } from '@tanstack/react-router';

import AboutBlock from '@/features/about/ui/about-block';
import { buildMeta, buildCanonicalLink, getHomeDescription } from '@/shared/util/build-meta';

export const Route = createFileRoute('/$locale/')({
  // 홈 페이지 메타태그: 언어별 설명 포함
  head: ({ params }) => {
    const locale = params.locale;
    const description = getHomeDescription(locale);
    return {
      meta: buildMeta({
        title: 'chan-ok.com',
        description,
        locale,
        path: `/${locale}`,
      }),
      links: buildCanonicalLink(`/${locale}`),
    };
  },
  component: HomePage,
});

function HomePage() {
  return (
    <div className="mx-auto max-w-[680px] py-16">
      <AboutBlock />
    </div>
  );
}
