import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Route } from './index';

// useSearch: 페이지에서 tags 파싱에 사용. 단위 테스트에서는 라우터 없이 실행되므로 모킹
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useSearch: () => ({ tags: undefined }),
  };
});

// availableTags 로딩 모킹 (페이지에서 useSuspenseQuery 사용)
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useSuspenseQuery: (options: { queryKey: unknown[]; queryFn?: unknown }) => {
      if (
        Array.isArray(options.queryKey) &&
        options.queryKey[0] === 'availableTags'
      ) {
        return { data: [] as string[] };
      }
      return (
        actual.useSuspenseQuery as (typeof import('@tanstack/react-query'))['useSuspenseQuery']
      )(
        options as unknown as Parameters<
          (typeof import('@tanstack/react-query'))['useSuspenseQuery']
        >[0]
      );
    },
  };
});

// TagFilterBar 모킹 (Link가 RouterProvider 필요하므로)
vi.mock('@/2-features/post/ui/tag-filter-bar', () => ({
  default: () => <div data-testid="tag-filter-bar">Tag Filter Bar</div>,
}));

// PostCardList 및 PostCardListSkeleton 모킹
vi.mock('@/2-features/post/ui/post-card-list', () => ({
  default: ({ locale, tags = [] }: { locale: string; tags?: string[] }) => (
    <div
      data-testid="post-card-list"
      data-locale={locale}
      data-tags={tags.join(',')}
    >
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

  it('페이지 상단에 태그 필터 메뉴 바가 포함되어야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    expect(screen.getByTestId('tag-filter-bar')).toBeInTheDocument();
  });
});
