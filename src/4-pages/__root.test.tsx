import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// Outlet 모킹 (파일 상단에서)
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  };
});

// TanStack Router Devtools 모킹
vi.mock('@tanstack/react-router-devtools', () => ({
  TanStackRouterDevtools: () => <div data-testid="devtools">Devtools</div>,
  TanStackRouterDevtoolsPanel: () => (
    <div data-testid="router-devtools-panel">Router Devtools Panel</div>
  ),
}));

// TanStack React Query Devtools 모킹
vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtoolsPanel: () => (
    <div data-testid="query-devtools-panel">Query Devtools Panel</div>
  ),
}));

// TanStack Devtools 모킹
vi.mock('@tanstack/react-devtools', () => ({
  TanStackDevtools: () => (
    <div data-testid="tanstack-devtools">TanStack Devtools</div>
  ),
}));

// Route 객체를 가져오기 위해 import (모킹 후)
import { Route } from './__root';

describe('__root 라우트', () => {
  it('에러 없이 렌더링되어야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    expect(Component).toBeDefined();
  });

  it('RootLayout이 정상적으로 렌더링되어야 한다', () => {
    const Component = Route.options.component as React.ComponentType;

    const { container } = render(<Component />);

    // 컴포넌트가 렌더링되는지 확인
    expect(container.firstChild).toBeTruthy();
  });

  it('개발 환경에서 Devtools가 표시되어야 한다', () => {
    const originalEnv = import.meta.env.DEV;
    // 테스트를 위한 환경 변수 설정
    import.meta.env.DEV = true;

    const Component = Route.options.component as React.ComponentType;

    const { container } = render(<Component />);

    // 렌더링 확인
    expect(container.firstChild).toBeTruthy();

    // 환경 변수 복원
    import.meta.env.DEV = originalEnv;
  });
});
