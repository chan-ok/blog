import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
  createRoute,
} from '@tanstack/react-router';
import fc from 'fast-check';

import Link from '.';
import { useLocaleStore } from '@/5-shared/stores/locale-store';
import type { LocaleType } from '@/5-shared/types/common.schema';

/**
 * ============================================================================
 * Link 컴포넌트 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * TanStack Router 통합 Link 컴포넌트의 locale 자동 추가 및 외부 링크 처리를 검증합니다.
 *
 * ## 테스트 종류
 * 1. Unit 테스트: 특정 시나리오에 대한 구체적인 동작 검증
 * 2. Property-Based 테스트: 다양한 경로/locale 조합에 대한 속성 검증
 *
 * ## 검증 항목
 * - locale 자동 추가 (`/about` → `/ko/about`)
 * - 이미 locale이 있는 경로는 그대로 유지 (`/ko/about`)
 * - 외부 링크는 locale 추가 안 함 (`https://example.com`)
 * - 다양한 locale 지원 (ko, en, ja)
 * - className, children props 전달
 */

// ============================================================================
// 테스트 유틸리티: TanStack Router Provider 래퍼
// ============================================================================

/**
 * TanStack Router 환경에서 컴포넌트를 렌더링하는 헬퍼 함수
 *
 * @param ui - 렌더링할 React 요소
 * @returns render 함수의 반환값
 */
async function renderWithRouter(ui: React.ReactElement) {
  // 루트 라우트 생성
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

  // 메모리 히스토리 생성 (테스트 환경용)
  const history = createMemoryHistory({
    initialEntries: ['/'],
  });

  // 라우터 생성
  const router = createRouter({
    routeTree,
    history,
  });

  // 라우터를 load하여 초기화 완료 대기
  let result;
  await act(async () => {
    result = render(<RouterProvider router={router} />);
    // 라우터 초기화 완료 대기
    await router.load();
  });

  return result!;
}

// ============================================================================
// Property-Based 테스트를 위한 데이터 생성기 (Arbitraries)
// ============================================================================

/**
 * locale 생성기
 */
const localeArb = fc.constantFrom<LocaleType>('ko', 'en', 'ja');

/**
 * 외부 링크 생성기
 */
const externalLinkArb = fc.constantFrom(
  'https://example.com',
  'http://example.com',
  'https://github.com/user/repo',
  'http://localhost:3000'
);

// ============================================================================
// Property 1: Locale 자동 추가 테스트
// ============================================================================

/**
 * **Feature: link-component, Property 1: Locale 자동 추가**
 *
 * ## 테스트 목적
 * 내부 경로에 locale이 자동으로 추가되는지 검증합니다.
 *
 * ## 검증 규칙
 * - `/about` → `/ko/about` (locale이 없으면 추가)
 * - `/` → `/ko` (루트 경로)
 * - `about` → `/ko/about` (슬래시 없으면 추가)
 */
describe('Property 1: Locale 자동 추가', () => {
  beforeEach(() => {
    // 각 테스트 전에 locale을 ko로 초기화
    useLocaleStore.setState({ locale: 'ko' });
  });

  it(
    'should add locale to internal paths without locale',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('/', '/about', '/posts', 'contact'),
          async (path) => {
            const { unmount } = await renderWithRouter(
              <Link href={path}>Unique Link Text</Link>
            );

            const link = screen.getByRole('link', { name: 'Unique Link Text' });
            const href = link.getAttribute('href');

            // locale이 추가되어야 함
            expect(href).toMatch(/^\/ko/);

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    },
    10000
  );
});

// ============================================================================
// Property 2: 이미 locale이 있는 경로는 그대로 유지
// ============================================================================

/**
 * **Feature: link-component, Property 2: Locale 중복 방지**
 *
 * ## 테스트 목적
 * 이미 locale이 포함된 경로는 중복으로 추가되지 않는지 검증합니다.
 *
 * ## 검증 규칙
 * - `/ko/about` → `/ko/about` (중복 추가 안 됨)
 * - `/en/posts` → `/en/posts` (다른 locale도 유지)
 */
describe('Property 2: Locale 중복 방지', () => {
  it('should not add locale if path already has locale', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('/ko/about', '/en/posts', '/ja/contact'),
        async (path) => {
          const { unmount } = await renderWithRouter(
            <Link href={path}>Localized Link</Link>
          );

          const link = screen.getByRole('link', { name: 'Localized Link' });
          const href = link.getAttribute('href');

          // 원래 경로와 동일해야 함 (중복 추가 안 됨)
          expect(href).toBe(path);

          unmount();
        }
      ),
      { numRuns: 30 }
    );
  });
});

// ============================================================================
// Property 3: 외부 링크는 locale 추가 안 함
// ============================================================================

/**
 * **Feature: link-component, Property 3: 외부 링크 처리**
 *
 * ## 테스트 목적
 * 외부 링크(http/https)는 locale이 추가되지 않는지 검증합니다.
 *
 * ## 검증 규칙
 * - `https://example.com` → `https://example.com` (변경 없음)
 * - `http://localhost:3000` → `http://localhost:3000` (변경 없음)
 */
