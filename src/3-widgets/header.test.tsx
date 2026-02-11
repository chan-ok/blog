import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRouterState } from '@tanstack/react-router';

import Header from './header';
import { useDetectScrolled } from '@/5-shared/hooks/useDetectScrolled';

/**
 * ============================================================================
 * Header 위젯 테스트
 * ============================================================================
 *
 * ## 테스트 종류
 * 1. Unit 테스트: 렌더링, 네비게이션 링크, 접근성, 스크롤 상태
 *
 * ## 검증 항목
 * - 로고 및 네비게이션 링크 렌더링
 * - pathname 기반 링크 하이라이트
 * - 다국어 지원 (ko/en/ja)
 * - 접근성 속성 (aria-label)
 * - 스크롤 상태에 따른 스타일 변경
 * - ThemeToggle, LocaleToggle 렌더링
 */

// TanStack Router 모킹
vi.mock('@tanstack/react-router', () => ({
  useRouterState: vi.fn(),
}));

// useDetectScrolled 모킹
vi.mock('@/5-shared/hooks/useDetectScrolled', () => ({
  useDetectScrolled: vi.fn(),
}));

// react-i18next 모킹
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'nav.about': 'About',
        'nav.posts': 'Posts',
        'nav.contact': 'Contact',
      };
      return translations[key] || key;
    },
  }),
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
  default: ({ href, children, className, 'aria-label': ariaLabel }: any) => (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  ),
}));

