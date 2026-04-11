import { describe, it, expect, vi, beforeEach } from 'vitest';

// fetch 모킹
global.fetch = vi.fn();

import { getSeries, getSeriesBySlug } from './get-series';

const mockSeriesList = [
  {
    slug: 'fsd-architecture',
    title: 'FSD 아키텍처 탐구',
    description: 'Feature-Sliced Design 실무 적용',
    createdAt: '2026-03-01',
    items: [
      { type: 'post', path: 'ko/fsd-retrospective', title: 'FSD 6개월 후기' },
      {
        type: 'scrap',
        url: 'https://feature-sliced.design',
        title: '공식 문서',
      },
    ],
  },
];

describe('getSeries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('시리즈 목록을 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSeriesList,
    } as Response);

    const result = await getSeries('https://example.com');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('fsd-architecture');
    expect(result[0].title).toBe('FSD 아키텍처 탐구');
  });

  it('fetch 실패 시 빈 배열을 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
    } as Response);

    const result = await getSeries('https://example.com');
    expect(result).toEqual([]);
  });
});

describe('getSeriesBySlug', () => {
  it('slug로 시리즈 하나를 찾는다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSeriesList,
    } as Response);

    const result = await getSeriesBySlug(
      'fsd-architecture',
      'https://example.com'
    );
    expect(result).not.toBeNull();
    expect(result?.slug).toBe('fsd-architecture');
    expect(result?.items).toHaveLength(2);
  });

  it('없는 slug는 null을 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSeriesList,
    } as Response);

    const result = await getSeriesBySlug('nonexistent', 'https://example.com');
    expect(result).toBeNull();
  });
});