describe('Property 3: 외부 링크 처리', () => {
  it('should not add locale to external links', async () => {
    await fc.assert(
      fc.asyncProperty(externalLinkArb, async (href) => {
        const { unmount } = await renderWithRouter(
          <Link href={href}>External Link Unique</Link>
        );

        const link = screen.getByRole('link', { name: 'External Link Unique' });
        const actualHref = link.getAttribute('href');

        // 외부 링크는 변경되지 않아야 함
        expect(actualHref).toBe(href);

        unmount();
      }),
      { numRuns: 30 }
    );
  });
});

// ============================================================================
// Property 4: 다양한 locale에서 정상 동작
// ============================================================================

/**
 * **Feature: link-component, Property 4: 다국어 지원**
 *
 * ## 테스트 목적
 * 모든 locale(ko, en, ja)에서 경로가 올바르게 변환되는지 검증합니다.
 */
describe('Property 4: 다국어 지원', () => {
  it('should add correct locale for all supported locales', async () => {
    await fc.assert(
      fc.asyncProperty(
        localeArb,
        fc.constantFrom('/about', '/posts', '/'),
        async (locale, path) => {
          // locale 설정
          useLocaleStore.setState({ locale });

          const { unmount } = await renderWithRouter(
            <Link href={path}>Multilingual Link</Link>
          );

          const link = screen.getByRole('link', { name: 'Multilingual Link' });
          const href = link.getAttribute('href');

          // 현재 locale이 추가되어야 함
          expect(href).toMatch(new RegExp(`^/${locale}`));

          unmount();
        }
      ),
      { numRuns: 30 }
    );
  });
});

// ============================================================================
// Unit 테스트: 기본 기능 검증
// ============================================================================

describe('Link Component - Unit Tests', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' });
  });

  /**
   * children 렌더링 테스트
   */
  it('renders children correctly', async () => {
    await renderWithRouter(<Link href="/about">About Page</Link>);

    expect(screen.getByRole('link', { name: 'About Page' })).toHaveTextContent(
      'About Page'
    );
  });

  /**
   * className props 전달 테스트
   */
  it('passes className to the link element', async () => {
    await renderWithRouter(
      <Link href="/about" className="custom-link-class">
        About
      </Link>
    );

    const link = screen.getByRole('link', { name: 'About' });
    expect(link).toHaveClass('custom-link-class');
  });

  /**
   * 루트 경로 테스트
   */
  it('converts root path to localized root', async () => {
    await renderWithRouter(<Link href="/">Home</Link>);

    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '/ko');
  });

  /**
   * 슬래시로 시작하는 경로 테스트
   */
  it('adds locale to paths starting with slash', async () => {
    await renderWithRouter(<Link href="/about">About</Link>);

    const link = screen.getByRole('link', { name: 'About' });
    expect(link).toHaveAttribute('href', '/ko/about');
  });

  /**
   * 슬래시로 시작하지 않는 경로 테스트
   */
  it('adds locale and slash to paths not starting with slash', async () => {
    await renderWithRouter(<Link href="about">About No Slash</Link>);

    const link = screen.getByRole('link', { name: 'About No Slash' });
    expect(link).toHaveAttribute('href', '/ko/about');
  });

  /**
   * 외부 링크 (https) 테스트
   */
  it('does not modify external https links', async () => {
    await renderWithRouter(<Link href="https://example.com">External</Link>);

    const link = screen.getByRole('link', { name: 'External' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  /**
   * 외부 링크 (http) 테스트
   */
  it('does not modify external http links', async () => {
    await renderWithRouter(
      <Link href="http://example.com">External HTTP</Link>
    );

    const link = screen.getByRole('link', { name: 'External HTTP' });
    expect(link).toHaveAttribute('href', 'http://example.com');
  });

  /**
   * 이미 locale이 있는 경로 테스트 (ko)
   */
  it('does not add locale to paths already containing ko locale', async () => {
    await renderWithRouter(<Link href="/ko/about">About KO</Link>);

    const link = screen.getByRole('link', { name: 'About KO' });
    expect(link).toHaveAttribute('href', '/ko/about');
  });

  /**
   * 이미 locale이 있는 경로 테스트 (en)
   */
  it('does not add locale to paths already containing en locale', async () => {
    await renderWithRouter(<Link href="/en/posts">Posts EN</Link>);

    const link = screen.getByRole('link', { name: 'Posts EN' });
    expect(link).toHaveAttribute('href', '/en/posts');
  });

  /**
   * 이미 locale이 있는 경로 테스트 (ja)
   */
  it('does not add locale to paths already containing ja locale', async () => {
    await renderWithRouter(<Link href="/ja/contact">Contact JA</Link>);

    const link = screen.getByRole('link', { name: 'Contact JA' });
    expect(link).toHaveAttribute('href', '/ja/contact');
  });

  /**
   * locale 변경 시 정상 동작 테스트 (en)
   */
  it('uses current locale from store (en)', async () => {
    useLocaleStore.setState({ locale: 'en' });

    await renderWithRouter(<Link href="/about">About EN Store</Link>);

    const link = screen.getByRole('link', { name: 'About EN Store' });
    expect(link).toHaveAttribute('href', '/en/about');
  });

  /**
   * locale 변경 시 정상 동작 테스트 (ja)
   */
  it('uses current locale from store (ja)', async () => {
    useLocaleStore.setState({ locale: 'ja' });

    await renderWithRouter(<Link href="/posts">Posts JA Store</Link>);

    const link = screen.getByRole('link', { name: 'Posts JA Store' });
    expect(link).toHaveAttribute('href', '/ja/posts');
  });
});
