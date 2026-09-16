import { describe, expect, it } from 'vitest';

import { resolveContentUrl } from './content-url';

describe('resolveContentUrl', () => {
  const baseUrl = 'https://raw.githubusercontent.com/chan-ok/blog-content/main';

  it('resolves a relative asset inside the configured content root', () => {
    expect(resolveContentUrl('images/post image.png', baseUrl)).toBe(
      'https://raw.githubusercontent.com/chan-ok/blog-content/main/images/post%20image.png'
    );
  });

  it('allows an absolute asset inside the configured content root', () => {
    expect(resolveContentUrl(`${baseUrl}/images/post.png`, baseUrl)).toBe(
      `${baseUrl}/images/post.png`
    );
  });

  it('allows explicit HTTPS image URLs', () => {
    expect(resolveContentUrl('https://skillicons.dev/icons?i=react', baseUrl)).toBe(
      'https://skillicons.dev/icons?i=react'
    );
  });

  it('rejects an absolute HTTPS image outside the content and deployment allowlists', () => {
    expect(resolveContentUrl('https://attacker.example/pixel', baseUrl)).toBeUndefined();
    expect(
      resolveContentUrl(
        'https://raw.githubusercontent.com/chan-ok/blog-content/main-evil/pixel',
        baseUrl
      )
    ).toBeUndefined();
  });

  it.each([
    'http://example.com/image.png',
    'javascript:alert(1)',
    'data:image/svg+xml,<svg onload=alert(1)>',
    '//example.com/image.png',
    '../private/image.png',
    '%2e%2e/private/image.png',
    '/outside-content/image.png',
    'https://user:password@example.com/image.png',
  ])('rejects unsafe image source %s', (source) => {
    expect(resolveContentUrl(source, baseUrl)).toBeUndefined();
  });
});
