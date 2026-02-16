/**
 * RecentPostBlock 컴포넌트 테스트
 * 
 * 검증 항목:
 * 1. 기본 렌더링: 제목, 3개 포스트 (첫 번째 PostBasicCard, 나머지 PostSimpleCard)
 * 2. 반응형 레이아웃: flex flex-col gap-4 클래스, grid 레이아웃 클래스
 * 3. 카드 통일성: article 태그, border/rounded-lg 클래스
 * 4. 빈 포스트 처리: fallback UI, "포스트가 없습니다" 메시지
 * 5. 스켈레톤: 동일한 레이아웃 구조, 3개 박스, animate-pulse
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecentPostBlock, { RecentPostBlockSkeleton } from './recent-post-block';
import { PagingPosts } from '../model/post.schema';

// i18next mock
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'post.recentPosts': '최근 포스트',
        'post.noPosts': '포스트가 없습니다',
        'post.readMore': 'Read More',
      };
      return translations[key] || key;
    },
  }),
}));

// OptimizedImage mock
vi.mock('@/5-shared/components/ui/optimized-image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));

// Link mock
vi.mock('@/5-shared/components/ui/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('RecentPostBlock', () => {
  const mockPosts: PagingPosts = {
    posts: [
      {
        title: 'First Post',
        summary: 'First post summary',
        createdAt: new Date('2024-01-01'),
        path: ['category', 'first-post'],
        thumbnail: '/images/first.png',
        tags: ['tag1'],
        published: true,
      },
      {
        title: 'Second Post',
        summary: 'Second post summary',
        createdAt: new Date('2024-01-02'),
        path: ['category', 'second-post'],
        tags: ['tag2'],
        published: true,
      },
      {
        title: 'Third Post',
        summary: 'Third post summary',
        createdAt: new Date('2024-01-03'),
        path: ['category', 'third-post'],
        tags: ['tag3'],
        published: true,
      },
    ],
    total: 3,
    page: 1,
    size: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('제목 "최근 포스트"가 렌더링된다', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      render(<RecentPostBlock locale="ko" postsPromise={postsPromise} />);

      const heading = await screen.findByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('최근 포스트');
    });

    it('3개의 포스트 카드가 렌더링된다', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      render(<RecentPostBlock locale="ko" postsPromise={postsPromise} />);

      const articles = await screen.findAllByRole('article');
      expect(articles).toHaveLength(3);
    });

    it('첫 번째 포스트는 PostBasicCard로 렌더링된다 (썸네일 포함)', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      render(<RecentPostBlock locale="ko" postsPromise={postsPromise} />);

      // PostBasicCard는 OptimizedImage를 포함함
      const firstPostImage = await screen.findByAltText('First Post');
      expect(firstPostImage).toBeInTheDocument();
      expect(firstPostImage).toHaveAttribute('src', '/images/first.png');
    });

    it('나머지 포스트는 PostSimpleCard로 렌더링된다 (썸네일 없음)', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      render(<RecentPostBlock locale="ko" postsPromise={postsPromise} />);

      // PostSimpleCard는 썸네일이 없음
      await screen.findByText('First Post');
      
      const secondPostImage = screen.queryByAltText('Second Post');
      const thirdPostImage = screen.queryByAltText('Third Post');
      
      expect(secondPostImage).not.toBeInTheDocument();
      expect(thirdPostImage).not.toBeInTheDocument();
    });

    it('각 포스트의 title, summary, createdAt이 렌더링된다', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      render(<RecentPostBlock locale="ko" postsPromise={postsPromise} />);

      await screen.findByText('First Post');
      
      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.getByText('First post summary')).toBeInTheDocument();
      expect(screen.getByText('2024-01-01')).toBeInTheDocument();

      expect(screen.getByText('Second Post')).toBeInTheDocument();
      expect(screen.getByText('Second post summary')).toBeInTheDocument();
      expect(screen.getByText('2024-01-02')).toBeInTheDocument();

      expect(screen.getByText('Third Post')).toBeInTheDocument();
      expect(screen.getByText('Third post summary')).toBeInTheDocument();
      expect(screen.getByText('2024-01-03')).toBeInTheDocument();
    });

    it('각 포스트에 Read More 버튼이 렌더링된다', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      render(<RecentPostBlock locale="ko" postsPromise={postsPromise} />);

      await screen.findByText('First Post');
      
      const buttons = screen.getAllByText('Read More');
      expect(buttons).toHaveLength(3);
    });
  });

  describe('반응형 레이아웃', () => {
    it('포스트 컨테이너에 flex flex-col gap-4 클래스가 있다', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      const { container } = render(
        <RecentPostBlock locale="ko" postsPromise={postsPromise} />
      );

      await screen.findByText('First Post');
      
      const flexContainer = container.querySelector('.flex.flex-col.gap-4');
      expect(flexContainer).toBeInTheDocument();
    });

    it('첫 번째 포스트(PostBasicCard)는 grid 레이아웃을 가진다', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      const { container } = render(
        <RecentPostBlock locale="ko" postsPromise={postsPromise} />
      );

      await screen.findByText('First Post');
      
      const articles = container.querySelectorAll('article');
      const firstArticle = articles[0];
      
      expect(firstArticle.className).toMatch(/grid-cols-12/);
    });

    it('나머지 포스트(PostSimpleCard)는 grid 레이아웃을 가진다', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      const { container } = render(
        <RecentPostBlock locale="ko" postsPromise={postsPromise} />
      );

      await screen.findByText('First Post');
      
      const articles = container.querySelectorAll('article');
      const secondArticle = articles[1];
      const thirdArticle = articles[2];
      
      expect(secondArticle.className).toMatch(/grid-cols-12/);
      expect(thirdArticle.className).toMatch(/grid-cols-12/);
    });
  });

  describe('카드 통일성', () => {
    it('모든 카드가 article 태그로 렌더링된다', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      render(<RecentPostBlock locale="ko" postsPromise={postsPromise} />);

      const articles = await screen.findAllByRole('article');
      expect(articles).toHaveLength(3);
      
      articles.forEach((article) => {
        expect(article.tagName).toBe('ARTICLE');
      });
    });

    it('모든 카드가 border와 rounded-lg 클래스를 가진다', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      const { container } = render(
        <RecentPostBlock locale="ko" postsPromise={postsPromise} />
      );

      await screen.findByText('First Post');
      
      const articles = container.querySelectorAll('article');
      
      articles.forEach((article) => {
        expect(article.className).toMatch(/border/);
        expect(article.className).toMatch(/rounded-lg/);
      });
    });
  });

  describe('빈 포스트 처리', () => {
    it('posts가 빈 배열일 때 fallback UI가 렌더링된다', async () => {
      const emptyPosts: PagingPosts = {
        posts: [],
        total: 0,
        page: 1,
        size: 3,
      };
      const postsPromise = Promise.resolve(emptyPosts);
      
      render(<RecentPostBlock locale="ko" postsPromise={postsPromise} />);

      const message = await screen.findByText('포스트가 없습니다');
      expect(message).toBeInTheDocument();
    });

    it('빈 포스트일 때 제목은 렌더링되지만 포스트 카드는 렌더링되지 않는다', async () => {
      const emptyPosts: PagingPosts = {
        posts: [],
        total: 0,
        page: 1,
        size: 3,
      };
      const postsPromise = Promise.resolve(emptyPosts);
      
      render(<RecentPostBlock locale="ko" postsPromise={postsPromise} />);

      await screen.findByText('포스트가 없습니다');
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('최근 포스트');

      const articles = screen.queryAllByRole('article');
      expect(articles).toHaveLength(0);
    });

    it('posts가 undefined일 때 fallback UI가 렌더링된다', async () => {
      const nullPosts: PagingPosts = {
        posts: undefined as any,
        total: 0,
        page: 1,
        size: 3,
      };
      const postsPromise = Promise.resolve(nullPosts);
      
      render(<RecentPostBlock locale="ko" postsPromise={postsPromise} />);

      const message = await screen.findByText('포스트가 없습니다');
      expect(message).toBeInTheDocument();
    });
  });
});

describe('RecentPostBlockSkeleton', () => {
  it('제목 "최근 포스트"가 렌더링된다', () => {
    render(<RecentPostBlockSkeleton />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('최근 포스트');
  });

  it('3개의 스켈레톤 박스가 렌더링된다', () => {
    const { container } = render(<RecentPostBlockSkeleton />);

    const skeletonBoxes = container.querySelectorAll('.animate-pulse');
    expect(skeletonBoxes).toHaveLength(3);
  });

  it('첫 번째 스켈레톤은 h-48 클래스를 가진다', () => {
    const { container } = render(<RecentPostBlockSkeleton />);

    const skeletonBoxes = container.querySelectorAll('.animate-pulse');
    const firstBox = skeletonBoxes[0];
    
    expect(firstBox.className).toMatch(/h-48/);
  });

  it('나머지 스켈레톤은 h-24 클래스를 가진다', () => {
    const { container } = render(<RecentPostBlockSkeleton />);

    const skeletonBoxes = container.querySelectorAll('.animate-pulse');
    const secondBox = skeletonBoxes[1];
    const thirdBox = skeletonBoxes[2];
    
    expect(secondBox.className).toMatch(/h-24/);
    expect(thirdBox.className).toMatch(/h-24/);
  });

  it('스켈레톤 컨테이너에 flex flex-col gap-4 클래스가 있다', () => {
    const { container } = render(<RecentPostBlockSkeleton />);

    const flexContainer = container.querySelector('.flex.flex-col.gap-4');
    expect(flexContainer).toBeInTheDocument();
  });

  it('모든 스켈레톤에 animate-pulse 클래스가 있다', () => {
    const { container } = render(<RecentPostBlockSkeleton />);

    const skeletonBoxes = container.querySelectorAll('.animate-pulse');
    
    skeletonBoxes.forEach((box) => {
      expect(box.className).toMatch(/animate-pulse/);
    });
  });

  it('모든 스켈레톤에 rounded-lg 클래스가 있다', () => {
    const { container } = render(<RecentPostBlockSkeleton />);

    const skeletonBoxes = container.querySelectorAll('.animate-pulse');
    
    skeletonBoxes.forEach((box) => {
      expect(box.className).toMatch(/rounded-lg/);
    });
  });
});
