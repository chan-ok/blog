import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPosts } from './get-posts';
import { api } from '@/5-shared/config/api';

vi.mock('@/5-shared/config/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

function mockApiGet(data: unknown[]) {
  vi.mocked(api.get).mockResolvedValue({
    data,
    axios: { status: 200 } as import('axios').AxiosResponse,
  } as Awaited<ReturnType<typeof api.get>>);
}

describe('getPosts', () => {
  const baseURL = 'https://raw.githubusercontent.com/owner/blog-content/main';

  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_GIT_RAW_URL = baseURL;
  });

  it('tags가 없는(undefined) 포스트가 있어도 필터 시 런타임 오류가 나지 않아야 한다', async () => {
    mockApiGet([
      {
        title: 'No tags post',
        path: ['2024', 'no-tags'],
        tags: undefined,
        createdAt: '2024-01-01T00:00:00.000Z',
        published: true,
        series: undefined,
      },
      {
        title: 'With tags post',
        path: ['2024', 'with-tags'],
        tags: ['react'],
        createdAt: '2024-01-02T00:00:00.000Z',
        published: true,
        series: undefined,
      },
    ]);

    const result = await getPosts({
      locale: 'ko',
      tags: ['react'],
    });

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].title).toBe('With tags post');
    expect(result.total).toBe(1);
  });

  it('개발 환경(DEV)에서는 test/draft 태그가 있는 포스트가 포함되어야 한다', async () => {
    const origDev = import.meta.env.DEV;
    import.meta.env.DEV = true;

    mockApiGet([
      {
        title: 'Draft post',
        path: ['2024', 'draft'],
        tags: ['draft'],
        createdAt: '2024-01-01T00:00:00.000Z',
        published: true,
        series: undefined,
      },
      {
        title: 'Test post',
        path: ['2024', 'test'],
        tags: ['test'],
        createdAt: '2024-01-02T00:00:00.000Z',
        published: true,
        series: undefined,
      },
    ]);

    const result = await getPosts({ locale: 'ko' });

    expect(result.posts).toHaveLength(2);
    expect(result.total).toBe(2);
    import.meta.env.DEV = origDev;
  });

  it('프로덕션 환경에서는 test/draft 태그가 있는 포스트가 제외되어야 한다', async () => {
    const origDev = import.meta.env.DEV;
    import.meta.env.DEV = false;

    mockApiGet([
      {
        title: 'Normal post',
        path: ['2024', 'normal'],
        tags: ['react'],
        createdAt: '2024-01-01T00:00:00.000Z',
        published: true,
        series: undefined,
      },
      {
        title: 'Draft post',
        path: ['2024', 'draft'],
        tags: ['draft'],
        createdAt: '2024-01-02T00:00:00.000Z',
        published: true,
        series: undefined,
      },
      {
        title: 'Test post',
        path: ['2024', 'test'],
        tags: ['test'],
        createdAt: '2024-01-03T00:00:00.000Z',
        published: true,
        series: undefined,
      },
    ]);

    const result = await getPosts({ locale: 'ko' });

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].title).toBe('Normal post');
    expect(result.total).toBe(1);
    import.meta.env.DEV = origDev;
  });

  it('published:false 포스트가 제외되어야 한다', async () => {
    mockApiGet([
      {
        title: '공개 포스트',
        path: ['2024', 'published'],
        tags: ['react'],
        createdAt: '2024-01-01T00:00:00.000Z',
        published: true,
        series: undefined,
      },
      {
        title: '비공개 포스트',
        path: ['2024', 'unpublished'],
        tags: ['react'],
        createdAt: '2024-01-02T00:00:00.000Z',
        published: false,
        series: undefined,
      },
    ]);

    const result = await getPosts({ locale: 'ko' });

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].title).toBe('공개 포스트');
    expect(result.total).toBe(1);
  });

  it('createdAt 내림차순으로 정렬되어야 한다 (최신 글이 첫 번째)', async () => {
    mockApiGet([
      {
        title: '오래된 글',
        path: ['2024', 'old'],
        tags: [],
        createdAt: '2023-01-01T00:00:00.000Z',
        published: true,
        series: undefined,
      },
      {
        title: '최신 글',
        path: ['2024', 'new'],
        tags: [],
        createdAt: '2024-06-01T00:00:00.000Z',
        published: true,
        series: undefined,
      },
    ]);

    const result = await getPosts({ locale: 'ko' });

    expect(result.posts[0].title).toBe('최신 글');
    expect(result.posts[1].title).toBe('오래된 글');
  });

  it('page=0, size=1 이면 1개만 반환해야 한다', async () => {
    mockApiGet([
      {
        title: '포스트 A',
        path: ['2024', 'a'],
        tags: [],
        createdAt: '2024-02-01T00:00:00.000Z',
        published: true,
        series: undefined,
      },
      {
        title: '포스트 B',
        path: ['2024', 'b'],
        tags: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        published: true,
        series: undefined,
      },
    ]);

    const result = await getPosts({ locale: 'ko', page: 0, size: 1 });

    expect(result.posts).toHaveLength(1);
    expect(result.total).toBe(2);
    expect(result.posts[0].title).toBe('포스트 A');
  });

  it('thumbnail이 상대 경로면 절대 URL로 변환되어야 한다', async () => {
    mockApiGet([
      {
        title: '썸네일 포스트',
        path: ['2024', 'thumb'],
        tags: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        published: true,
        thumbnail: 'images/thumb.png',
        series: undefined,
      },
    ]);

    const result = await getPosts({ locale: 'ko' });

    expect(result.posts[0].thumbnail).toBe(`${baseURL}/images/thumb.png`);
  });

  it('thumbnail이 이미 https://로 시작하면 그대로 유지되어야 한다', async () => {
    const absoluteUrl = 'https://cdn.example.com/image.png';
    mockApiGet([
      {
        title: '절대 URL 썸네일',
        path: ['2024', 'absolute-thumb'],
        tags: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        published: true,
        thumbnail: absoluteUrl,
        series: undefined,
      },
    ]);

    const result = await getPosts({ locale: 'ko' });

    expect(result.posts[0].thumbnail).toBe(absoluteUrl);
  });

  it('VITE_GIT_RAW_URL이 없으면 빈 배열을 반환해야 한다', async () => {
    import.meta.env.VITE_GIT_RAW_URL = '';

    const result = await getPosts({ locale: 'ko' });

    expect(result.posts).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('API 404 응답 시 빈 배열을 반환해야 한다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: null,
      axios: { status: 404 } as import('axios').AxiosResponse,
    } as Awaited<ReturnType<typeof api.get>>);

    const result = await getPosts({ locale: 'ko' });

    expect(result.posts).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('API throw 시 빈 배열을 반환해야 한다', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

    const result = await getPosts({ locale: 'ko' });

    expect(result.posts).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('series 필드가 있는 포스트가 포함되어야 한다', async () => {
    mockApiGet([
      {
        title: '시리즈 포스트',
        path: ['2024', 'series'],
        tags: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        published: true,
        series: 'my-series',
      },
    ]);

    const result = await getPosts({ locale: 'ko' });

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].series).toBe('my-series');
  });
});
