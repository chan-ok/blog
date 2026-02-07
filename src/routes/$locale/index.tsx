import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute('/$locale/')({
  component: HomePage,
});

function HomePage() {
  const { locale } = Route.useParams();

  return (
    <div className="flex flex-col min-h-screen gap-8">
      <h1 className="text-4xl font-bold">Welcome to Chanho's Blog</h1>
      <p className="text-gray-600">Current locale: {locale}</p>
      <p className="text-sm text-gray-500">
        TODO: AboutBlock + RecentPostBlock 컴포넌트 추가 (Phase 4)
      </p>
    </div>
  );
}
