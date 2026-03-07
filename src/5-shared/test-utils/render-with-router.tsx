import { render } from '@testing-library/react';
import { act } from 'react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
  createRoute,
} from '@tanstack/react-router';

/**
 * TanStack Router 환경에서 컴포넌트를 렌더링하는 헬퍼 함수
 *
 * @param ui - 렌더링할 React 요소
 * @returns render 함수의 반환값
 */
export async function renderWithRouter(ui: React.ReactElement) {
  const rootRoute = createRootRoute({
    component: () => ui,
  });

  // catch-all 라우트 생성 (모든 경로 매칭)
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$',
    component: () => ui,
  });

  const routeTree = rootRoute.addChildren([indexRoute]);

  const history = createMemoryHistory({
    initialEntries: ['/'],
  });

  const router = createRouter({
    routeTree,
    history,
  });

  let result;
  await act(async () => {
    result = render(<RouterProvider router={router} />);
    await router.load();
  });

  return result!;
}
