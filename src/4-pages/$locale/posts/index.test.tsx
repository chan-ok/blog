import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Route } from './index';

// PostCardList 및 PostCardListSkeleton 모킹
vi.mock('@/2-features/post/ui/post-card-list', () => ({
  default: ({ locale }: { locale: string }) => (
    <div data-testid="post-card-list" data-locale={locale}>
      Post Card List
    </div>
  ),
  PostCardListSkeleton: () => (
    <div data-testid="post-card-list-skeleton">Loading...</div>
  ),
}));

// parseLocale 모킹
vi.mock('@/5-shared/types/common.schema', () => ({
  parseLocale: (locale: string) => locale,
}));

// useParams 모킹
const mockUseParams = vi.fn(() => ({ locale: 'ko' }));

describe('$locale/posts/index 라우트 (포스트 목록)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ locale: 'ko' });
    // @ts-expect-error - 테스트를 위한 모킹
    Route.useParams = mockUseParams;
  });

  it('PostsPage가 PostCardList를 포함해야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    expect(screen.getByTestId('post-card-list')).toBeInTheDocument();
  });

  it('PostCardList에 올바른 locale을 전달해야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    const postCardList = screen.getByTestId('post-card-list');
    expect(postCardList.getAttribute('data-locale')).toBe('ko');
  });

  it('다른 locale에서도 동작해야 한다', () => {
    mockUseParams.mockReturnValue({ locale: 'en' });

    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    const postCardList = screen.getByTestId('post-card-list');
    expect(postCardList.getAttribute('data-locale')).toBe('en');
  });
});
