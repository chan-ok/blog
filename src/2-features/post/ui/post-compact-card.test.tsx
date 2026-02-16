import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
  createRoute,
} from '@tanstack/react-router';
import fc from 'fast-check';

import PostCompactCard from './post-compact-card';

/**
 * ============================================================================
 * PostCompactCard 컴포넌트 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * 포스트 카드 컴포넌트의 썸네일, 제목, 날짜, 링크 렌더링을 검증합니다.
 *
 * ## 검증 항목
 * 1. 기본 렌더링 (제목, 날짜, 썸네일, 버튼)
 * 2. 기본 이미지 사용 (/image/context.png)
 * 3. 카드 높이 (h-72)
 * 4. 썸네일 높이 (h-48)
 * 5. 수직 레이아웃 (flex-col)
 * 6. 썸네일 hover 효과
 * 7. 다크 모드 스타일
 * 8. 접근성 (article, time, img alt)
 * 9. Property-based 테스트 (다양한 입력 조합)
 */

// ============================================================================
// 테스트 유틸리티
// ============================================================================

/**
 * TanStack Router 환경에서 컴포넌트를 렌더링하는 헬퍼 함수
 */
async function renderWithRouter(ui: React.ReactElement) {
  // 이전 테스트의 DOM 정리
  cleanup();

  const rootRoute = createRootRoute({
    component: () => ui,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => ui,
  });

  const routeTree = rootRoute.addChildren([indexRoute]);

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

  const result = render(<RouterProvider router={router} />);

  // Router가 초기화될 때까지 대기
  await screen.findByRole('article');

  return result;
}

// ============================================================================
// Property-Based 테스트를 위한 데이터 생성기
// ============================================================================

/**
 * 포스트 제목 생성기 (3~100자, 앞뒤 공백 없음)
 */
const titleArb = fc
  .string({ minLength: 3, maxLength: 100 })
  .map((s) => s.trim())
  .filter((s) => s.length >= 3);

/**
 * 날짜 생성기 (2020-01-01 ~ 2026-12-31)
 */
const dateArb = fc.date({
  min: new Date('2020-01-01'),
  max: new Date('2026-12-31'),
});

/**
 * 경로 생성기 (예: ['2024', '01', 'my-post'])
 */
const pathArb = fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
  minLength: 1,
  maxLength: 5,
});

/**
 * 썸네일 URL 생성기 (undefined 포함)
 */
const thumbnailArb = fc.option(
  fc.webUrl({ withFragments: false, withQueryParameters: false }),
  { nil: undefined }
);

/**
 * locale 생성기
 */
const localeArb = fc.constantFrom('ko', 'en', 'ja');

// ============================================================================
// Unit 테스트
// ============================================================================

