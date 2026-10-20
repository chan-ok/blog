import { describe, expect, it } from 'vitest';
import { canonicalHref, pageHref, parseFramework, parseLocale } from './routes';

describe('블로그 URL 계약', () => {
  it('선택한 프레임워크와 언어로 URL을 만든다', () => {
    expect(
      pageHref({ framework: 'vue', locale: 'ko', explicitFramework: true }, { kind: 'posts' })
    ).toBe('/vue/ko/posts/');
    expect(
      pageHref({ framework: 'react', locale: 'ja', explicitFramework: false }, { kind: 'about' })
    ).toBe('/ja/about/');
    expect(canonicalHref('ko', { kind: 'posts' })).toBe('https://chan-ok.com/ko/posts');
  });
  it('한글과 중첩 경로를 한 번만 인코딩한다', () => {
    const page = { kind: 'post' as const, slug: ['블로그-개발', '글_제목'] };
    expect(pageHref({ framework: 'svelte', locale: 'ko', explicitFramework: true }, page)).toBe(
      `/svelte/ko/posts/${encodeURIComponent('블로그-개발')}/${encodeURIComponent('글_제목')}/`
    );
    expect(pageHref({ framework: 'vue', locale: 'ja', explicitFramework: true }, page)).toContain(
      '/vue/ja/posts/'
    );
    expect(canonicalHref('ko', page)).not.toContain('/svelte/');
  });
  it.each(['..', '.', '%2e%2e', '%252e', '%zz', 'a/b', 'a\\b', 'a?b', 'a#b', ''])(
    '안전하지 않은 경로 %s를 거부한다',
    (segment) => {
      expect(() =>
        pageHref(
          { framework: 'react', locale: 'ko', explicitFramework: false },
          { kind: 'post', slug: [segment] }
        )
      ).toThrow(/Invalid|Unsupported/);
    }
  );
  it('지원하지 않는 프레임워크와 언어를 거부한다', () => {
    expect(() => parseFramework('angular')).toThrow(/Invalid|Unsupported/);
    expect(() => parseLocale('en')).toThrow(/Invalid|Unsupported/);
    expect(parseFramework('svelte')).toBe('svelte');
  });
});
