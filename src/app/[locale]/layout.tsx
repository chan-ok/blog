import Footer from '@/widgets/footer';
import Header from '@/widgets/header';

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col text-gray-900">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 pt-10">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
