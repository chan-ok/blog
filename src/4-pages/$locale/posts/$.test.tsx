import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// MDComponent 모킹
vi.mock('@/1-entities/markdown', () => ({
  default: ({ path }: { path: string }) => (
    <div data-testid="md-component" data-path={path}>
      MDX Content for {path}
    </div>
  ),
}));

// Reply 모킹
vi.mock('@/5-shared/components/reply', () => ({
  default: ({ locale }: { locale: LocaleType }) => (
    <div data-testid="reply" data-locale={locale}>
      Reply Component
    </div>
  ),
}));

// TableOfContents 모킹
vi.mock('@/2-features/post/ui/table-of-contents', () => ({
  default: ({ headings }: { headings: any[] }) => (
    <div
      data-testid="table-of-contents"
      data-headings={JSON.stringify(headings)}
    >
      Table of Contents
    </div>
  ),
}));

// notFound 모킹 - 함수 선언을 바로 하지 않고 vi.fn()으로 생성
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    notFound: vi.fn(() => {
      const error = new Error('Not Found');
      error.name = 'NotFoundError';
      throw error;
    }),
  };
});

// Route import는 모킹 후에
import { Route } from './$';
import { notFound } from '@tanstack/react-router';

// useParams 모킹
const mockUseParams = vi.fn(() => ({ locale: 'ko', _splat: 'example-post' }));

describe('$locale/posts/$ 라우트 (포스트 상세)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ locale: 'ko', _splat: 'example-post' });
    // @ts-expect-error - 테스트를 위한 모킹
    Route.useParams = mockUseParams;
  });

  it('PostDetailPage가 MDComponent를 포함해야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    expect(screen.getByTestId('md-component')).toBeInTheDocument();
  });

  it('PostDetailPage가 Reply를 포함해야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    expect(screen.getByTestId('reply')).toBeInTheDocument();
  });

  it('PostDetailPage가 TableOfContents를 포함해야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    expect(screen.getByTestId('table-of-contents')).toBeInTheDocument();
  });

  it('MDComponent에 올바른 경로를 전달해야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    const mdComponent = screen.getByTestId('md-component');
    expect(mdComponent.getAttribute('data-path')).toBe('ko/example-post.mdx');
  });

  it('Reply에 올바른 locale을 전달해야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    const reply = screen.getByTestId('reply');
    expect(reply.getAttribute('data-locale')).toBe('ko');
  });

  it('_splat이 비어있으면 notFound를 호출해야 한다', () => {
    mockUseParams.mockReturnValue({ locale: 'ko', _splat: '' });

    const Component = Route.options.component as React.ComponentType;
    expect(() => render(<Component />)).toThrow('Not Found');
    expect(notFound).toHaveBeenCalled();
  });

  it('_splat이 공백만 있으면 notFound를 호출해야 한다', () => {
    mockUseParams.mockReturnValue({ locale: 'ko', _splat: '   ' });

    const Component = Route.options.component as React.ComponentType;
    expect(() => render(<Component />)).toThrow('Not Found');
    expect(notFound).toHaveBeenCalled();
  });

  it('다른 locale과 _splat 조합도 동작해야 한다', () => {
    mockUseParams.mockReturnValue({ locale: 'en', _splat: 'hello-world' });

    const Component = Route.options.component as React.ComponentType;
    render(<Component />);

    const mdComponent = screen.getByTestId('md-component');
    expect(mdComponent.getAttribute('data-path')).toBe('en/hello-world.mdx');

    const reply = screen.getByTestId('reply');
    expect(reply.getAttribute('data-locale')).toBe('en');
  });
});
