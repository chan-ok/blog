/**
 * RecentPostBlock 컴포넌트 테스트
 * 
 * 검증 항목:
 * 1. 기본 렌더링: 제목, 3개 포스트 (모든 카드가 PostCompactCard로 렌더링)
 * 2. 썸네일: 모든 카드에 썸네일(img) 포함, 기본 이미지 처리
 * 3. 반응형 레이아웃: grid grid-cols-1 md:grid-cols-3 클래스, 컴팩트한 높이 (h-40 md:h-36)
 * 4. 카드 통일성: article 태그, border/rounded-lg 클래스, hover 효과
 * 5. 빈 포스트 처리: fallback UI, "포스트가 없습니다" 메시지
 * 6. 스켈레톤: 동일한 레이아웃 구조, 3개 박스, 동일한 높이 (h-40 md:h-36), animate-pulse
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
        thumbnail: '/images/second.png',
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

    it('모든 포스트가 PostCompactCard로 렌더링된다 (동일한 레이아웃)', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      const { container } = render(
        <RecentPostBlock locale="ko" postsPromise={postsPromise} />
      );

      await screen.findByText('First Post');

      const articles = container.querySelectorAll('article');
      
      // 모든 카드가 동일한 높이 클래스를 가짐
      articles.forEach((article) => {
        expect(article.className).toMatch(/h-40/);
        expect(article.className).toMatch(/md:h-36/);
      });
    });

    it('각 포스트의 title, createdAt이 렌더링된다', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      render(<RecentPostBlock locale="ko" postsPromise={postsPromise} />);

      await screen.findByText('First Post');
      
      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.getByText('2024-01-01')).toBeInTheDocument();

      expect(screen.getByText('Second Post')).toBeInTheDocument();
      expect(screen.getByText('2024-01-02')).toBeInTheDocument();

      expect(screen.getByText('Third Post')).toBeInTheDocument();
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

  describe('썸네일 렌더링', () => {
    it('모든 카드에 썸네일 이미지가 포함된다', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      render(<RecentPostBlock locale="ko" postsPromise={postsPromise} />);

      await screen.findByText('First Post');

      const firstPostImage = screen.getByAltText('First Post');
      const secondPostImage = screen.getByAltText('Second Post');
      const thirdPostImage = screen.getByAltText('Third Post');

      expect(firstPostImage).toBeInTheDocument();
      expect(firstPostImage).toHaveAttribute('src', '/images/first.png');
      
      expect(secondPostImage).toBeInTheDocument();
      expect(secondPostImage).toHaveAttribute('src', '/images/second.png');
      
      expect(thirdPostImage).toBeInTheDocument();
      expect(thirdPostImage).toHaveAttribute('src', '/images/third.png');
    });

    it('썸네일이 없는 포스트는 기본 이미지를 사용한다', async () => {
      const postsWithoutThumbnail: PagingPosts = {
        posts: [
          {
            title: 'Post Without Thumbnail',
            summary: 'No thumbnail',
            createdAt: new Date('2024-01-01'),
            path: ['category', 'no-thumbnail'],
            tags: ['tag1'],
            published: true,
          },
        ],
        total: 1,
        page: 1,
        size: 1,
      };

      const postsPromise = Promise.resolve(postsWithoutThumbnail);
      render(<RecentPostBlock locale="ko" postsPromise={postsPromise} />);

      await screen.findByText('Post Without Thumbnail');

      const image = screen.getByAltText('Post Without Thumbnail');
      expect(image).toHaveAttribute('src', '/images/default-thumbnail.jpg');
    });
  });

  describe('반응형 레이아웃', () => {
    it('포스트 컨테이너에 grid grid-cols-1 md:grid-cols-3 클래스가 있다', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      const { container } = render(
        <RecentPostBlock locale="ko" postsPromise={postsPromise} />
      );

      await screen.findByText('First Post');
      
      const gridContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
      expect(gridContainer).toBeInTheDocument();
    });

    it('모든 카드가 컴팩트한 높이를 가진다 (h-40 md:h-36)', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      const { container } = render(
        <RecentPostBlock locale="ko" postsPromise={postsPromise} />
      );

      await screen.findByText('First Post');
      
      const articles = container.querySelectorAll('article');
      
      articles.forEach((article) => {
        expect(article.className).toMatch(/h-40/);
        expect(article.className).toMatch(/md:h-36/);
      });
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

    it('모든 카드가 hover 효과를 가진다', async () => {
      const postsPromise = Promise.resolve(mockPosts);
      const { container } = render(
        <RecentPostBlock locale="ko" postsPromise={postsPromise} />
      );

      await screen.findByText('First Post');
      
      const articles = container.querySelectorAll('article');
      
      articles.forEach((article) => {
        expect(article.className).toMatch(/hover:shadow-lg/);
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

  it('모든 스켈레톤이 동일한 높이를 가진다 (h-40 md:h-36)', () => {
    const { container } = render(<RecentPostBlockSkeleton />);

    const skeletonBoxes = container.querySelectorAll('.animate-pulse');
    
    skeletonBoxes.forEach((box) => {
      expect(box.className).toMatch(/h-40/);
      expect(box.className).toMatch(/md:h-36/);
    });
  });

  it('스켈레톤 컨테이너에 grid grid-cols-1 md:grid-cols-3 클래스가 있다', () => {
    const { container } = render(<RecentPostBlockSkeleton />);

    const gridContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
    expect(gridContainer).toBeInTheDocument();
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

  it('모든 스켈레톤에 gap-4 간격이 적용되어 있다', () => {
    const { container } = render(<RecentPostBlockSkeleton />);

    const gridContainer = container.querySelector('.grid');
    expect(gridContainer?.className).toMatch(/gap-4/);
  });
});
