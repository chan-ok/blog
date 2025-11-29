import Footer from '@/widgets/footer';
import Header from '@/widgets/header';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen text-gray-900">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-10">{children}</main>
      <Footer />
    </div>
  );
}
