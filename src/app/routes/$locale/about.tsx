import { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import MDComponent from '@/entities/markdown';

import { getMarkdown } from '@/entities/markdown/util/get-markdown';
import { buildMeta, buildCanonicalLink, getAboutDescription } from '@/shared/util/build-meta';
import { resolveContentUrl } from '@/shared/util/content-url';

const ABOUT_BASE_URL = 'https://raw.githubusercontent.com/chan-ok/chan-ok/main';

export const Route = createFileRoute('/$locale/about')({
  loader: async ({ params }) => {
    const path = `README.${params.locale}.md`;
    const markdown = await getMarkdown(path, ABOUT_BASE_URL);

    return {
      markdownPromise: Promise.resolve(markdown),
    };
  },
  // 소개 페이지 메타태그
  head: ({ params }) => {
    const locale = params.locale;
    const description = getAboutDescription(locale);
    return {
      meta: buildMeta({
        title: 'About | chanho.kim',
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
  img: ({ src, alt }: { src?: string; alt?: string }) => {
    const safeSrc = src ? resolveContentUrl(src, ABOUT_BASE_URL) : undefined;
    return safeSrc ? (
      <img src={safeSrc} alt={alt ?? ''} className="max-w-full h-auto" loading="lazy" />
    ) : null;
  },
};

function AboutPage() {
  const { markdownPromise } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-155 pb-16">
      <Suspense fallback={<MarkdownSkeleton />}>
        <MDComponent
          dataPromise={markdownPromise}
          baseUrl={ABOUT_BASE_URL}
          components={aboutImageComponents}
        />
      </Suspense>
    </div>
  );
}

function MarkdownSkeleton() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center p-8 text-ink3">
      <div
        className="h-5 w-5 animate-spin rounded-full border-2 border-rule border-t-accent"
        aria-label={t('about.loading')}
      />
    </div>
  );
}
