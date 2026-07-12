import { Suspense, use } from 'react';
import { format } from 'date-fns';
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import Link from '@/shared/components/ui/link';
import AboutBlock from '@/features/post/ui/about-block';
import { parseLocale } from '@/shared/locale/schema';
import { getPosts } from '@/features/post/util/get-posts';
import { buildMeta, buildCanonicalLink, getHomeDescription } from '@/shared/util/build-meta';

const PREVIEW_POST_COUNT = 4;

export const Route = createFileRoute('/$locale/')({
  loader: ({ params }) => {
    const locale = parseLocale(params.locale);

    return {
      locale,
      postsPromise: getPosts({ locale, size: PREVIEW_POST_COUNT }),
    };
  },
  head: ({ params }) => {
    const locale = params.locale;
    const description = getHomeDescription(locale);
    return {
      meta: buildMeta({
        title: 'chanho.kim',
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
    <div className="pb-16">
      <AboutBlock />
      <section className="mt-8 border-t border-rule pt-8">
        <Suspense fallback={<HomePostSkeleton />}>
          <HomePostPreview />
        </Suspense>
      </section>
    </div>
  );
}

function HomePostSkeleton() {
  return (
    <ul className="space-y-3">
      {[...Array(4)].map((_, index) => (
        <li key={index} className="border-b border-rule py-4">
          <div className="mb-2 h-5 w-full max-w-md rounded bg-bg2 animate-pulse" />
          <div className="h-3 w-16 rounded bg-bg2 animate-pulse" />
        </li>
      ))}
    </ul>
  );
}

function HomePostPreview() {
  const { t } = useTranslation();
  const { locale, postsPromise } = Route.useLoaderData();
  const { posts } = use(postsPromise);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-[clamp(1.5rem,2.8vw,2rem)] font-semibold text-ink">
          {t('post.recentPosts')}
        </h2>
        <Link
          href="/posts"
          className="text-sm font-medium text-ink2 transition-colors hover:text-ink underline underline-offset-4"
        >
          {t('post.readMore')}
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-ink3 py-6">{t('post.noPosts')}</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post, idx) => (
            <li
              key={post.path.join('/')}
              className="group border-b border-rule py-4 md:flex md:items-baseline md:justify-between md:gap-6"
            >
              <RouterLink
                to="/$locale/posts/$"
                params={{ locale, _splat: post.path.join('/') }}
                className="text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-ink2"
              >
                <span className="mr-2 text-[11px] tracking-[0.12em] text-ink3">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                {post.title}
              </RouterLink>
              {post.createdAt ? (
                <time
                  className="mt-1 text-xs uppercase tracking-wide text-ink3 md:mt-0 md:whitespace-nowrap"
                  dateTime={new Date(post.createdAt).toISOString()}
                >
                  {format(new Date(post.createdAt), 'yyyy.MM')}
                </time>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
