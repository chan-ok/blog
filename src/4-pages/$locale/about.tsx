import { createFileRoute } from '@tanstack/react-router';
import MDComponent from '@/1-entities/markdown';

export const Route = createFileRoute('/$locale/about')({
  component: AboutPage,
});

function AboutPage() {
  const { locale } = Route.useParams();

  const path = `README.${locale}.md`;
  const baseUrl = 'https://raw.githubusercontent.com/chan-ok/chan-ok/main';

  return <MDComponent path={path} baseUrl={baseUrl} />;
}
