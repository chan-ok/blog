import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Route } from './$locale';

// Provider 모킹
vi.mock('@/shared/providers/locale-provider', () => ({
  LocaleProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="locale-provider">{children}</div>
  ),
}));

vi.mock('@/shared/providers/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

// Widget 모킹
vi.mock('@/widgets/header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/widgets/footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

// TanStack Router 모킹
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  };
});

// useParams 모킹을 위한 setup
const mockUseParams = vi.fn(() => ({ locale: 'ko' }));

describe('$locale 레이아웃 라우트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ locale: 'ko' });
    // Route.useParams를 모킹
    // @ts-expect-error - 테스트를 위한 모킹
    Route.useParams = mockUseParams;
  });

  it('에러 없이 렌더링되어야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    expect(Component).toBeDefined();

    render(<Component />);
  });

  it('LocaleLayout이 모든 주요 요소를 포함해야 한다', () => {
    const Component = Route.options.component as React.ComponentType;

    render(<Component />);

    // Provider 확인
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('locale-provider')).toBeInTheDocument();

    // Widget 확인
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();

    // Outlet 확인
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('유효한 locale 검증 로직이 있어야 한다', () => {
    const beforeLoad = Route.options.beforeLoad;
    expect(beforeLoad).toBeDefined();

    // 유효한 locale
    expect(() =>
      beforeLoad?.({ params: { locale: 'ko' } } as any)
    ).not.toThrow();
    expect(() =>
      beforeLoad?.({ params: { locale: 'en' } } as any)
    ).not.toThrow();
    expect(() =>
      beforeLoad?.({ params: { locale: 'ja' } } as any)
    ).not.toThrow();

    // 유효하지 않은 locale
    expect(() => beforeLoad?.({ params: { locale: 'fr' } } as any)).toThrow(
      'Invalid locale: fr'
    );
  });

  it('레이아웃 구조가 올바른 클래스를 가져야 한다', () => {
    const Component = Route.options.component as React.ComponentType;

    const { container } = render(<Component />);

    // 최상위 div가 flex-col, min-h-screen을 가지는지
    const layoutDiv = container.querySelector('.flex.flex-col.min-h-screen');
    expect(layoutDiv).toBeInTheDocument();

    // main 태그 확인
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement?.classList.contains('flex-1')).toBe(true);
  });
});
