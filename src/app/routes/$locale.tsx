import { useEffect } from 'react';
import {
  createFileRoute,
  ErrorComponentProps,
  notFound,
  Outlet,
  useRouter,
  useRouterState,
} from '@tanstack/react-router';

import { LocaleProvider } from '@/shared/locale/provider';
import { ErrorPage } from '@/shared/components/error-page';
import Header from '@/shared/components/layout/header';
import Footer from '@/shared/components/layout/footer';

import { LocaleSchema, parseLocale } from '@/shared/locale/schema';

export const Route = createFileRoute('/$locale')({
  validateSearch: (search) => search,
  beforeLoad: ({ params }) => {
    const result = LocaleSchema.safeParse(params.locale);
    if (!result.success) {
      throw notFound();
    }
  },
  // 기본 메타태그: 하위 라우트에서 덮어쓰지 않은 경우 폴백으로 사용
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { property: 'og:site_name', content: 'chanho.kim' },
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
    <LocaleProvider locale={locale}>
      <ErrorPage statusCode={500} onRetry={reset} onGoHome={handleGoHome} />
    </LocaleProvider>
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
    <LocaleProvider locale={locale}>
      <ErrorPage statusCode={404} onGoHome={handleGoHome} />
    </LocaleProvider>
  );
}

function LocaleLayout() {
  const { locale } = Route.useParams();

  // HTML lang 속성 동적 설정
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleProvider locale={parseLocale(locale)}>
      <div className="flex flex-col min-h-screen bg-bg text-ink transition-colors duration-200">
        <a href="#content-start" className="skip-link">
          페이지 본문으로 이동
        </a>
        <Header />
        <main id="content-start" className="flex-1 pt-6 md:pt-10">
          <div className="app-shell">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </LocaleProvider>
  );
}
