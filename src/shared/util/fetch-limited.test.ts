import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchTextWithLimit } from './fetch-limited';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('fetchTextWithLimit', () => {
  it('returns a successful response within the byte limit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('안녕', {
          status: 200,
          headers: { 'content-length': '6' },
        })
      )
    );

    await expect(fetchTextWithLimit('https://example.com/post.md', 6)).resolves.toEqual({
      status: 200,
      text: '안녕',
    });
  });

  it('rejects an oversized Content-Length before reading the body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('small fixture', {
          status: 200,
          headers: { 'content-length': '100' },
        })
      )
    );

    await expect(fetchTextWithLimit('https://example.com/post.md', 10)).rejects.toThrow(
      /size limit/i
    );
  });

  it('omits credentials and refuses redirects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('safe', { status: 200 })));

    await fetchTextWithLimit('https://example.com/post.md', 10);

    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/post.md',
      expect.objectContaining({
        credentials: 'omit',
        redirect: 'error',
        referrerPolicy: 'no-referrer',
        signal: expect.anything(),
      })
    );
  });

  it('aborts on timeout without AbortSignal.timeout support', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('AbortSignal', {});
    vi.stubGlobal(
      'fetch',
      vi.fn((_url, init?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Request timed out', 'AbortError')),
            { once: true }
          );
        });
      })
    );

    const request = fetchTextWithLimit('https://example.com/post.md', 10).catch(
      (error: unknown) => error
    );

    await vi.advanceTimersByTimeAsync(5_000);
    await expect(request).resolves.toMatchObject({ name: 'AbortError' });
  });

  it('rejects a streamed response that grows beyond the byte limit', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('123456', { status: 200 })));

    await expect(fetchTextWithLimit('https://example.com/post.md', 5)).rejects.toThrow(
      /size limit/i
    );
  });

  it('does not download an error response body', async () => {
    const cancel = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        body: { cancel },
      } as unknown as Response)
    );

    await expect(fetchTextWithLimit('https://example.com/missing.mdx', 10)).resolves.toEqual({
      status: 404,
      text: '',
    });
    expect(cancel).toHaveBeenCalledOnce();
  });
});
