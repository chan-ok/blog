import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';

import { getSeriesPosts } from './get-series-posts';
import { api } from '@/5-shared/config/api';

/**
 * ============================================================================
 * getSeriesPosts 함수 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * 동일 시리즈에 속하는 포스트 목록을 가져오는 getSeriesPosts 함수를 검증합니다.
 * - published 포스트만 반환
 * - 지정된 series 값과 일치하는 포스트만 필터링
 * - createdAt 오름차순 정렬 (시리즈 순서대로)
 * - 프로덕션에서는 test/draft 태그 포스트 제외
 *
 * ## 검증 항목
 * - ✅ 같은 series 값의 포스트만 필터링
 * - ✅ series 값이 다른 포스트 제외
 * - ✅ series 필드 없는 포스트 제외
 * - ✅ createdAt 오름차순 정렬 (오래된 글이 첫 번째)
 * - ✅ published:false 포스트 제외
 * - ✅ 프로덕션: test/draft 태그 포스트 제외
 * - ✅ 개발: test/draft 태그 포스트 포함
 * - ✅ VITE_GIT_RAW_URL 없으면 빈 배열 반환
 * - ✅ API 404 시 빈 배열 반환
 * - ✅ API throw 시 빈 배열 반환
 * - ✅ 매칭 포스트 없으면 빈 배열 반환
 * - ✅ PBT: 임의의 series 문자열에서 해당 series만 필터링
 */

