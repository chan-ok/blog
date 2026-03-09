import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { AxiosResponse } from 'axios';

import { getFrontmatter } from './get-frontmatter';
import { api } from '@/5-shared/config/api';

/**
 * ============================================================================
 * getFrontmatter 함수 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * MDX 파일에서 frontmatter만 빠르게 추출하는 getFrontmatter 함수를 검증합니다.
 * MDX 컴파일 없이 gray-matter 파싱만 수행합니다.
 *
 * ## 검증 항목
 * - ✅ 유효한 frontmatter 파싱 (title, tags, createdAt, series 포함)
 * - ✅ baseUrl 파라미터 전달/미전달
 * - ✅ 파일명 언더바 → 공백 변환
 * - ✅ URL 인코딩된 경로 디코딩
 * - ✅ partial(): 일부 필드 없어도 파싱 성공
 * - ✅ series 필드 포함 frontmatter 파싱
 * - ✅ API 404 시 에러 throw
 * - ✅ API throw 시 에러 전파
 * - ✅ PBT: 임의의 title/series 조합에서 파싱 성공
 */

// ============================================================================
// Mock 데이터
// ============================================================================

/** 모든 주요 필드를 포함한 정상 frontmatter */
const mockMDXFull = `---
title: 테스트 포스트
tags: [react, typescript]
createdAt: 2024-03-01
path: ['2024', '테스트 포스트']
published: true
series: test-series
summary: 요약 텍스트
---

본문 내용입니다.
`;

/** series 필드가 없는 frontmatter */
const mockMDXNoSeries = `---
title: 시리즈 없는 포스트
tags: [vue]
createdAt: 2024-04-01
path: ['2024', '시리즈 없는 포스트']
published: true
---
`;

/** 최소 필드만 있는 frontmatter (partial 지원 확인) */
const mockMDXMinimal = `---
title: 최소 포스트
---
`;

// ============================================================================
// Mock 설정
// ============================================================================

vi.mock('@/5-shared/config/api', () => ({ api: { get: vi.fn() } }));

// ============================================================================
// 테스트 전/후 처리
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('VITE_GIT_RAW_URL', undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

// ============================================================================
// Unit 테스트: 정상 케이스
// ============================================================================

describe('Unit 테스트 - 정상 케이스', () => {
  it('유효한 frontmatter를 올바르게 파싱해야 한다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockMDXFull,
      axios: { status: 200 } as AxiosResponse,
    });

    const result = await getFrontmatter('2024/테스트 포스트.md');

    expect(result.title).toBe('테스트 포스트');
    expect(result.tags).toEqual(['react', 'typescript']);
    expect(result.published).toBe(true);
    expect(result.series).toBe('test-series');
    expect(result.summary).toBe('요약 텍스트');
  });

  it('baseUrl 파라미터를 직접 전달할 수 있어야 한다', async () => {
    const customBaseUrl = 'https://custom.example.com';

    vi.mocked(api.get).mockResolvedValue({
      data: mockMDXFull,
      axios: { status: 200 } as AxiosResponse,
    });

    await getFrontmatter('2024/Post.md', customBaseUrl);

    expect(api.get).toHaveBeenCalledWith('2024/Post.md', {
      baseURL: customBaseUrl,
    });
  });

  it('baseUrl 없이 호출하면 환경 변수를 사용해야 한다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockMDXFull,
      axios: { status: 200 } as AxiosResponse,
    });

    await getFrontmatter('2024/Post.md');

    // baseUrl 미전달 시 VITE_GIT_RAW_URL(=undefined)이 사용됨
    expect(api.get).toHaveBeenCalledWith('2024/Post.md', {
      baseURL: undefined,
    });
  });

  it('파일명의 언더바를 공백으로 변환해야 한다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockMDXFull,
      axios: { status: 200 } as AxiosResponse,
    });

    await getFrontmatter('category/My_First_Post.md');

    // 언더바가 공백으로 변환됨
    expect(api.get).toHaveBeenCalledWith('category/My First Post.md', {
      baseURL: undefined,
    });
  });

  it('URL 인코딩된 경로를 디코딩해야 한다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockMDXFull,
      axios: { status: 200 } as AxiosResponse,
    });

    // %ED%85%8C%EC%8A%A4%ED%8A%B8 = "테스트", 언더바를 공백으로 변환
    await getFrontmatter('test/%ED%85%8C%EC%8A%A4%ED%8A%B8_Post.md');

    // URL 디코딩 + 언더바를 공백으로 변환
    expect(api.get).toHaveBeenCalledWith('test/테스트 Post.md', {
      baseURL: undefined,
    });
  });

  it('series 필드를 포함한 frontmatter를 파싱해야 한다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockMDXFull,
      axios: { status: 200 } as AxiosResponse,
    });

    const result = await getFrontmatter('2024/Post.md');

    expect(result.series).toBe('test-series');
  });

  it('series 필드가 없으면 undefined를 반환해야 한다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockMDXNoSeries,
      axios: { status: 200 } as AxiosResponse,
    });

    const result = await getFrontmatter('2024/Post.md');

    expect(result.series).toBeUndefined();
  });
});

