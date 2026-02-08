import { createFileRoute, notFound } from '@tanstack/react-router';
import MDComponent from '@/entities/markdown';
import Reply from '@/shared/components/reply';

export const Route = createFileRoute('/$locale/posts/$')({
  component: PostDetailPage,
});

function PostDetailPage() {
  const { locale, _splat } = Route.useParams();

  // _splat이 비어있으면 404
  if (!_splat || _splat.trim() === '') {
    throw notFound();
  }

  // 경로 생성: ko/posts/example.mdx
  const path = `${locale}/${_splat}.mdx`;

  return (
    <>
      <MDComponent path={path} />
      <Reply locale={locale as LocaleType} />
    </>
  );
}
