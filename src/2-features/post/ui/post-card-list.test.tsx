import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// PostCard 모킹 (Router 의존성 제거)
vi.mock('@/2-features/post/ui/post-card', () => ({
  default: ({ title }: { title: string }) => (
    <article data-testid="post-card">{title}</article>
  ),
}));

// useSuspenseQuery 모킹
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useSuspenseQuery: vi.fn(),
  };
});

// react-i18next 모킹
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

import { useSuspenseQuery } from '@tanstack/react-query';
import PostCardList from './post-card-list';

/**
 * ============================================================================
 * PostCardList 컴포넌트 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * 포스트 카드 목록 컴포넌트의 렌더링과 빈 상태 처리를 검증합니다.
 *
 * ## 검증 항목
 * 1. 포스트 목록이 렌더링되어야 한다
 * 2. 포스트가 없을 때 빈 상태 메시지가 표시되어야 한다
 * 3. 태그 필터가 queryKey에 포함되어야 한다
 */

const mockPost = {
  title: '테스트 포스트',
  path: ['2024', '01', 'test-post'],
  tags: [],
  createdAt: new Date('2024-01-15'),
  published: true,
};

describe('PostCardList - Unit 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('포스트 목록이 렌더링되어야 한다', () => {
    vi.mocked(useSuspenseQuery).mockReturnValue({
      data: {
        posts: [
          mockPost,
          {
            ...mockPost,
            title: '두 번째 포스트',
            path: ['2024', '01', 'second-post'],
          },
        ],
      },
    } as ReturnType<typeof useSuspenseQuery>);

    render(<PostCardList locale="ko" />);

    const cards = screen.getAllByTestId('post-card');
    expect(cards).toHaveLength(2);
    expect(screen.getByText('테스트 포스트')).toBeInTheDocument();
    expect(screen.getByText('두 번째 포스트')).toBeInTheDocument();
  });

  it('포스트가 없을 때 빈 상태 메시지가 표시되어야 한다', () => {
    vi.mocked(useSuspenseQuery).mockReturnValue({
      data: { posts: [] },
    } as ReturnType<typeof useSuspenseQuery>);

    render(<PostCardList locale="ko" />);

    expect(screen.getByText('post.noPosts')).toBeInTheDocument();
    expect(screen.queryByTestId('post-card')).not.toBeInTheDocument();
  });

  it('태그 필터가 전달되면 queryKey에 포함되어야 한다', () => {
    vi.mocked(useSuspenseQuery).mockReturnValue({
      data: { posts: [] },
    } as ReturnType<typeof useSuspenseQuery>);

    render(<PostCardList locale="ko" tags={['react', 'typescript']} />);

    expect(vi.mocked(useSuspenseQuery)).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['posts', 'ko', ['react', 'typescript']],
      })
    );
  });
});
