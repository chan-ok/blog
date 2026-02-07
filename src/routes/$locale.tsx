import { createFileRoute, Outlet } from '@tanstack/react-router';
import { z } from 'zod';

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
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}
