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

import { ErrorPage } from '@/5-shared/components/error-page';
import { LocaleProvider } from '@/5-shared/providers/locale-provider';
import { ThemeProvider } from '@/5-shared/providers/theme-provider';
import { parseLocale } from '@/5-shared/types/common.schema';
import Footer from '@/3-widgets/footer';
import Header from '@/3-widgets/header';

// Locale 유효성 검증
const localeSchema = z.enum(['ko', 'en', 'ja']);

export const Route = createFileRoute('/$locale')({
  validateSearch: (search) => search,
  beforeLoad: ({ params }) => {
    const result = localeSchema.safeParse(params.locale);
    if (!result.success) {
      throw notFound();
    }
  },
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
      <LocaleProvider locale={locale as LocaleType}>
        <div className="flex flex-col min-h-screen bg-white text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
          <Header />
          <main className="flex-1">
            <div className="max-w-4xl mx-auto px-6 pt-10">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
      </LocaleProvider>
    </ThemeProvider>
  );
}
