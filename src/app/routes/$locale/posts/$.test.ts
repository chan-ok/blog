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
type Head = (args: {
  params: { locale: string; _splat: string };
  loaderData: { frontmatter: MarkdownFrontmatter };
}) => { meta?: React.JSX.IntrinsicElements['meta'][] };

function createMarkdown(frontmatter: MarkdownFrontmatter): MarkdownElement {
  return {
    frontmatter,
    content: '',
    source: '',
  };
}

function loadPost() {
  const loader = Route.options.loader as Loader;
  return loader({ params: { locale: 'ko', _splat: 'visibility-test' } });
}

function getPostMeta(frontmatter: MarkdownFrontmatter) {
  const head = Route.options.head as unknown as Head;
  return (
    head({
      params: { locale: 'ko', _splat: 'security-test' },
      loaderData: { frontmatter },
    }).meta ?? []
  );
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

  it.each([
    '../outside',
    '..%2F..%2Foutside',
    '%2e%2e%2f%2e%2e%2foutside',
    '..\\..\\outside',
    'post?source=outside',
    'post#outside',
  ])('rejects an unsafe post path before fetching: %s', async (_splat) => {
    const loader = Route.options.loader as Loader;

    await expect(loader({ params: { locale: 'ko', _splat } })).rejects.toBe(notFoundMarker);
    expect(getMarkdown).not.toHaveBeenCalled();
  });
});

describe('post detail metadata image boundary', () => {
  it.each(['javascript:alert(1)', 'https://attacker.example/pixel.png'])(
    'falls back to the site image for an unsafe thumbnail: %s',
    (thumbnail) => {
      const meta = getPostMeta({ thumbnail });

      expect(meta).toContainEqual({
        property: 'og:image',
        content: 'https://chan-ok.com/og-default.png',
      });
      expect(meta).toContainEqual({
        name: 'twitter:image',
        content: 'https://chan-ok.com/og-default.png',
      });
    }
  );

  it('resolves a relative thumbnail inside the configured content root', () => {
    const meta = getPostMeta({ thumbnail: 'images/cover.png' });

    expect(meta).toContainEqual({
      property: 'og:image',
      content: 'https://raw.githubusercontent.com/chan-ok/blog-content/main/images/cover.png',
    });
    expect(meta).toContainEqual({
      name: 'twitter:image',
      content: 'https://raw.githubusercontent.com/chan-ok/blog-content/main/images/cover.png',
    });
  });
});
