import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import EmptyState from '../EmptyState';

describe('EmptyState 컴포넌트', () => {
  const createWrapper = ({ children }: { children: ReactNode }) => {
    const history = createMemoryHistory({
      initialEntries: ['/'],
    });

    const router = createRouter({
      history,
      routeTree: {
        id: '__root__',
        path: '/',
        component: () => children,
      } as any,
    });

    return children;
  };

  it('기본 상태로 올바르게 렌더링되어야 한다', () => {
    render(
      <EmptyState
        title="데이터가 없습니다"
        description="표시할 데이터가 없습니다."
      />,
      { wrapper: createWrapper }
    );

    expect(screen.getByText('📝')).toBeInTheDocument(); // 기본 아이콘
    expect(screen.getByText('데이터가 없습니다')).toBeInTheDocument();
    expect(screen.getByText('표시할 데이터가 없습니다.')).toBeInTheDocument();
  });

  it('커스텀 아이콘이 올바르게 표시되어야 한다', () => {
    render(
      <EmptyState
        icon="🔍"
        title="검색 결과 없음"
        description="검색 결과가 없습니다."
      />,
      { wrapper: createWrapper }
    );

    expect(screen.getByText('🔍')).toBeInTheDocument();
    expect(screen.queryByText('📝')).not.toBeInTheDocument();
  });

  it('액션 버튼이 있을 때 올바르게 렌더링되어야 한다', () => {
    render(
      <EmptyState
        title="글이 없습니다"
        description="첫 번째 글을 작성해보세요."
        actionText="글 작성하기"
        actionHref="/admin/write"
      />,
      { wrapper: createWrapper }
    );

    const actionButton = screen.getByRole('link', { name: '글 작성하기' });
    expect(actionButton).toBeInTheDocument();
    expect(actionButton).toHaveAttribute('href', '/admin/write');
  });

  it('액션 버튼이 없을 때 렌더링되지 않아야 한다', () => {
    render(
      <EmptyState
        title="데이터가 없습니다"
        description="표시할 데이터가 없습니다."
      />,
      { wrapper: createWrapper }
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('actionText만 있고 actionHref가 없을 때 액션 버튼이 렌더링되지 않아야 한다', () => {
    render(
      <EmptyState
        title="데이터가 없습니다"
        description="표시할 데이터가 없습니다."
        actionText="액션"
      />,
      { wrapper: createWrapper }
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('액션')).not.toBeInTheDocument();
  });

  it('actionHref만 있고 actionText가 없을 때 액션 버튼이 렌더링되지 않아야 한다', () => {
    render(
      <EmptyState
        title="데이터가 없습니다"
        description="표시할 데이터가 없습니다."
        actionHref="/some-path"
      />,
      { wrapper: createWrapper }
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('커스텀 클래스명이 올바르게 적용되어야 한다', () => {
    const { container } = render(
      <EmptyState
        title="테스트"
        description="테스트 설명"
        className="custom-class"
      />,
      { wrapper: createWrapper }
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
    expect(wrapper).toHaveClass('text-center', 'py-12');
  });

  it('아이콘에 올바른 접근성 속성이 설정되어야 한다', () => {
    render(
      <EmptyState
        icon="🔍"
        title="검색 결과 없음"
        description="검색 결과가 없습니다."
      />,
      { wrapper: createWrapper }
    );

    const icon = screen.getByText('🔍');
    expect(icon).toHaveAttribute('role', 'img');
    expect(icon).toHaveAttribute('aria-label', '검색 결과 없음');
  });

  it('제목과 설명의 스타일링이 올바르게 적용되어야 한다', () => {
    render(
      <EmptyState
        title="테스트 제목"
        description="테스트 설명입니다."
      />,
      { wrapper: createWrapper }
    );

    const title = screen.getByText('테스트 제목');
    expect(title).toHaveClass('text-xl', 'font-semibold', 'text-gray-600', 'mb-2');

    const description = screen.getByText('테스트 설명입니다.');
    expect(description).toHaveClass('text-gray-500', 'mb-6', 'max-w-md', 'mx-auto');
  });

  it('액션 버튼의 스타일링이 올바르게 적용되어야 한다', () => {
    render(
      <EmptyState
        title="테스트"
        description="테스트 설명"
        actionText="테스트 액션"
        actionHref="/test"
      />,
      { wrapper: createWrapper }
    );

    const actionButton = screen.getByRole('link', { name: '테스트 액션' });
    expect(actionButton).toHaveClass(
      'inline-block',
      'px-6',
      'py-3',
      'bg-blue-500',
      'text-white',
      'rounded-lg',
      'hover:bg-blue-600',
      'transition-colors'
    );
  });

  it('아이콘 크기가 올바르게 설정되어야 한다', () => {
    render(
      <EmptyState
        title="테스트"
        description="테스트 설명"
      />,
      { wrapper: createWrapper }
    );

    const icon = screen.getByText('📝');
    expect(icon).toHaveClass('text-6xl', 'mb-4');
  });

  it('레이아웃 구조가 올바르게 설정되어야 한다', () => {
    const { container } = render(
      <EmptyState
        title="테스트"
        description="테스트 설명"
        actionText="액션"
        actionHref="/action"
      />,
      { wrapper: createWrapper }
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('text-center', 'py-12');

    // 제목이 h3 태그로 렌더링되는지 확인
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('테스트');
  });
});