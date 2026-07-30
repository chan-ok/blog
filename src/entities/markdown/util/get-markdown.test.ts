import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getMarkdown } from './get-markdown';

function mockMarkdownResponse(source: string, status = 200, contentLength?: number) {
  vi.mocked(fetch).mockResolvedValue(
    new Response(source, {
      status,
      headers:
        contentLength === undefined ? undefined : { 'content-length': String(contentLength) },
    })
  );
}

describe('getMarkdown security boundaries', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    Reflect.deleteProperty(globalThis, '__frontmatterExecuted');
  });

  it('rejects path traversal before making a network request', async () => {
    await expect(
      getMarkdown('ko/../../../../attacker/repository/main/payload.mdx', 'https://example.com')
    ).rejects.toThrow(/invalid markdown path/i);

    expect(fetch).not.toHaveBeenCalled();
  });

  it('never executes JavaScript frontmatter', async () => {
    mockMarkdownResponse(`---javascript
(globalThis.__frontmatterExecuted = true, { published: true })
---
# Unsafe post
`);

    await expect(getMarkdown('ko/post.mdx', 'https://example.com')).rejects.toThrow(/frontmatter/i);
    expect(Reflect.has(globalThis, '__frontmatterExecuted')).toBe(false);
  });

  it('returns Markdown data without an executable component', async () => {
    mockMarkdownResponse('# Plain Markdown');

    const markdown = await getMarkdown('ko/post.mdx', 'https://example.com');

    expect(markdown).not.toHaveProperty('MDXContent');
    expect(markdown.content).toBe('# Plain Markdown');
  });

  it('falls back to Markdown when the MDX resource is missing', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response('', { status: 404 }))
      .mockResolvedValueOnce(new Response('# Markdown fallback', { status: 200 }));

    await expect(getMarkdown('ko/post.mdx', 'https://example.com')).resolves.toMatchObject({
      content: '# Markdown fallback',
    });
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'https://example.com/ko/post.md',
      expect.objectContaining({ credentials: 'omit' })
    );
  });

  it('rejects an oversized Markdown response before parsing', async () => {
    mockMarkdownResponse('# Small fixture', 200, 2 * 1024 * 1024 + 1);

    await expect(getMarkdown('ko/post.mdx', 'https://example.com')).rejects.toThrow(/size limit/i);
  });
});