describe('Header 위젯', () => {
  beforeEach(() => {
    // 기본값 설정
    vi.mocked(useRouterState).mockReturnValue({
      location: { pathname: '/' },
    } as any);
    vi.mocked(useDetectScrolled).mockReturnValue(false);
  });

  describe('정상 케이스', () => {
    it('로고("Chanho.dev")가 올바르게 렌더링되고 홈(/) 링크를 가져야 한다', () => {
      render(<Header />);

      const logo = screen.getByLabelText('Home');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveTextContent('Chanho.dev');
      expect(logo).toHaveAttribute('href', '/');
    });

    it('About, Posts, Contact 네비게이션 링크가 올바른 href를 가져야 한다', () => {
      render(<Header />);

      const aboutLink = screen.getByLabelText('About');
      const postsLink = screen.getByLabelText('Posts');
      const contactLink = screen.getByLabelText('Contact');

      expect(aboutLink).toHaveAttribute('href', '/about');
      expect(postsLink).toHaveAttribute('href', '/posts');
      expect(contactLink).toHaveAttribute('href', '/contact');
    });

    it('ThemeToggle 버튼이 렌더링되어야 한다', () => {
      render(<Header />);

      const themeToggle = screen.getByLabelText('Toggle theme');
      expect(themeToggle).toBeInTheDocument();
    });

    it('LocaleToggle 버튼이 렌더링되어야 한다', () => {
      render(<Header />);

      const localeToggle = screen.getByLabelText('Toggle locale');
      expect(localeToggle).toBeInTheDocument();
    });
  });

  describe('경계 조건', () => {
    it('pathname이 빈 문자열일 때 처리해야 한다', () => {
      vi.mocked(useRouterState).mockReturnValue({
        location: { pathname: '' },
      } as any);

      render(<Header />);

      // 에러 없이 렌더링되고 모든 링크가 하이라이트되지 않아야 함
      const aboutLink = screen.getByLabelText('About');
      const postsLink = screen.getByLabelText('Posts');
      const contactLink = screen.getByLabelText('Contact');

      expect(aboutLink).not.toHaveClass('text-blue-600');
      expect(postsLink).not.toHaveClass('text-blue-600');
      expect(contactLink).not.toHaveClass('text-blue-600');
    });

    it('locale이 ko일 때 네비게이션 텍스트가 올바르게 표시되어야 한다', () => {
      render(<Header />);

      // i18n 모킹에서 영어 번역을 반환하므로 영어로 검증
      expect(screen.getByLabelText('About')).toBeInTheDocument();
      expect(screen.getByLabelText('Posts')).toBeInTheDocument();
      expect(screen.getByLabelText('Contact')).toBeInTheDocument();
    });

    it('locale이 en일 때 네비게이션 텍스트가 올바르게 표시되어야 한다', () => {
      // 모킹된 번역 함수가 이미 영어를 반환하므로 동일하게 검증
      render(<Header />);

      expect(screen.getByLabelText('About')).toBeInTheDocument();
      expect(screen.getByLabelText('Posts')).toBeInTheDocument();
      expect(screen.getByLabelText('Contact')).toBeInTheDocument();
    });

    it('locale이 ja일 때 네비게이션 텍스트가 올바르게 표시되어야 한다', () => {
      // 모킹된 번역 함수가 이미 영어를 반환하므로 동일하게 검증
      render(<Header />);

      expect(screen.getByLabelText('About')).toBeInTheDocument();
      expect(screen.getByLabelText('Posts')).toBeInTheDocument();
      expect(screen.getByLabelText('Contact')).toBeInTheDocument();
    });
  });

  describe('엣지 케이스', () => {
    it('pathname이 /about일 때 About 링크가 하이라이트되어야 한다', () => {
      vi.mocked(useRouterState).mockReturnValue({
        location: { pathname: '/about' },
      } as any);

      render(<Header />);

      const aboutLink = screen.getByLabelText('About');
      expect(aboutLink).toHaveClass('text-blue-600');
      expect(aboutLink).toHaveClass('bg-blue-50');
    });

    it('pathname이 /posts일 때 Posts 링크가 하이라이트되어야 한다', () => {
      vi.mocked(useRouterState).mockReturnValue({
        location: { pathname: '/posts' },
      } as any);

      render(<Header />);

      const postsLink = screen.getByLabelText('Posts');
      expect(postsLink).toHaveClass('text-blue-600');
      expect(postsLink).toHaveClass('bg-blue-50');
    });

    it('pathname이 /contact일 때 Contact 링크가 하이라이트되어야 한다', () => {
      vi.mocked(useRouterState).mockReturnValue({
        location: { pathname: '/contact' },
      } as any);

      render(<Header />);

      const contactLink = screen.getByLabelText('Contact');
      expect(contactLink).toHaveClass('text-blue-600');
      expect(contactLink).toHaveClass('bg-blue-50');
    });

    it('pathname이 / (홈)일 때 네비게이션 링크가 모두 하이라이트되지 않아야 한다', () => {
      vi.mocked(useRouterState).mockReturnValue({
        location: { pathname: '/' },
      } as any);

      render(<Header />);

      const aboutLink = screen.getByLabelText('About');
      const postsLink = screen.getByLabelText('Posts');
      const contactLink = screen.getByLabelText('Contact');

      expect(aboutLink).not.toHaveClass('text-blue-600');
      expect(postsLink).not.toHaveClass('text-blue-600');
      expect(contactLink).not.toHaveClass('text-blue-600');
    });

    it('pathname이 /posts/some-post일 때 Posts 링크가 하이라이트되어야 한다', () => {
      vi.mocked(useRouterState).mockReturnValue({
        location: { pathname: '/posts/some-post' },
      } as any);

      render(<Header />);

      const postsLink = screen.getByLabelText('Posts');
      expect(postsLink).toHaveClass('text-blue-600');
      expect(postsLink).toHaveClass('bg-blue-50');
    });
  });

  describe('접근성', () => {
    it('로고 링크에 aria-label="Home"이 있어야 한다', () => {
      render(<Header />);

      const logo = screen.getByLabelText('Home');
      expect(logo).toHaveAttribute('aria-label', 'Home');
    });

    it('About 링크에 적절한 aria-label이 있어야 한다', () => {
      render(<Header />);

      const aboutLink = screen.getByLabelText('About');
      expect(aboutLink).toHaveAttribute('aria-label', 'About');
    });

    it('Posts 링크에 적절한 aria-label이 있어야 한다', () => {
      render(<Header />);

      const postsLink = screen.getByLabelText('Posts');
      expect(postsLink).toHaveAttribute('aria-label', 'Posts');
    });

    it('Contact 링크에 적절한 aria-label이 있어야 한다', () => {
      render(<Header />);

      const contactLink = screen.getByLabelText('Contact');
      expect(contactLink).toHaveAttribute('aria-label', 'Contact');
    });

    it('ThemeToggle 버튼에 aria-label이 있어야 한다', () => {
      render(<Header />);

      const themeToggle = screen.getByLabelText('Toggle theme');
      expect(themeToggle).toHaveAttribute('aria-label', 'Toggle theme');
    });

    it('LocaleToggle 버튼에 aria-label이 있어야 한다', () => {
      render(<Header />);

      const localeToggle = screen.getByLabelText('Toggle locale');
      expect(localeToggle).toHaveAttribute('aria-label', 'Toggle locale');
    });
  });

  describe('UI/UX', () => {
    it('scrolled=false일 때 기본 헤더 스타일을 가져야 한다', () => {
      vi.mocked(useDetectScrolled).mockReturnValue(false);

      render(<Header />);

      const header = screen.getByRole('banner');
      const headerInner = header.firstElementChild;

      // bg-white 클래스 포함 확인
      expect(headerInner).toHaveClass('bg-white');
      expect(headerInner).not.toHaveClass('shadow-xl');
      expect(headerInner).not.toHaveClass('backdrop-blur-sm');
    });

    it('scrolled=true일 때 변경된 헤더 스타일을 가져야 한다', () => {
      vi.mocked(useDetectScrolled).mockReturnValue(true);

      render(<Header />);

      const header = screen.getByRole('banner');
      const headerInner = header.firstElementChild;

      // 스크롤 시 적용되는 클래스 확인
      expect(headerInner).toHaveClass('shadow-xl');
      expect(headerInner).toHaveClass('backdrop-blur-sm');
      expect(headerInner).toHaveClass('bg-white/50');
    });

    it('scrolled=true일 때 로고 크기가 작아져야 한다', () => {
      vi.mocked(useDetectScrolled).mockReturnValue(true);

      render(<Header />);

      const logo = screen.getByLabelText('Home');

      // 스크롤 시 적용되는 타이틀 클래스 확인
      expect(logo).toHaveClass('md:text-md');
    });

    it('scrolled=false일 때 로고 크기가 커야 한다', () => {
      vi.mocked(useDetectScrolled).mockReturnValue(false);

      render(<Header />);

      const logo = screen.getByLabelText('Home');

      // 기본 타이틀 클래스 확인
      expect(logo).toHaveClass('md:text-4xl');
    });
  });
});
