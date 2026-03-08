import { describe, it, expect } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import fc from 'fast-check';

import PostCard from './post-card';
import { renderWithRouter } from '@/5-shared/test-utils/render-with-router';

/**
 * ============================================================================
 * PostCard 컴포넌트 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * variant 패턴으로 통합된 포스트 카드 컴포넌트의 렌더링을 검증합니다.
 *
 * ## 검증 항목
 * [basic variant]
 * 1. 기본 렌더링 (제목, 날짜, 썸네일, 버튼)
 * 2. 태그가 있을 때 태그 칩이 렌더링됨
 * 3. 태그가 없을 때 태그 칩이 렌더링되지 않음
 * 4. 여러 태그가 모두 표시됨
 * 5. 태그 칩이 날짜 아래에 표시됨
 *
 * [compact variant]
 * 1. 제목, 날짜, 썸네일, 버튼이 올바르게 렌더링됨
 * 2. 썸네일이 없을 경우 기본 이미지(/image/context.png) 사용
 * 3. 썸네일이 있으면 해당 이미지 사용
 * 4. 올바른 포스트 경로 생성
 * 5. 다크 모드 스타일 포함
 * 6. 접근성: article, time, img alt
 * 7. 태그 렌더링
 * 8. Property-based 테스트 (다양한 입력 조합)
 */

// ============================================================================
// Property-Based 테스트를 위한 데이터 생성기
// ============================================================================

const titleArb = fc
  .string({ minLength: 3, maxLength: 100 })
  .map((s) => s.trim())
  .filter((s) => s.length >= 3);

const dateArb = fc.date({
  min: new Date('2020-01-01'),
  max: new Date('2026-12-31'),
  noInvalidDate: true,
});

const pathArb = fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
  minLength: 1,
  maxLength: 5,
});

const thumbnailArb = fc.option(
  fc.webUrl({ withFragments: false, withQueryParameters: false }),
  { nil: undefined }
);

const localeArb = fc.constantFrom('ko', 'en', 'ja');

// ============================================================================
// variant="basic" 테스트
// ============================================================================