vi.mock('@/5-shared/config/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

/** 테스트용 포스트 생성 헬퍼 */
function makePost(overrides: Partial<{
  title: string;
  path: string[];
  tags: string[];
  createdAt: string;
  published: boolean;
  series: string | undefined;
}> = {}) {
  return {
    title: '테스트 포스트',
    path: ['2024', 'test-post'],
    tags: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    published: true,
    series: 'my-series',
    ...overrides,
  };
}

function mockApiGet(data: unknown[]) {
  vi.mocked(api.get).mockResolvedValue({
    data,
    axios: { status: 200 } as import('axios').AxiosResponse,
  } as Awaited<ReturnType<typeof api.get>>);
}

describe('getSeriesPosts', () => {
  const baseURL = 'https://raw.githubusercontent.com/owner/blog-content/main';

  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_GIT_RAW_URL = baseURL;
  });

  it('같은 series 값의 포스트만 필터링해야 한다', async () => {
    mockApiGet([
      makePost({ title: '시리즈 포스트 1', series: 'my-series' }),
      makePost({ title: '시리즈 포스트 2', series: 'my-series', createdAt: '2024-02-01T00:00:00.000Z' }),
      makePost({ title: '다른 시리즈 포스트', series: 'other-series' }),
    ]);

    const result = await getSeriesPosts({ locale: 'ko', series: 'my-series' });

    expect(result).toHaveLength(2);
    expect(result.every((p) => p.series === 'my-series')).toBe(true);
  });

  it('series 값이 다른 포스트를 제외해야 한다', async () => {
    mockApiGet([
      makePost({ title: '대상 시리즈', series: 'target' }),
      makePost({ title: '다른 시리즈', series: 'other' }),
    ]);

    const result = await getSeriesPosts({ locale: 'ko', series: 'target' });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('대상 시리즈');
  });

  it('series 필드가 없는 포스트를 제외해야 한다', async () => {
    mockApiGet([
      makePost({ title: '시리즈 있음', series: 'my-series' }),
      makePost({ title: '시리즈 없음', series: undefined }),
    ]);

    const result = await getSeriesPosts({ locale: 'ko', series: 'my-series' });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('시리즈 있음');
  });

  it('createdAt 오름차순으로 정렬되어야 한다 (오래된 글이 첫 번째)', async () => {
    mockApiGet([
      makePost({ title: '최신 글', series: 'my-series', createdAt: '2024-06-01T00:00:00.000Z' }),
      makePost({ title: '오래된 글', series: 'my-series', createdAt: '2024-01-01T00:00:00.000Z' }),
    ]);

    const result = await getSeriesPosts({ locale: 'ko', series: 'my-series' });

    expect(result[0].title).toBe('오래된 글');
    expect(result[1].title).toBe('최신 글');
  });

  it('published:false 포스트를 제외해야 한다', async () => {
    mockApiGet([
      makePost({ title: '공개 포스트', series: 'my-series', published: true }),
      makePost({ title: '비공개 포스트', series: 'my-series', published: false }),
    ]);

    const result = await getSeriesPosts({ locale: 'ko', series: 'my-series' });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('공개 포스트');
  });

  it('프로덕션 환경에서는 test/draft 태그 포스트를 제외해야 한다', async () => {
    const origDev = import.meta.env.DEV;
    import.meta.env.DEV = false;

    mockApiGet([
      makePost({ title: '일반 포스트', series: 'my-series', tags: ['react'] }),
      makePost({ title: '드래프트 포스트', series: 'my-series', tags: ['draft'] }),
      makePost({ title: '테스트 포스트', series: 'my-series', tags: ['test'] }),
    ]);

    const result = await getSeriesPosts({ locale: 'ko', series: 'my-series' });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('일반 포스트');

    import.meta.env.DEV = origDev;
  });

  it('개발 환경에서는 test/draft 태그 포스트를 포함해야 한다', async () => {
    const origDev = import.meta.env.DEV;
    import.meta.env.DEV = true;

    mockApiGet([
      makePost({ title: '일반 포스트', series: 'my-series', tags: ['react'] }),
      makePost({ title: '드래프트 포스트', series: 'my-series', tags: ['draft'], createdAt: '2024-02-01T00:00:00.000Z' }),
    ]);

    const result = await getSeriesPosts({ locale: 'ko', series: 'my-series' });

    expect(result).toHaveLength(2);

    import.meta.env.DEV = origDev;
  });

  it('VITE_GIT_RAW_URL이 없으면 빈 배열을 반환해야 한다', async () => {
    import.meta.env.VITE_GIT_RAW_URL = '';

    const result = await getSeriesPosts({ locale: 'ko', series: 'my-series' });

    expect(result).toHaveLength(0);
  });

  it('API 404 응답 시 빈 배열을 반환해야 한다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: null,
      axios: { status: 404 } as import('axios').AxiosResponse,
    } as Awaited<ReturnType<typeof api.get>>);

    const result = await getSeriesPosts({ locale: 'ko', series: 'my-series' });

    expect(result).toHaveLength(0);
  });

  it('API throw 시 빈 배열을 반환해야 한다', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

    const result = await getSeriesPosts({ locale: 'ko', series: 'my-series' });

    expect(result).toHaveLength(0);
  });

  it('매칭 포스트가 없으면 빈 배열을 반환해야 한다', async () => {
    mockApiGet([
      makePost({ series: 'other-series' }),
    ]);

    const result = await getSeriesPosts({ locale: 'ko', series: 'nonexistent' });

    expect(result).toHaveLength(0);
  });

  it('PBT: 임의의 series 문자열에서 해당 series만 필터링되어야 한다', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 1, maxLength: 50 })
          .filter((s) => s.trim().length > 0 && s !== 'other'),
        async (seriesName) => {
          mockApiGet([
            makePost({ title: '대상 포스트', series: seriesName }),
            makePost({ title: '다른 포스트', series: 'other' }),
            makePost({ title: '시리즈 없음', series: undefined }),
          ]);

          const result = await getSeriesPosts({ locale: 'ko', series: seriesName });

          // 모든 결과가 지정한 series와 일치해야 함
          expect(result.every((p) => p.series === seriesName)).toBe(true);
          // 대상 포스트가 포함되어야 함
          expect(result.some((p) => p.title === '대상 포스트')).toBe(true);
          // 다른 시리즈 포스트는 제외되어야 함
          expect(result.every((p) => p.title !== '다른 포스트')).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });
});
