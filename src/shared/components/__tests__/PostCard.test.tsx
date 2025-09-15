import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import PostCard from '../PostCard';
import type { Post } from '../../types';

// 샘플 포스트 데이터
const samplePost: Post = {
  id: 1,
  slug: 'test-post',
  title: '테스트 포스트 제목',
  summary: '이것은 테스트 포스트의 요약입니다.',
  publishedAt: '2024-01-15',
  status: 'published',
  tags: ['React', 'TypeScript', '테스트'],
  viewCount: 150,
  readingTime: '5분',
};

describe('PostCard 컴포넌트', () => {
  let queryClient: QueryClient;

  const createWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('포스트 정보가 올바르게 렌더링되어야 한다', () => {
    render(<PostCard post={samplePost} />, { wrapper: createWrapper });

    expect(screen.getByText('테스트 포스트 제목')).toBeInTheDocument();
    expect(screen.getByText('이것은 테스트 포스트의 요약입니다.')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
    expect(screen.getByText('5분')).toBeInTheDocument();
    expect(screen.getByText('150회')).toBeInTheDocument();
  });

  it('태그들이 올바르게 렌더링되어야 한다', () => {
    render(<PostCard post={samplePost} />, { wrapper: createWrapper });

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('테스트')).toBeInTheDocument();
  });

  it('포스트 제목 링크가 올바른 경로를 가져야 한다', () => {
    render(<PostCard post={samplePost} />, { wrapper: createWrapper });

    const titleLink = screen.getByRole('link', { name: '테스트 포스트 제목' });
    expect(titleLink).toHaveAttribute('href', '/posts/test-post');
  });

  it('선택적 속성들이 없을 때도 올바르게 렌더링되어야 한다', () => {
    const minimalPost: Post = {
      id: 2,
      slug: 'minimal-post',
      title: '최소 포스트',
      summary: '최소한의 정보만 있는 포스트',
      publishedAt: '2024-01-10',
      status: 'published',
      tags: [],
    };

    render(<PostCard post={minimalPost} />, { wrapper: createWrapper });

    expect(screen.getByText('최소 포스트')).toBeInTheDocument();
    expect(screen.getByText('최소한의 정보만 있는 포스트')).toBeInTheDocument();
    expect(screen.getByText('2024-01-10')).toBeInTheDocument();

    // 선택적 속성들이 렌더링되지 않아야 함
    expect(screen.queryByText('회')).not.toBeInTheDocument();
    expect(screen.queryByText('분')).not.toBeInTheDocument();
  });

  it('draft 상태인 포스트가 올바르게 표시되어야 한다', () => {
    const draftPost: Post = {
      ...samplePost,
      status: 'draft',
    };

    render(<PostCard post={draftPost} />, { wrapper: createWrapper });

    expect(screen.getByText('임시저장')).toBeInTheDocument();
  });

  it('hover 효과를 위한 클래스가 적용되어야 한다', () => {
    const { container } = render(<PostCard post={samplePost} />, { wrapper: createWrapper });

    const postCard = container.firstChild as HTMLElement;
    expect(postCard).toHaveClass('hover:shadow-md');
    expect(postCard).toHaveClass('transition-shadow');
  });

  it('접근성을 위한 속성들이 올바르게 설정되어야 한다', () => {
    render(<PostCard post={samplePost} />, { wrapper: createWrapper });

    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();

    const titleLink = screen.getByRole('link', { name: '테스트 포스트 제목' });
    expect(titleLink).toBeInTheDocument();
  });
});