import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRouterState } from '@tanstack/react-router';

import Header from './header';

/**
 * ============================================================================
 * Header 위젯 테스트 (마스트헤드 스타일)
 * ============================================================================
 *
 * ## 테스트 종류
 * 1. Unit 테스트: 렌더링, 네비게이션 링크, 접근성, 활성 상태
 *
 * ## 검증 항목
 * - 마스트헤드 로고 및 서브타이틀 렌더링
 * - About / Posts / Series / Contact 네비게이션 링크
 * - pathname 기반 링크 활성 클래스 (bg-ink)
 * - 접근성 속성 (aria-label, nav aria-label)
 * - ThemeToggle, LocaleToggle 렌더링
 */

// TanStack Router 모킹
vi.mock('@tanstack/react-router', () => ({
  useRouterState: vi.fn(),
}));

// ThemeToggle 컴포넌트 모킹
vi.mock('@/5-shared/components/toggle/theme-toggle', () => ({
  default: () => <button aria-label="Toggle theme">Theme</button>,
}));

// LocaleToggle 컴포넌트 모킹
vi.mock('@/5-shared/components/toggle/locale-toggle', () => ({
  default: () => <button aria-label="Toggle locale">Locale</button>,
}));

// Link 컴포넌트 모킹 (href 속성을 유지)
vi.mock('@/5-shared/components/ui/link', () => ({
  default: ({
    href,
    children,
    className,
    'aria-label': ariaLabel,
  }: {
    href: string;
    children?: React.ReactNode;
    className?: string;
    'aria-label'?: string;
  }) => (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  ),
}));

describe('Header 위젯', () => {
  beforeEach(() => {
    vi.mocked(useRouterState).mockReturnValue({
      location: { pathname: '/' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  describe('정상 케이스', () => {
    it('로고("Chanho.dev")가 올바르게 렌더링되고 홈(/) 링크를 가져야 한다', () => {
      render(<Header />);

      const logo = screen.getByLabelText('Home');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveTextContent('Chanho.dev');
      expect(logo).toHaveAttribute('href', '/');
    });

    it('About, Posts, Series, Contact 네비게이션 링크가 올바른 href를 가져야 한다', () => {
      render(<Header />);

      expect(screen.getByLabelText('About')).toHaveAttribute('href', '/about');
      expect(screen.getByLabelText('Posts')).toHaveAttribute('href', '/posts');
      expect(screen.getByLabelText('Series')).toHaveAttribute(
        'href',
        '/series'
      );
      expect(screen.getByLabelText('Contact')).toHaveAttribute(
        'href',
        '/contact'
      );
    });

    it('ThemeToggle 버튼이 렌더링되어야 한다', () => {
      render(<Header />);

      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    it('LocaleToggle 버튼이 렌더링되어야 한다', () => {
      render(<Header />);

      expect(screen.getByLabelText('Toggle locale')).toBeInTheDocument();
    });

    it('nav에 aria-label="주요 네비게이션"이 있어야 한다', () => {
      render(<Header />);

      expect(
        screen.getByRole('navigation', { name: '주요 네비게이션' })
      ).toBeInTheDocument();
    });
  });

  describe('경계 조건', () => {
    it('pathname이 빈 문자열일 때 에러 없이 렌더링되어야 한다', () => {
      vi.mocked(useRouterState).mockReturnValue({
        location: { pathname: '' },
      } as unknown as ReturnType<typeof useRouterState>);

      render(<Header />);

      expect(screen.getByLabelText('About')).toBeInTheDocument();
      expect(screen.getByLabelText('Posts')).toBeInTheDocument();
      expect(screen.getByLabelText('Series')).toBeInTheDocument();
      expect(screen.getByLabelText('Contact')).toBeInTheDocument();
    });
  });

  describe('엣지 케이스', () => {
    it('pathname이 /about일 때 About 링크에 활성 클래스(bg-ink)가 적용되어야 한다', () => {
      vi.mocked(useRouterState).mockReturnValue({
        location: { pathname: '/about' },
      } as unknown as ReturnType<typeof useRouterState>);

      render(<Header />);

      const aboutLink = screen.getByLabelText('About');
      expect(aboutLink).toHaveClass('bg-ink');
    });

    it('pathname이 /series일 때 Series 링크에 활성 클래스(bg-ink)가 적용되어야 한다', () => {
      vi.mocked(useRouterState).mockReturnValue({
        location: { pathname: '/series' },
      } as unknown as ReturnType<typeof useRouterState>);

      render(<Header />);

      const seriesLink = screen.getByLabelText('Series');
      expect(seriesLink).toHaveClass('bg-ink');
    });

    it('pathname이 / (홈)일 때 네비게이션 링크가 활성화되지 않아야 한다', () => {
      vi.mocked(useRouterState).mockReturnValue({
        location: { pathname: '/' },
      } as unknown as ReturnType<typeof useRouterState>);

      render(<Header />);

      const aboutLink = screen.getByLabelText('About');
      expect(aboutLink).not.toHaveClass('bg-ink');
    });
  });

  describe('접근성', () => {
    it('로고 링크에 aria-label="Home"이 있어야 한다', () => {
      render(<Header />);

      expect(screen.getByLabelText('Home')).toHaveAttribute(
        'aria-label',
        'Home'
      );
    });

    it('About 링크에 aria-label="About"이 있어야 한다', () => {
      render(<Header />);

      expect(screen.getByLabelText('About')).toHaveAttribute(
        'aria-label',
        'About'
      );
    });

    it('Posts 링크에 aria-label="Posts"이 있어야 한다', () => {
      render(<Header />);

      expect(screen.getByLabelText('Posts')).toHaveAttribute(
        'aria-label',
        'Posts'
      );
    });

    it('Series 링크에 aria-label="Series"이 있어야 한다', () => {
      render(<Header />);

      expect(screen.getByLabelText('Series')).toHaveAttribute(
        'aria-label',
        'Series'
      );
    });

    it('Contact 링크에 aria-label="Contact"이 있어야 한다', () => {
      render(<Header />);

      expect(screen.getByLabelText('Contact')).toHaveAttribute(
        'aria-label',
        'Contact'
      );
    });

    it('ThemeToggle 버튼에 aria-label이 있어야 한다', () => {
      render(<Header />);

      expect(screen.getByLabelText('Toggle theme')).toHaveAttribute(
        'aria-label',
        'Toggle theme'
      );
    });

    it('LocaleToggle 버튼에 aria-label이 있어야 한다', () => {
      render(<Header />);

      expect(screen.getByLabelText('Toggle locale')).toHaveAttribute(
        'aria-label',
        'Toggle locale'
      );
    });
  });
});