// ============================================================================
// Unit 테스트: partial() 지원
// ============================================================================

describe('Unit 테스트 - partial() 지원', () => {
  it('일부 필드가 없어도 파싱에 성공해야 한다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockMDXMinimal,
      axios: { status: 200 } as AxiosResponse,
    });

    // partial()이므로 에러 없이 파싱되어야 함
    const result = await getFrontmatter('minimal/Post.md');

    expect(result.title).toBe('최소 포스트');
    // 기본값: tags=[], published=false
    expect(result.tags).toEqual([]);
    expect(result.published).toBe(false);
    // 없는 필드는 undefined
    expect(result.createdAt).toBeUndefined();
    expect(result.series).toBeUndefined();
  });

  it('frontmatter가 전혀 없어도 빈 객체로 파싱되어야 한다', async () => {
    const noFrontmatterMDX = `# 제목만 있는 문서

frontmatter가 없습니다.
`;

    vi.mocked(api.get).mockResolvedValue({
      data: noFrontmatterMDX,
      axios: { status: 200 } as AxiosResponse,
    });

    const result = await getFrontmatter('no-frontmatter/Post.md');

    expect(result.title).toBeUndefined();
    expect(result.tags).toEqual([]);
    expect(result.published).toBe(false);
  });
});

// ============================================================================
// Unit 테스트: 에러 케이스
// ============================================================================

describe('Unit 테스트 - 에러 케이스', () => {
  it('API 404 응답 시 에러를 던져야 한다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: '',
      axios: { status: 404 } as AxiosResponse<string>,
    });

    await expect(getFrontmatter('not-found/Post.md')).rejects.toThrow(
      'Failed to fetch markdown file'
    );
  });

  it('API throw 시 에러를 전파해야 한다', async () => {
    const networkError = new Error('Network error');
    vi.mocked(api.get).mockRejectedValue(networkError);

    await expect(getFrontmatter('error/Post.md')).rejects.toThrow(
      'Network error'
    );
  });
});

// ============================================================================
// Property-Based 테스트: 임의의 title/series 조합
// ============================================================================

describe('Property-Based 테스트 - Frontmatter 조합', () => {
  it('임의의 title/series 조합에서 파싱에 성공해야 한다', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc
            .string({ minLength: 1, maxLength: 100 })
            .filter((s) => s.trim().length > 0),
          series: fc.option(
            fc
              .string({ minLength: 1, maxLength: 50 })
              .filter((s) => s.trim().length > 0),
            { nil: undefined }
          ),
        }),
        async ({ title, series }) => {
          // YAML에서 특수 문자를 안전하게 처리하기 위해 JSON.stringify 사용
          const escapeYaml = (str: string) => JSON.stringify(str);

          const seriesLine = series
            ? `series: ${escapeYaml(series)}\n`
            : '';

          const mdxContent = `---
title: ${escapeYaml(title)}
createdAt: 2024-01-01
${seriesLine}---

본문 내용.
`;

          vi.mocked(api.get).mockResolvedValue({
            data: mdxContent,
            axios: { status: 200 } as AxiosResponse,
          });

          const result = await getFrontmatter('test/Post.md');

          // title, series가 정확히 파싱되어야 함
          expect(result.title).toBe(title);
          if (series !== undefined) {
            expect(result.series).toBe(series);
          } else {
            expect(result.series).toBeUndefined();
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
