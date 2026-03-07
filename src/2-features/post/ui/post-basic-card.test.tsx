import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
  createRoute,
} from '@tanstack/react-router';
import fc from 'fast-check';

import PostBasicCard from './post-basic-card';

/**
 * ============================================================================
 * PostBasicCard 컴포넌트 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * 포스트 기본 카드 컴포넌트의 렌더링 및 태그 표시를 검증합니다.
 *
 * ## 검증 항목
 * 1. 기본 렌더링 (제목, 날짜, 썸네일, 버튼)
 * 2. 태그가 있을 때 태그 칩이 렌더링됨
 * 3. 태그가 없을 때 태그 칩이 렌더링되지 않음
 * 4. 여러 태그가 모두 표시됨
 */

// ============================================================================
// 테스트 유틸리티
// ============================================================================

/**
 * TanStack Router 환경에서 컴포넌트를 렌더링하는 헬퍼 함수
 */
async function renderWithRouter(ui: React.ReactElement) {
  cleanup();

  const rootRoute = createRootRoute({
    component: () => ui,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => ui,
  });

  const routeTree = rootRoute.addChildren([indexRoute]);

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

  const result = render(<RouterProvider router={router} />);

  await screen.findByRole('article');

  return result;
}

// ============================================================================
// Unit 테스트
// ============================================================================

describe('PostBasicCard - Unit 테스트', () => {
  it('기본 요소들이 올바르게 렌더링되어야 한다', async () => {
    await renderWithRouter(
      <PostBasicCard
        title="테스트 포스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'test-post']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    expect(screen.getByText('테스트 포스트')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
  });

  it('태그가 있을 때 태그 칩이 렌더링되어야 한다', async () => {
    await renderWithRouter(
      <PostBasicCard
        title="태그 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'tag-test']}
        tags={['react', 'typescript']}
        published={true}
        locale="ko"
      />
    );

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('태그가 없을 때 태그 칩이 렌더링되지 않아야 한다', async () => {
    await renderWithRouter(
      <PostBasicCard
        title="태그 없음 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'no-tags']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    // 태그 관련 요소가 없어야 함 (TagChip은 Link로 렌더링되므로)
    const links = screen.getAllByRole('link');
    // Read More 버튼 링크만 있어야 함
    expect(links.length).toBeGreaterThanOrEqual(1);
    // 태그 링크는 없어야 함
    const tagLinks = links.filter((link) =>
      link.getAttribute('href')?.includes('tags=')
    );
    expect(tagLinks.length).toBe(0);
  });

  it('여러 태그가 모두 표시되어야 한다', async () => {
    await renderWithRouter(
      <PostBasicCard
        title="다중 태그 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'multi-tags']}
        tags={['react', 'typescript', 'nextjs', 'tailwind']}
        published={true}
        locale="ko"
      />
    );

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
    expect(screen.getByText('nextjs')).toBeInTheDocument();
    expect(screen.getByText('tailwind')).toBeInTheDocument();
  });

  it('태그 칩이 날짜 아래에 표시되어야 한다', async () => {
    const { container } = await renderWithRouter(
      <PostBasicCard
        title="태그 위치 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'tag-position']}
        tags={['react']}
        published={true}
        locale="ko"
      />
    );

    const dateElement = screen.getByText('2024-01-15');
    const tagElement = screen.getByText('react');

    // DOM 순서상 날짜가 태그보다 앞에 있어야 함
    const dateIndex = Array.from(container.querySelectorAll('*')).indexOf(
      dateElement
    );
    const tagIndex = Array.from(container.querySelectorAll('*')).indexOf(
      tagElement
    );

    expect(tagIndex).toBeGreaterThan(dateIndex);
  });
});
