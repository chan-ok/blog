import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Frontmatter } from '@/entities/markdown/model/model.schema';
import { api } from '@/shared/api';
import { getPosts } from './get-posts';

vi.mock('@/shared/api', () => ({
  api: { get: vi.fn<typeof api.get>() },
}));

function createPost(title: string, overrides: Partial<Frontmatter> = {}): Frontmatter {
  return {
    title,
    path: ['posts', title.toLowerCase().replaceAll(' ', '-')],
    tags: [],
    createdAt: new Date('2026-07-14T00:00:00.000Z'),
    updatedAt: null,
    published: true,
    ...overrides,
  };
}

function mockApiGet(data: Frontmatter[]) {
  vi.mocked(api.get).mockResolvedValue({
    data,
    axios: { status: 200 } as import('axios').AxiosResponse,
  } as Awaited<ReturnType<typeof api.get>>);
}

describe('getPosts visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_GIT_RAW_URL', 'https://raw.example.test/content');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('removes unpublished, test, and draft posts in production before pagination', async () => {
    vi.stubEnv('PROD', true);
    mockApiGet([
      createPost('Public'),
      createPost('Unpublished', {
        published: false,
        createdAt: new Date('2026-07-15T00:00:00.000Z'),
      }),
      createPost('Test', {
        tags: ['test'],
        createdAt: new Date('2026-07-16T00:00:00.000Z'),
      }),
      createPost('Draft', {
        tags: ['draft'],
        createdAt: new Date('2026-07-17T00:00:00.000Z'),
      }),
    ]);

    const result = await getPosts({ locale: 'ko', page: 0, size: 1 });

    expect(result.posts.map((post) => post.title)).toEqual(['Public']);
    expect(result.total).toBe(1);
  });

  it('keeps published test and draft posts in development lists', async () => {
    vi.stubEnv('PROD', false);
    mockApiGet([
      createPost('Test', { tags: ['test'] }),
      createPost('Draft', { tags: ['draft'] }),
      createPost('Unpublished', { published: false }),
    ]);

    const result = await getPosts({ locale: 'ko', page: 0, size: 10 });

    expect(result.posts.map((post) => post.title)).toEqual(['Test', 'Draft']);
    expect(result.total).toBe(2);
  });
});
