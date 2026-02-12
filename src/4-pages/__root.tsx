import {
  createRootRoute,
  ErrorComponentProps,
  Outlet,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { ErrorPage } from '@/5-shared/components/error-page';

// QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      gcTime: 1000 * 60 * 10, // 10분
      retry: 3, // 최대 3회 재시도
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프 (1s, 2s, 4s)
    },
  },
});

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: ({ reset }: ErrorComponentProps) => (
    <ErrorPage
      statusCode={500}
      onRetry={reset}
      onGoHome={() => {
        window.location.href = '/';
      }}
    />
  ),
  notFoundComponent: () => (
    <ErrorPage
      statusCode={404}
      onGoHome={() => {
        window.location.href = '/';
      }}
    />
  ),
});

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      {import.meta.env.DEV && (
        <TanStackDevtools
          plugins={[
            {
              name: 'TanStack Query',
              render: <ReactQueryDevtoolsPanel />,
            },
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      )}
    </QueryClientProvider>
  );
}
