import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import {
  buildMeta,
  buildCanonicalLink,
  getHomeDescription,
  getAboutDescription,
  getPostsDescription,
} from './build-meta';

// ============================================================================
// 상수: 사이트 기본 정보 (build-meta.ts와 동일한 값)
// ============================================================================

const SITE_URL = 'https://chan-ok.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

// ============================================================================
// Unit 테스트: buildMeta - 기본 메타태그
// ============================================================================

describe('buildMeta - 기본 메타태그', () => {
  const baseOptions = {
    title: '테스트 제목',
    description: '테스트 설명',
  };

  it('title과 description을 포함한 배열을 반환해야 한다', () => {
    const result = buildMeta(baseOptions);

    // title 태그 존재 확인 ({ title } 형식)
    expect(result.some((tag) => 'title' in tag && tag.title === baseOptions.title)).toBe(true);
    // description 메타 태그 존재 확인
    expect(
      result.some(
        (tag) => 'name' in tag && tag.name === 'description' && tag.content === baseOptions.description
      )
    ).toBe(true);
  });

  it('og:title, og:description, og:image, og:type, og:url을 포함해야 한다', () => {
    const result = buildMeta(baseOptions);

    // og:title
    expect(result.some((tag) => 'property' in tag && tag.property === 'og:title' && tag.content === baseOptions.title)).toBe(true);
    // og:description
    expect(result.some((tag) => 'property' in tag && tag.property === 'og:description' && tag.content === baseOptions.description)).toBe(true);
    // og:image (기본 이미지)
    expect(result.some((tag) => 'property' in tag && tag.property === 'og:image' && tag.content === DEFAULT_IMAGE)).toBe(true);
    // og:type (기본값 'website')
    expect(result.some((tag) => 'property' in tag && tag.property === 'og:type' && tag.content === 'website')).toBe(true);
    // og:url (path 없으면 SITE_URL)
    expect(result.some((tag) => 'property' in tag && tag.property === 'og:url' && tag.content === SITE_URL)).toBe(true);
  });

  it('twitter:card와 twitter:title을 포함해야 한다', () => {
    const result = buildMeta(baseOptions);

    // twitter:card
    expect(result.some((tag) => 'name' in tag && tag.name === 'twitter:card' && tag.content === 'summary_large_image')).toBe(true);
    // twitter:title
    expect(result.some((tag) => 'name' in tag && tag.name === 'twitter:title' && tag.content === baseOptions.title)).toBe(true);
  });

  it('커스텀 image를 전달하면 og:image에 반영되어야 한다', () => {
    const customImage = 'https://chan-ok.com/custom-og.png';
    const result = buildMeta({ ...baseOptions, image: customImage });

    expect(result.some((tag) => 'property' in tag && tag.property === 'og:image' && tag.content === customImage)).toBe(true);
  });

  it('path를 전달하면 og:url에 SITE_URL + path가 반영되어야 한다', () => {
    const path = '/ko/posts/my-post';
    const result = buildMeta({ ...baseOptions, path });

    expect(result.some((tag) => 'property' in tag && tag.property === 'og:url' && tag.content === `${SITE_URL}${path}`)).toBe(true);
  });
});

// ============================================================================
// Unit 테스트: buildMeta - article 전용 메타태그
// ============================================================================

describe('buildMeta - article 전용 메타태그', () => {
  const baseOptions = {
    title: '포스트 제목',
    description: '포스트 설명',
    type: 'article' as const,
  };

  it('type=article, publishedTime이 있으면 article:published_time을 포함해야 한다', () => {
    const publishedTime = '2024-01-01T00:00:00Z';
    const result = buildMeta({ ...baseOptions, publishedTime });

    expect(
      result.some(
        (tag) =>
          'property' in tag &&
          tag.property === 'article:published_time' &&
          tag.content === publishedTime
      )
    ).toBe(true);
  });

  it('type=article, tags가 있으면 각 태그에 대해 article:tag를 포함해야 한다', () => {
    const tags = ['react', 'typescript', 'testing'];
    const result = buildMeta({ ...baseOptions, tags });

    tags.forEach((tag) => {
      expect(
        result.some(
          (metaTag) =>
            'property' in metaTag &&
            metaTag.property === 'article:tag' &&
            metaTag.content === tag
        )
      ).toBe(true);
    });
  });

  it('type=article, publishedTime이 없으면 article:published_time을 포함하지 않아야 한다', () => {
    const result = buildMeta({ ...baseOptions });

    expect(result.some((tag) => 'property' in tag && tag.property === 'article:published_time')).toBe(false);
  });

  it('type=article, tags가 빈 배열이면 article:tag를 포함하지 않아야 한다', () => {
    const result = buildMeta({ ...baseOptions, tags: [] });

    expect(result.some((tag) => 'property' in tag && tag.property === 'article:tag')).toBe(false);
  });
});

// ============================================================================
// Unit 테스트: buildMeta - website 타입
// ============================================================================

