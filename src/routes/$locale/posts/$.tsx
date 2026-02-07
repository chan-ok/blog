import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/posts/$')({
  component: PostDetailPage,
});

function PostDetailPage() {
  const { locale, _splat } = Route.useParams();

  return (
    <div className="flex flex-col min-h-screen gap-8">
      <h1 className="text-4xl font-bold">Post Detail</h1>
      <p className="text-gray-600">Locale: {locale}</p>
      <p className="text-gray-600">Path: {_splat}</p>
      <p className="text-sm text-gray-500">TODO: MDX 렌더링 추가 (Phase 3)</p>
    </div>
  );
}
