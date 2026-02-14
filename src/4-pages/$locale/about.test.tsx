import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Route } from './about';

// MDComponent 모킹
vi.mock('@/1-entities/markdown', () => ({
  default: ({ path, baseUrl }: { path: string; baseUrl?: string }) => (
    <div data-testid="md-component" data-path={path} data-base-url={baseUrl}>
      MDX Content for {path}
    </div>
  ),
}));

// useParams 모킹
const mockUseParams = vi.fn(() => ({ locale: 'ko' }));

describe('$locale/about 라우트 (About 페이지)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ locale: 'ko' });
    // @ts-expect-error - 테스트를 위한 모킹
    Route.useParams = mockUseParams;
  });

  it('MDComponent가 올바른 path로 렌더링되어야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    const mdComponent = screen.getByTestId('md-component');
    expect(mdComponent).toBeInTheDocument();
    expect(mdComponent.getAttribute('data-path')).toBe('README.ko.md');
  });

  it('MDComponent가 올바른 baseUrl을 가져야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    const mdComponent = screen.getByTestId('md-component');
    expect(mdComponent.getAttribute('data-base-url')).toBe(
      'https://raw.githubusercontent.com/chan-ok/chan-ok/main'
    );
  });

  it('locale에 따라 다른 경로를 생성해야 한다', () => {
    mockUseParams.mockReturnValue({ locale: 'en' });

    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    const mdComponent = screen.getByTestId('md-component');
    expect(mdComponent.getAttribute('data-path')).toBe('README.en.md');
  });
});
