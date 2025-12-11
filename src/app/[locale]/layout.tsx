import { LocaleProvider } from '@/shared/providers/locale-provider';
import { ThemeProvider } from '@/shared/providers/theme-provider';
import Footer from '@/widgets/footer';
import Header from '@/widgets/header';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: LocaleType }>;
}) {
  const { locale } = await params;

  return (
    <ThemeProvider>
      <LocaleProvider locale={locale}>
        <div className="flex flex-col min-h-screen bg-white text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
          <Header />
          <main className="flex-1">
            <div className="max-w-4xl mx-auto px-6 pt-10">{children}</div>
          </main>
          <Footer />
        </div>
      </LocaleProvider>
    </ThemeProvider>
  );
}
