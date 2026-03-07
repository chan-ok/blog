import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Route } from './index';

// Feature 컴포넌트 모킹
vi.mock('@/2-features/about/ui/about-block', () => ({
  default: () => <div data-testid="about-block">About Block</div>,
}));

vi.mock('@/2-features/post/ui/recent-post-block', () => ({
  default: () => <div data-testid="recent-post-block">Recent Post Block</div>,
  RecentPostBlockSkeleton: () => (
    <div data-testid="recent-post-skeleton">Loading...</div>
  ),
}));

// getPosts 모킹
vi.mock('@/2-features/post/util/get-posts', () => ({
  getPosts: vi.fn().mockResolvedValue([
    { id: '1', title: 'Post 1' },
    { id: '2', title: 'Post 2' },
    { id: '3', title: 'Post 3' },
  ]),
}));

// useParams, useLoaderData 모킹
const mockUseParams = vi.fn(() => ({ locale: 'ko' }));
const mockUseLoaderData = vi.fn(() => ({
  postsPromise: Promise.resolve([
    { id: '1', title: 'Post 1' },
    { id: '2', title: 'Post 2' },
    { id: '3', title: 'Post 3' },
  ]),
}));

describe('$locale/index 라우트 (홈 페이지)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ locale: 'ko' });
    mockUseLoaderData.mockReturnValue({
      postsPromise: Promise.resolve([
        { id: '1', title: 'Post 1' },
        { id: '2', title: 'Post 2' },
        { id: '3', title: 'Post 3' },
      ]),
    });

    // Route 메서드 모킹
    // @ts-expect-error - 테스트를 위한 모킹
    Route.useParams = mockUseParams;
    // @ts-expect-error - 테스트를 위한 모킹
    Route.useLoaderData = mockUseLoaderData;
  });

  it('HomePage가 AboutBlock을 포함해야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    expect(screen.getByTestId('about-block')).toBeInTheDocument();
  });

  it('HomePage가 RecentPostBlock을 포함해야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    expect(screen.getByTestId('recent-post-block')).toBeInTheDocument();
  });

  it('loader 함수가 getPosts를 호출해야 한다', async () => {
    const loader = Route.options.loader;
    expect(loader).toBeDefined();

    const { getPosts } = await import('@/2-features/post/util/get-posts');

    // TanStack Router loader 파라미터 타입 추출: as unknown as T는 as any보다 명시적
    type LoaderArgs = Parameters<NonNullable<typeof loader>>[0];
    const result = await loader?.({
      params: { locale: 'ko' },
    } as unknown as LoaderArgs);

    expect(getPosts).toHaveBeenCalledWith({ locale: 'ko', size: 3 });
    expect(result).toHaveProperty('postsPromise');
  });
});
