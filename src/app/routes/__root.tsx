import {
  createRootRoute,
  ErrorComponentProps,
  HeadContent,
  Outlet,
  useRouter,
} from '@tanstack/react-router';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { ErrorPage } from '@/shared/components/error-page';

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: RootErrorComponent,
  notFoundComponent: RootNotFoundComponent,
});

function RootErrorComponent({ reset }: ErrorComponentProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.navigate({ to: '/' });
  };

  return <ErrorPage statusCode={500} onRetry={reset} onGoHome={handleGoHome} />;
}

function RootNotFoundComponent() {
  const router = useRouter();

  const handleGoHome = () => {
    router.navigate({ to: '/' });
  };

  return <ErrorPage statusCode={404} onGoHome={handleGoHome} />;
}

function RootLayout() {
  return (
    <>
      {/* 라우트별 동적 메타태그 렌더링 */}
      <HeadContent />
      <Outlet />
      {import.meta.env.DEV && (
        <TanStackDevtools
          plugins={[
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      )}
    </>
  );
}
