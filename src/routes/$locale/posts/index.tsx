import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/posts/')({
  component: PostsPage,
});

function PostsPage() {
  const { locale } = Route.useParams();

  return (
    <div className="flex flex-col min-h-screen gap-8">
      <h1 className="text-4xl font-bold">Posts</h1>
      <p className="text-gray-600">Locale: {locale}</p>
      <p className="text-sm text-gray-500">TODO: 포스트 목록 추가 (Phase 4)</p>
    </div>
  );
}
