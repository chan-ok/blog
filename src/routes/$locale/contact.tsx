import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/contact')({
  component: ContactPage,
});

function ContactPage() {
  const { locale } = Route.useParams();

  return (
    <div className="flex flex-col min-h-screen gap-8">
      <h1 className="text-4xl font-bold">Contact</h1>
      <p className="text-gray-600">Locale: {locale}</p>
      <p className="text-sm text-gray-500">
        TODO: Contact 폼 컴포넌트 추가 (Phase 4)
      </p>
    </div>
  );
}
