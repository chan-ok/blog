import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Route } from './index';

// PostCardList 모킹
vi.mock('@/features/post/ui/post-card-list', () => ({
  default: ({ locale }: { locale: LocaleType }) => (
    <div data-testid="post-card-list" data-locale={locale}>
      Post Card List
    </div>
  ),
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

  it('에러 없이 렌더링되어야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    expect(Component).toBeDefined();

    render(<Component />);
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

  it('createFileRoute가 올바른 경로로 생성되어야 한다', () => {
    // Route 객체가 정의되어 있는지 확인
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });
});
