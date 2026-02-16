import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Route } from './tag';

// PostBasicCard 모킹
vi.mock('@/2-features/post/ui/post-basic-card', () => ({
  default: ({ title, locale }: { title: string; locale: string }) => (
    <div data-testid="post-basic-card" data-title={title} data-locale={locale}>
      {title}
    </div>
  ),
}));

// PostCardListSkeleton 모킹
vi.mock('@/2-features/post/ui/post-card-list', () => ({
  PostCardListSkeleton: () => (
    <div data-testid="post-card-list-skeleton">Loading...</div>
  ),
}));

// parseLocale 모킹
vi.mock('@/5-shared/types/common.schema', () => ({
  parseLocale: (locale: string) => locale,
}));

// react-i18next 모킹
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'post.noPosts': 'No posts found.',
      };
      return translations[key] || key;
    },
  }),
}));

// useSuspenseQuery 모킹
const mockUseSuspenseQuery = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useSuspenseQuery: (...args: unknown[]) => mockUseSuspenseQuery(...args),
}));

// useParams 모킹
const mockUseParams = vi.fn(() => ({ locale: 'ko' }));

describe('$locale/tag 라우트 (태그 페이지)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ locale: 'ko' });
    // @ts-expect-error - 테스트를 위한 모킹
    Route.useParams = mockUseParams;

    // 기본 useSuspenseQuery 모킹: tags와 posts
    mockUseSuspenseQuery.mockImplementation(
      ({ queryKey }: { queryKey: string[] }) => {
        if (queryKey[0] === 'tags') {
          return { data: ['AI', 'React', 'TypeScript'] };
        }
        return {
          data: {
            posts: [
              {
                title: 'Test Post',
                path: ['test', 'post'],
                tags: ['AI'],
                createdAt: new Date('2024-01-01'),
                published: true,
              },
            ],
            total: 1,
            page: 0,
            size: 100,
          },
        };
      }
    );
  });

  it('태그 목록이 렌더링되어야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('포스트 카드가 렌더링되어야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    expect(screen.getByTestId('post-basic-card')).toBeInTheDocument();
  });
});