describe('PostCard variant="basic" - Unit 테스트', () => {
  it('기본 요소들이 올바르게 렌더링되어야 한다', async () => {
    cleanup();
    await renderWithRouter(
      <PostCard
        variant="basic"
        title="테스트 포스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'test-post']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    expect(screen.getByText('테스트 포스트')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
  });

  it('태그가 있을 때 태그 칩이 렌더링되어야 한다', async () => {
    cleanup();
    await renderWithRouter(
      <PostCard
        variant="basic"
        title="태그 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'tag-test']}
        tags={['react', 'typescript']}
        published={true}
        locale="ko"
      />
    );

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('태그가 없을 때 태그 칩이 렌더링되지 않아야 한다', async () => {
    cleanup();
    await renderWithRouter(
      <PostCard
        variant="basic"
        title="태그 없음 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'no-tags']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    const tagLinks = document.querySelectorAll('a[href*="tags="]');
    expect(tagLinks.length).toBe(0);
  });

  it('여러 태그가 모두 표시되어야 한다', async () => {
    cleanup();
    await renderWithRouter(
      <PostCard
        variant="basic"
        title="다중 태그 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'multi-tags']}
        tags={['react', 'typescript', 'nextjs', 'tailwind']}
        published={true}
        locale="ko"
      />
    );

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
    expect(screen.getByText('nextjs')).toBeInTheDocument();
    expect(screen.getByText('tailwind')).toBeInTheDocument();
  });

  it('태그 칩이 날짜 아래에 표시되어야 한다', async () => {
    cleanup();
    const { container } = await renderWithRouter(
      <PostCard
        variant="basic"
        title="태그 위치 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'tag-position']}
        tags={['react']}
        published={true}
        locale="ko"
      />
    );

    const dateElement = screen.getByText('2024-01-15');
    const tagElement = screen.getByText('react');

    const dateIndex = Array.from(container.querySelectorAll('*')).indexOf(
      dateElement
    );
    const tagIndex = Array.from(container.querySelectorAll('*')).indexOf(
      tagElement
    );

    expect(tagIndex).toBeGreaterThan(dateIndex);
  });
});

// ============================================================================
// variant="compact" 테스트
// ============================================================================

describe('PostCard variant="compact" - Unit 테스트', () => {
  it('제목, 날짜, 썸네일이 올바르게 렌더링되어야 한다', async () => {
    cleanup();
    await renderWithRouter(
      <PostCard
        variant="compact"
        title="테스트 포스트 제목"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'test-post']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    expect(
      screen.getByRole('heading', { name: '테스트 포스트 제목' })
    ).toBeInTheDocument();
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
    const img = screen.getByRole('img', { name: '테스트 포스트 제목' });
    expect(img).toBeInTheDocument();
    expect(screen.getByText('Read More')).toBeInTheDocument();
  });

  it('썸네일이 없을 경우 기본 이미지(/image/context.png)를 사용해야 한다', async () => {
    cleanup();
    await renderWithRouter(
      <PostCard
        variant="compact"
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
    cleanup();
    await renderWithRouter(
      <PostCard
        variant="compact"
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

  it('올바른 포스트 경로를 생성해야 한다', async () => {
    cleanup();
    const { container } = await renderWithRouter(
      <PostCard
        variant="compact"
        title="경로 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'path-test']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    const link = container.querySelector('a[href*="/posts/2024/01/path-test"]');
    expect(link).toBeInTheDocument();
  });

  it('다크 모드 스타일을 포함해야 한다', async () => {
    cleanup();
    await renderWithRouter(
      <PostCard
        variant="compact"
        title="다크 모드 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'dark-mode']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    const article = screen.getByRole('article');
    expect(article.className).toMatch(/dark:/);
  });

  it('접근성: article 시맨틱 태그를 사용해야 한다', async () => {
    cleanup();
    await renderWithRouter(
      <PostCard
        variant="compact"
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

  it('접근성: 날짜에 time 시맨틱 태그를 사용해야 한다', async () => {
    cleanup();
    const { container } = await renderWithRouter(
      <PostCard
        variant="compact"
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
    cleanup();
    await renderWithRouter(
      <PostCard
        variant="compact"
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

  it('태그가 있을 때 태그 칩이 렌더링되어야 한다', async () => {
    cleanup();
    await renderWithRouter(
      <PostCard
        variant="compact"
        title="태그 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'tag-test']}
        tags={['react', 'typescript']}
        published={true}
        locale="ko"
      />
    );

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('태그가 없을 때 태그 칩이 렌더링되지 않아야 한다', async () => {
    cleanup();
    await renderWithRouter(
      <PostCard
        variant="compact"
        title="태그 없음 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'no-tags']}
        tags={[]}
        published={true}
        locale="ko"
      />
    );

    const tagLinks = document.querySelectorAll('a[href*="tags="]');
    expect(tagLinks.length).toBe(0);
  });

  it('여러 태그가 모두 표시되어야 한다', async () => {
    cleanup();
    await renderWithRouter(
      <PostCard
        variant="compact"
        title="다중 태그 테스트"
        createdAt={new Date('2024-01-15')}
        path={['2024', '01', 'multi-tags']}
        tags={['react', 'typescript', 'nextjs']}
        published={true}
        locale="ko"
      />
    );

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
    expect(screen.getByText('nextjs')).toBeInTheDocument();
  });
});

// ============================================================================
// variant="compact" Property-Based 테스트
// ============================================================================

describe('PostCard variant="compact" - Property-Based 테스트', () => {
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
            <PostCard
              variant="compact"
              title={title}
              createdAt={createdAt}
              path={path}
              thumbnail={thumbnail}
              tags={[]}
              published={true}
              locale={locale}
            />
          );

          const normalizedTitle = title.replace(/\s+/g, ' ');
          expect(
            screen.getByRole('heading', { name: normalizedTitle })
          ).toBeInTheDocument();

          const img = screen.getByRole('img', { name: normalizedTitle });
          expect(img).toBeInTheDocument();

          const expectedSrc =
            thumbnail === undefined ? '/image/context.png' : thumbnail;
          expect(img).toHaveAttribute('src', expectedSrc);

          expect(screen.getByText('Read More')).toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('모든 날짜 입력에 대해 yyyy-MM-dd 형식으로 표시되어야 한다', async () => {
    await fc.assert(
      fc.asyncProperty(dateArb, async (createdAt) => {
        const { unmount } = await renderWithRouter(
          <PostCard
            variant="compact"
            title="날짜 포맷 테스트"
            createdAt={createdAt}
            path={['2024', '01', 'date-format']}
            tags={[]}
            published={true}
            locale="ko"
          />
        );

        const year = createdAt.getFullYear();
        const month = String(createdAt.getMonth() + 1).padStart(2, '0');
        const day = String(createdAt.getDate()).padStart(2, '0');
        const expectedDate = `${year}-${month}-${day}`;

        expect(screen.getByText(expectedDate)).toBeInTheDocument();

        unmount();
      }),
      { numRuns: 20 }
    );
  });
});
