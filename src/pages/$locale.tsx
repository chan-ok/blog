import {
  createFileRoute,
  ErrorComponentProps,
  notFound,
  Outlet,
  useRouter,
  useRouterState,
} from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod';

import { ErrorPage } from '@/shared/components/error-page';
import { LocaleProvider } from '@/shared/providers/locale-provider';
import { ThemeProvider } from '@/shared/providers/theme-provider';
import { parseLocale } from '@/shared/types/common.schema';
import Footer from '@/shared/components/layout/footer';
import Header from '@/shared/components/layout/header';

const localeSchema = z.enum(['ko', 'ja']);

export const Route = createFileRoute('/$locale')({
  validateSearch: (search) => search,
  beforeLoad: ({ params }) => {
    const result = localeSchema.safeParse(params.locale);
    if (!result.success) {
      throw notFound();
    }
  },
  // 기본 메타태그: 하위 라우트에서 덮어쓰지 않은 경우 폴백으로 사용
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { property: 'og:site_name', content: 'chan-ok.com' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: LocaleLayout,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

function ErrorComponent({ reset }: ErrorComponentProps) {
  const router = useRouter();
  const routerState = useRouterState();

  // Extract locale from the URL pathname using router state
  const pathSegments = routerState.location.pathname.split('/').filter(Boolean);
  const locale = parseLocale(pathSegments[0]);

  const handleGoHome = () => {
    router.navigate({ to: `/${locale}` });
  };

  return (
    <ThemeProvider>
      <LocaleProvider locale={locale}>
        <ErrorPage statusCode={500} onRetry={reset} onGoHome={handleGoHome} />
      </LocaleProvider>
    </ThemeProvider>
  );
}

function NotFoundComponent() {
  const router = useRouter();
  const routerState = useRouterState();

  // Extract locale from the URL pathname using router state
  const pathSegments = routerState.location.pathname.split('/').filter(Boolean);
  const locale = parseLocale(pathSegments[0]);

  const handleGoHome = () => {
    router.navigate({ to: `/${locale}` });
  };

  return (
    <ThemeProvider>
      <LocaleProvider locale={locale}>
        <ErrorPage statusCode={404} onGoHome={handleGoHome} />
      </LocaleProvider>
    </ThemeProvider>
  );
}

function LocaleLayout() {
  const { locale } = Route.useParams();

  // HTML lang 속성 동적 설정
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <ThemeProvider>
      <LocaleProvider locale={parseLocale(locale)}>
        <div className="flex flex-col min-h-screen bg-bg text-ink transition-colors duration-200">
          <Header />
          <main className="flex-1">
            <div className="mx-auto max-w-[960px] px-5 pt-10 sm:px-8">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
      </LocaleProvider>
    </ThemeProvider>
  );
}
