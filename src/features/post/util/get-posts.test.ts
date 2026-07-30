import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Frontmatter } from '@/entities/markdown/model/model.schema';

import { getPosts } from './get-posts';

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

function mockIndexResponse(data: Frontmatter[], status = 200, contentLength?: number) {
  vi.mocked(fetch).mockResolvedValue(
    new Response(JSON.stringify(data), {
      status,
      headers:
        contentLength === undefined ? undefined : { 'content-length': String(contentLength) },
    })
  );
}

describe('getPosts visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('VITE_GIT_RAW_URL', 'https://raw.example.test/content');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('removes unpublished, test, and draft posts in production before pagination', async () => {
    vi.stubEnv('PROD', true);
    mockIndexResponse([
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
    mockIndexResponse([
      createPost('Test', { tags: ['test'] }),
      createPost('Draft', { tags: ['draft'] }),
      createPost('Unpublished', { published: false }),
    ]);

    const result = await getPosts({ locale: 'ko', page: 0, size: 10 });

    expect(result.posts.map((post) => post.title)).toEqual(['Test', 'Draft']);
    expect(result.total).toBe(2);
  });

  it('requests a validated HTTPS index URL', async () => {
    mockIndexResponse([createPost('Public')]);

    await getPosts({ locale: 'ko', page: 0, size: 10 });

    expect(fetch).toHaveBeenCalledWith(
      'https://raw.example.test/content/ko/index.json',
      expect.objectContaining({ credentials: 'omit' })
    );
  });

  it('rejects malformed remote post metadata', async () => {
    mockIndexResponse([
      createPost('Unsafe', {
        path: ['..', 'outside'],
      }),
    ]);

    const result = await getPosts({ locale: 'ko', page: 0, size: 10 });

    expect(result).toEqual({ posts: [], total: 0, page: 0, size: 10 });
  });

  it('drops unsafe thumbnails instead of forwarding them to the browser', async () => {
    mockIndexResponse([createPost('Unsafe image', { thumbnail: 'javascript:alert(1)' })]);

    const result = await getPosts({ locale: 'ko', page: 0, size: 10 });

    expect(result.posts[0]?.thumbnail).toBeUndefined();
  });

  it('rejects an oversized post index before JSON parsing', async () => {
    mockIndexResponse([], 200, 2 * 1024 * 1024 + 1);

    await expect(getPosts({ locale: 'ko', page: 0, size: 10 })).resolves.toEqual({
      posts: [],
      total: 0,
      page: 0,
      size: 10,
    });
    expect(console.error).toHaveBeenCalledWith(
      'Failed to fetch posts:',
      expect.objectContaining({ message: expect.stringMatching(/size limit/i) })
    );
  });
});
