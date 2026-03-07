import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TagFilterBar from './tag-filter-bar';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'post.filterAll' ? '전체' : key),
    i18n: { language: 'ko' },
  }),
}));

// Link를 단순 <a>로 모킹해 href/children만 검증
vi.mock('@/5-shared/components/ui/link', () => ({
  default: ({
    href,
    children,
    'aria-current': ariaCurrent,
    className,
  }: {
    href: string;
    children?: React.ReactNode;
    'aria-current'?: React.AriaAttributes['aria-current'];
    className?: string;
  }) => (
    <a href={href} aria-current={ariaCurrent} className={className}>
      {children}
    </a>
  ),
}));

describe('TagFilterBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('"전체" 링크가 렌더링되어야 한다', () => {
    render(<TagFilterBar locale="ko" availableTags={[]} selectedTags={[]} />);
    const link = screen.getByRole('link', { name: '전체' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/ko/posts');
  });

  it('availableTags가 있으면 각 태그로 링크가 렌더링되어야 한다', () => {
    render(
      <TagFilterBar
        locale="ko"
        availableTags={['react', 'typescript']}
        selectedTags={[]}
      />
    );
    expect(screen.getByRole('link', { name: 'react' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'typescript' })
    ).toBeInTheDocument();
  });

  it('선택된 태그는 aria-current="true"로 표시되어야 한다', () => {
    render(
      <TagFilterBar
        locale="ko"
        availableTags={['react', 'typescript']}
        selectedTags={['react']}
      />
    );
    const reactLink = screen.getByRole('link', { name: 'react' });
    expect(reactLink).toHaveAttribute('aria-current', 'true');
    const tsLink = screen.getByRole('link', { name: 'typescript' });
    expect(tsLink).not.toHaveAttribute('aria-current');
  });

  it('태그 링크의 href가 해당 태그 필터 URL이어야 한다', () => {
    render(
      <TagFilterBar locale="en" availableTags={['nextjs']} selectedTags={[]} />
    );
    const link = screen.getByRole('link', { name: 'nextjs' });
    expect(link).toHaveAttribute('href', '/en/posts?tags=nextjs');
  });

  it('availableTags가 비어 있으면 "전체"만 렌더링되어야 한다', () => {
    render(<TagFilterBar locale="ko" availableTags={[]} selectedTags={[]} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent('전체');
  });
});
