import { createFileRoute } from '@tanstack/react-router';

import MDComponent from '@/1-entities/markdown';
import {
  buildMeta,
  buildCanonicalLink,
  getAboutDescription,
} from '@/5-shared/util/build-meta';

export const Route = createFileRoute('/$locale/about')({
  // 소개 페이지 메타태그
  head: ({ params }) => {
    const locale = params.locale;
    const description = getAboutDescription(locale);
    return {
      meta: buildMeta({
        title: 'About | chan-ok.com',
        description,
        locale,
        path: `/${locale}/about`,
      }),
      links: buildCanonicalLink(`/${locale}/about`),
    };
  },
  component: AboutPage,
});

// 스킬 아이콘처럼 인라인 이미지는 border 없이 자연 크기로 표시
const aboutImageComponents = {
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <img
      src={src ?? ''}
      alt={alt ?? ''}
      className="max-w-full h-auto"
      loading="lazy"
    />
  ),
};

function AboutPage() {
  const { locale } = Route.useParams();

  const path = `README.${locale}.md`;
  const baseUrl = 'https://raw.githubusercontent.com/chan-ok/chan-ok/main';

  return (
    <MDComponent
      path={path}
      baseUrl={baseUrl}
      components={aboutImageComponents}
    />
  );
}
