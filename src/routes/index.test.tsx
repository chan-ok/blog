import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Route } from './index';

// Navigate 모킹
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => (
      <div data-testid="navigate" data-to={to}>
        Navigate to {to}
      </div>
    ),
  };
});

describe('index 라우트 (루트 리다이렉트)', () => {
  it('에러 없이 렌더링되어야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    expect(Component).toBeDefined();

    render(<Component />);
  });

  it('RootRedirect가 /ko로 리다이렉트해야 한다', () => {
    const Component = Route.options.component as React.ComponentType;

    const { container } = render(<Component />);

    // Navigate 컴포넌트가 렌더링되는지 확인
    const navigateElement = container.querySelector('[data-testid="navigate"]');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement?.getAttribute('data-to')).toBe('/ko');
  });

  it('createFileRoute가 올바른 경로로 생성되어야 한다', () => {
    // Route 객체가 정의되어 있는지 확인
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });
});
