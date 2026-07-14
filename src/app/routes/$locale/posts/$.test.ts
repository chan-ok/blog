import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MarkdownElement, MarkdownFrontmatter } from '@/entities/markdown/util/get-markdown';
import { getMarkdown } from '@/entities/markdown/util/get-markdown';

const notFoundMarker = vi.hoisted(() => Symbol('not-found'));

vi.mock('@/entities/markdown/util/get-markdown', () => ({
  getMarkdown: vi.fn<typeof getMarkdown>(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');
  return {
    ...actual,
    notFound: () => notFoundMarker,
  };
});

import { Route } from './$';

type Loader = (args: { params: { locale: string; _splat: string } }) => Promise<unknown>;

function createMarkdown(frontmatter: MarkdownFrontmatter): MarkdownElement {
  return {
    frontmatter,
    content: '',
    source: '',
    MDXContent: () => null,
  };
}

function loadPost() {
  const loader = Route.options.loader as Loader;
  return loader({ params: { locale: 'ko', _splat: 'visibility-test' } });
}

describe('post detail loader visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it.each([
    [{ published: false, tags: [] }, 'unpublished'],
    [{ tags: [] }, 'missing-published'],
    [{ published: true, tags: ['test'] }, 'test'],
    [{ published: true, tags: ['draft'] }, 'draft'],
  ])('returns not found for a %s post in production', async (frontmatter) => {
    vi.stubEnv('PROD', true);
    vi.mocked(getMarkdown).mockResolvedValue(createMarkdown(frontmatter));

    await expect(loadPost()).rejects.toBe(notFoundMarker);
  });

  it('returns the existing loader payload for a public production post', async () => {
    vi.stubEnv('PROD', true);
    const markdown = createMarkdown({
      published: true,
      tags: ['react'],
      title: 'Public post',
    });
    vi.mocked(getMarkdown).mockResolvedValue(markdown);

    await expect(loadPost()).resolves.toMatchObject({
      frontmatter: markdown.frontmatter,
      path: 'ko/visibility-test.mdx',
    });
  });

  it('keeps development preview access for unpublished and reserved-tag posts', async () => {
    vi.stubEnv('PROD', false);
    const markdown = createMarkdown({ published: false, tags: ['test'] });
    vi.mocked(getMarkdown).mockResolvedValue(markdown);

    await expect(loadPost()).resolves.toMatchObject({
      frontmatter: markdown.frontmatter,
      path: 'ko/visibility-test.mdx',
    });
  });
});
