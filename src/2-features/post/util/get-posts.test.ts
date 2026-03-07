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
      },
      {
        title: 'With tags post',
        path: ['2024', 'with-tags'],
        tags: ['react'],
        createdAt: '2024-01-02T00:00:00.000Z',
        published: true,
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
});
