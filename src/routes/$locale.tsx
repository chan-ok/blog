import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod';
import { LocaleProvider } from '@/shared/providers/locale-provider';
import { ThemeProvider } from '@/shared/providers/theme-provider';
import Footer from '@/widgets/footer';
import Header from '@/widgets/header';

// Locale 유효성 검증
const localeSchema = z.enum(['ko', 'en', 'ja']);

export const Route = createFileRoute('/$locale')({
  validateSearch: (search) => search,
  beforeLoad: ({ params }) => {
    const result = localeSchema.safeParse(params.locale);
    if (!result.success) {
      throw new Error(`Invalid locale: ${params.locale}`);
    }
  },
  component: LocaleLayout,
});

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
