import type { Preview } from '@storybook/react-vite';
import { createMemoryHistory, createRouter, RouterProvider, createRootRoute } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import '../src/styles/globals.css';

// QueryClient 인스턴스 생성 (Storybook용)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Storybook에서는 재시도 비활성화
      staleTime: Infinity, // Storybook에서는 항상 fresh
    },
  },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },

  decorators: [
    (Story) => {
      // Storybook용 route tree: Story를 렌더링하는 root route
      const rootRoute = createRootRoute({
        component: Story,
      });

      // 라우터 인스턴스 생성
      const router = createRouter({
        routeTree: rootRoute,
        history: createMemoryHistory({ initialEntries: ['/'] }),
      });

      return (
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      );
    },
  ],
};

export default preview;