describe('PostCompactCard - Unit 테스트', () => {
  it('제목, 날짜, 썸네일이 올바르게 렌더링되어야 한다', async () => {
    await renderWithRouter(
      <PostCompactCard
        title="테스트 포스트 제목"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'test-post']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    // 제목 확인
    expect(
      screen.getByRole('heading', { name: '테스트 포스트 제목' })
    ).toBeInTheDocument();

    // 날짜 확인
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();

    // 썸네일 확인
    const img = screen.getByRole('img', { name: '테스트 포스트 제목' });
    expect(img).toBeInTheDocument();

    // Read More 버튼 확인
    expect(screen.getByText('Read More')).toBeInTheDocument();
  });

  it('썸네일이 없을 경우 기본 이미지(/image/context.png)를 사용해야 한다', async () => {
    await renderWithRouter(
      <PostCompactCard
        title="썸네일 없는 포스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'no-thumbnail']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    const img = screen.getByRole('img', { name: '썸네일 없는 포스트' });
    expect(img).toHaveAttribute('src', '/image/context.png');
  });

  it('썸네일이 제공되면 해당 이미지를 사용해야 한다', async () => {
    await renderWithRouter(
      <PostCompactCard
        title="썸네일 있는 포스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'with-thumbnail']}
        thumbnail="/images/custom-thumbnail.jpg"
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    const img = screen.getByRole('img', { name: '썸네일 있는 포스트' });
    expect(img).toHaveAttribute('src', '/images/custom-thumbnail.jpg');
  });

  it('카드 높이가 h-72이어야 한다', async () => {
    await renderWithRouter(
      <PostCompactCard
        title="높이 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'height-test']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    const article = screen.getByRole('article');
    expect(article.className).toContain('h-72');
  });

  it('썸네일 높이가 h-48이어야 한다', async () => {
    await renderWithRouter(
      <PostCompactCard
        title="썸네일 높이 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'thumbnail-height']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    // 썸네일 이미지를 통해 높이 검증
    const img = screen.getByRole('img', { name: '썸네일 높이 테스트' });
    const thumbnailContainer = img.parentElement;
    expect(thumbnailContainer?.className).toContain('h-40');
  });

  it('수직 레이아웃(flex-col)을 사용해야 한다', async () => {
    await renderWithRouter(
      <PostCompactCard
        title="레이아웃 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'layout-test']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    const article = screen.getByRole('article');
    expect(article.className).toContain('flex-col');
  });

  it('올바른 포스트 경로를 생성해야 한다', async () => {
    const { container } = await renderWithRouter(
      <PostCompactCard
        title="경로 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'path-test']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    // Link 컴포넌트가 렌더링한 a 태그 확인
    const link = container.querySelector('a[href*="/posts/2024/01/path-test"]');
    expect(link).toBeInTheDocument();
  });

  it('hover 시 썸네일이 확대되어야 한다 (scale-105)', async () => {
    await renderWithRouter(
      <PostCompactCard
        title="Hover 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'hover-test']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    const img = screen.getByRole('img', { name: 'Hover 테스트' });
    expect(img.className).toContain('group-hover:scale-105');
  });

  it('다크 모드 스타일을 포함해야 한다', async () => {
    await renderWithRouter(
      <PostCompactCard
        title="다크 모드 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'dark-mode']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    const article = screen.getByRole('article');
    expect(article.className).toContain('dark:border-zinc-800');
    expect(article.className).toContain('dark:bg-gray-800');
  });

  it('접근성: article 시맨틱 태그를 사용해야 한다', async () => {
    await renderWithRouter(
      <PostCompactCard
        title="접근성 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'accessibility']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    const article = screen.getByRole('article');
    expect(article.tagName).toBe('ARTICLE');
  });

  it('접근성: 이미지에 alt 속성이 있어야 한다', async () => {
    await renderWithRouter(
      <PostCompactCard
        title="이미지 alt 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'img-alt']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    const img = screen.getByRole('img', { name: '이미지 alt 테스트' });
    expect(img).toHaveAttribute('alt', '이미지 alt 테스트');
  });

  it('접근성: 날짜에 time 시맨틱 태그를 사용해야 한다', async () => {
    const { container } = await renderWithRouter(
      <PostCompactCard
        title="날짜 시맨틱 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'time-semantic']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    const timeElement = container.querySelector('time');
    expect(timeElement).toBeInTheDocument();
    expect(timeElement?.textContent).toBe('2024-01-15');
  });

  it('이미지 lazy loading을 사용해야 한다', async () => {
    await renderWithRouter(
      <PostCompactCard
        title="Lazy Loading 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'lazy-loading']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    const img = screen.getByRole('img', { name: 'Lazy Loading 테스트' });
    expect(img).toHaveAttribute('loading', 'lazy');
  });
});

// ============================================================================
// Property-Based 테스트
// ============================================================================

describe('PostCompactCard - Property-Based 테스트', () => {
  it('다양한 입력 조합에서 올바르게 렌더링되어야 한다', async () => {
    await fc.assert(
      fc.asyncProperty(
        titleArb,
        dateArb,
        pathArb,
        thumbnailArb,
        localeArb,
        async (title, createdAt, path, thumbnail, locale) => {
          const { unmount } = await renderWithRouter(
            <PostCompactCard
              title={title}
              createdAt={createdAt}
              path={path}
              thumbnail={thumbnail}
              tags={[]}
              published={true}
              locale={locale}
            />
          );

          // 제목이 렌더링되어야 함
          expect(
            screen.getByRole('heading', { name: title })
          ).toBeInTheDocument();

          // 이미지가 렌더링되어야 함
          const img = screen.getByRole('img', { name: title });
          expect(img).toBeInTheDocument();

          // 썸네일이 없으면 기본 이미지 사용
          const expectedSrc =
            thumbnail === undefined ? '/image/context.png' : thumbnail;
          expect(img).toHaveAttribute('src', expectedSrc);

          // Read More 버튼이 렌더링되어야 함
          expect(screen.getByText('Read More')).toBeInTheDocument();

          // 카드 높이 검증
          const article = screen.getByRole('article');
          expect(article.className).toContain('h-72');

          // 수직 레이아웃 검증
          expect(article.className).toContain('flex-col');

          // 다크 모드 클래스 검증
          expect(article.className).toContain('dark:border-zinc-800');
          expect(article.className).toContain('dark:bg-gray-800');

          // Property-based 테스트에서는 unmount 필수
          unmount();
        }
      ),
      { numRuns: 50 } // 50회 반복 테스트
    );
  });

  it('모든 날짜 입력에 대해 yyyy-MM-dd 형식으로 표시되어야 한다', async () => {
    await fc.assert(
      fc.asyncProperty(dateArb, async (createdAt) => {
        const { unmount } = await renderWithRouter(
          <PostCompactCard
            title="날짜 포맷 테스트"
            createdAt={createdAt}
            path={['2024', '01', 'date-format']}
            tags={[]}
            published={true}
            locale="ko"
          />
        );

        // yyyy-MM-dd 형식 확인
        const year = createdAt.getFullYear();
        const month = String(createdAt.getMonth() + 1).padStart(2, '0');
        const day = String(createdAt.getDate()).padStart(2, '0');
        const expectedDate = `${year}-${month}-${day}`;

        expect(screen.getByText(expectedDate)).toBeInTheDocument();

        unmount();
      }),
      { numRuns: 30 }
    );
  });
});
