import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/5-shared/components/ui/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import PostCard from './post-card';

const mockProps = {
  title: '테스트 포스트',
  path: ['2024', 'test-post'],
  createdAt: new Date('2024-03-15'),
  tags: ['개발', 'React'],
  published: true,
  locale: 'ko' as const,
  index: 1,
};

describe('PostCard', () => {
  it('제목이 렌더링되어야 한다', () => {
    render(<PostCard {...mockProps} />);
    expect(screen.getByText('테스트 포스트')).toBeInTheDocument();
  });

  it('태그가 표시되어야 한다', () => {
    render(<PostCard {...mockProps} />);
    expect(screen.getByText('개발 · React')).toBeInTheDocument();
  });

  it('날짜가 yyyy.MM 형식으로 표시되어야 한다', () => {
    render(<PostCard {...mockProps} />);
    expect(screen.getByText('2024.03')).toBeInTheDocument();
  });

  it('번호가 두 자리로 표시되어야 한다', () => {
    render(<PostCard {...mockProps} />);
    expect(screen.getByText('01')).toBeInTheDocument();
  });
});