describe('buildMeta - website 타입', () => {
  it('type=website일 때 article 관련 태그를 포함하지 않아야 한다', () => {
    const result = buildMeta({
      title: '홈',
      description: '홈 설명',
      type: 'website',
      publishedTime: '2024-01-01T00:00:00Z', // 전달해도 포함되지 않아야 함
      tags: ['react'], // 전달해도 포함되지 않아야 함
    });

    expect(result.some((tag) => 'property' in tag && tag.property === 'article:published_time')).toBe(false);
    expect(result.some((tag) => 'property' in tag && tag.property === 'article:tag')).toBe(false);
  });
});

// ============================================================================
// Unit 테스트: buildCanonicalLink
// ============================================================================

describe('buildCanonicalLink', () => {
  it('href에 SITE_URL + path가 포함되어야 한다', () => {
    const path = '/ko/posts/hello-world';
    const result = buildCanonicalLink(path);

    expect(result).toHaveLength(1);
    expect(result[0].rel).toBe('canonical');
    expect(result[0].href).toBe(`${SITE_URL}${path}`);
  });

  it('루트 경로("/")에 대해서도 올바른 URL을 반환해야 한다', () => {
    const result = buildCanonicalLink('/');

    expect(result[0].href).toBe(`${SITE_URL}/`);
  });
});

// ============================================================================
// Unit 테스트: getHomeDescription
// ============================================================================

describe('getHomeDescription', () => {
  it('ko 로케일에서 한국어 설명을 반환해야 한다', () => {
    const result = getHomeDescription('ko');

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    // 한국어 설명이 반환되어야 함
    expect(result).toContain('블로그');
  });

  it('en 로케일에서 영어 설명을 반환해야 한다', () => {
    const result = getHomeDescription('en');

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result).toContain('blog');
  });

  it('ja 로케일에서 일본어 설명을 반환해야 한다', () => {
    const result = getHomeDescription('ja');

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result).toContain('ブログ');
  });

  it('알 수 없는 로케일에서 기본값(한국어)을 반환해야 한다', () => {
    const koResult = getHomeDescription('ko');
    const unknownResult = getHomeDescription('unknown');

    expect(unknownResult).toBe(koResult);
  });
});

// ============================================================================
// Unit 테스트: getAboutDescription
// ============================================================================

describe('getAboutDescription', () => {
  it('ko 로케일에서 한국어 설명을 반환해야 한다', () => {
    const result = getAboutDescription('ko');

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result).toContain('chan-ok.com');
  });

  it('en 로케일에서 영어 설명을 반환해야 한다', () => {
    const result = getAboutDescription('en');

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result).toContain('chan-ok.com');
  });

  it('ja 로케일에서 일본어 설명을 반환해야 한다', () => {
    const result = getAboutDescription('ja');

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result).toContain('chan-ok.com');
  });

  it('알 수 없는 로케일에서 기본값(한국어)을 반환해야 한다', () => {
    const koResult = getAboutDescription('ko');
    const unknownResult = getAboutDescription('unknown');

    expect(unknownResult).toBe(koResult);
  });
});

// ============================================================================
// Unit 테스트: getPostsDescription
// ============================================================================

describe('getPostsDescription', () => {
  it('ko 로케일에서 한국어 설명을 반환해야 한다', () => {
    const result = getPostsDescription('ko');

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result).toContain('포스트');
  });

  it('en 로케일에서 영어 설명을 반환해야 한다', () => {
    const result = getPostsDescription('en');

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result).toContain('posts');
  });

  it('ja 로케일에서 일본어 설명을 반환해야 한다', () => {
    const result = getPostsDescription('ja');

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    // 일본어 포스트 목록 설명
    expect(result).toContain('一覧');
  });

  it('알 수 없는 로케일에서 기본값(한국어)을 반환해야 한다', () => {
    const koResult = getPostsDescription('ko');
    const unknownResult = getPostsDescription('unknown');

    expect(unknownResult).toBe(koResult);
  });
});

// ============================================================================
// Property-Based 테스트: buildMeta 항상 배열 반환 + title 포함
// ============================================================================

describe('buildMeta - Property-Based 테스트', () => {
  /**
   * 임의의 title/description 조합에서 buildMeta 결과가 항상 배열이고
   * title을 포함하는지 검증한다.
   * 공백 문자열은 필터링한다.
   */
  const metaOptionsArb = fc.record({
    title: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
    description: fc.string({ minLength: 0, maxLength: 300 }),
  });

  it('임의의 title/description 조합에서 항상 배열을 반환하고 title을 포함해야 한다', () => {
    fc.assert(
      fc.property(metaOptionsArb, ({ title, description }) => {
        const result = buildMeta({ title, description });

        // 항상 배열이어야 한다
        expect(Array.isArray(result)).toBe(true);
        // 비어 있지 않아야 한다
        expect(result.length).toBeGreaterThan(0);
        // title을 포함해야 한다 ({ title } 형식)
        expect(result.some((tag) => 'title' in tag && tag.title === title)).toBe(true);
      }),
      { numRuns: 20 }
    );
  });

  it('type=article로 설정하면 항상 og:type이 article인 태그가 포함되어야 한다', () => {
    fc.assert(
      fc.property(metaOptionsArb, ({ title, description }) => {
        const result = buildMeta({ title, description, type: 'article' });

        expect(
          result.some(
            (tag) => 'property' in tag && tag.property === 'og:type' && tag.content === 'article'
          )
        ).toBe(true);
      }),
      { numRuns: 20 }
    );
  });
});
