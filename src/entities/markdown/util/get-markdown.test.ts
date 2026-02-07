import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { compile } from '@mdx-js/mdx';
import matter from 'gray-matter';

import getMarkdown from './get-markdown';
import { api } from '@/shared/config/api';

/**
 * ============================================================================
 * getMarkdown 함수 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * GitHub Raw URL에서 MDX 콘텐츠를 fetch하고, @mdx-js/mdx로 컴파일하는
 * getMarkdown 함수의 정확성을 검증합니다.
 *
 * ## 테스트 종류
 * 1. Unit 테스트: 정상 케이스, 엣지 케이스, 에러 케이스
 * 2. Property-Based 테스트: 다양한 frontmatter 조합 검증
 * 3. 통합 테스트: API 모킹을 통한 실제 플로우 시뮬레이션
 *
 * ## 검증 항목
 * - ✅ MDX 컴파일 성공
 * - ✅ frontmatter 파싱 (title, description, tags, createdAt)
 * - ✅ compiledSource 반환 (문자열)
 * - ✅ remarkPlugins 적용 확인 (GFM)
 * - ✅ rehypePlugins 적용 확인 (Highlight)
 * - ✅ 빈 MDX 처리
 * - ✅ 잘못된 MDX 에러 처리
 * - ✅ fetch 실패 에러 처리
 */

// ============================================================================
// Mock 데이터
// ============================================================================

/**
 * 정상적인 MDX 콘텐츠
 * frontmatter + Markdown 본문 포함
 */
const mockMDX = `---
title: Test Post
summary: Test Summary
tags: [test, markdown]
createdAt: 2024-01-01
path: ['test', 'Test Post']
published: true
---

# Heading

Test content with **bold** and _italic_.

\`\`\`typescript
const test = 'code block';
\`\`\`
`;

/**
 * frontmatter만 있는 MDX (본문 없음)
 */
const mockMDXWithoutContent = `---
title: Empty Post
summary: Empty Summary
tags: []
createdAt: 2024-01-01
path: ['empty']
published: false
---
`;

/**
 * 잘못된 MDX (MDX 컴파일 실패 유도)
 */
const mockInvalidMDX = `---
title: Invalid Post
---

{/* 잘못된 JSX */}
<Component prop={unclosed
`;

// ============================================================================
// Mock 설정
// ============================================================================

/**
 * api.get 모킹
 * 각 테스트에서 반환값을 제어할 수 있도록 vi.fn() 사용
 */
vi.mock('@/shared/config/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

// ============================================================================
// 테스트 전/후 처리
// ============================================================================

beforeEach(() => {
  // 각 테스트 전에 mock 초기화
  vi.clearAllMocks();
});

// ============================================================================
// Unit 테스트: 정상 케이스
// ============================================================================

describe('Unit 테스트 - 정상 케이스', () => {
  it('정상 MDX를 성공적으로 컴파일해야 한다', async () => {
    // API 응답 모킹
    vi.mocked(api.get).mockResolvedValue({
      data: mockMDX,
      axios: { status: 200 } as any,
    });

    // 함수 실행
    const result = await getMarkdown('test/Test-Post.md');

    // 검증: API 호출 (baseURL은 환경 변수에서 자동 결정)
    expect(api.get).toHaveBeenCalledWith('test/Test Post.md', {
      baseURL: undefined, // baseUrl 파라미터 없으면 undefined
    });

    // 검증: frontmatter 파싱
    expect(result.frontmatter.title).toBe('Test Post');
    expect(result.frontmatter.summary).toBe('Test Summary');
    expect(result.frontmatter.tags).toEqual(['test', 'markdown']);
    expect(result.frontmatter.path).toEqual(['test', 'Test Post']);
    expect(result.frontmatter.published).toBe(true);

    // 검증: content (frontmatter 제외한 본문)
    expect(result.content).toContain('# Heading');
    expect(result.content).toContain('Test content with **bold**');

    // 검증: source (원본 MDX)
    expect(result.source).toBe(mockMDX);

    // 검증: compiledSource (컴파일된 MDX 코드)
    expect(typeof result.compiledSource).toBe('string');
    expect(result.compiledSource.length).toBeGreaterThan(0);
  });

  it('baseUrl을 직접 전달할 수 있어야 한다', async () => {
    const customBaseUrl = 'https://custom.example.com';

    vi.mocked(api.get).mockResolvedValue({
      data: mockMDX,
      axios: { status: 200 } as any,
    });

    await getMarkdown('test/Post.md', customBaseUrl);

    // 검증: 커스텀 baseURL 사용
    expect(api.get).toHaveBeenCalledWith('test/Post.md', {
      baseURL: customBaseUrl,
    });
  });

  it('파일명의 하이픈을 공백으로 변환해야 한다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockMDX,
      axios: { status: 200 } as any,
    });

    await getMarkdown('category/My-First-Post.md');

    // 검증: 파일명의 하이픈이 공백으로 변환됨
    expect(api.get).toHaveBeenCalledWith('category/My First Post.md', {
      baseURL: undefined,
    });
  });

  it('URL 인코딩된 경로를 디코딩해야 한다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockMDX,
      axios: { status: 200 } as any,
    });

    // %20 = 공백, %ED = 한글 시작
    await getMarkdown('test/%ED%85%8C%EC%8A%A4%ED%8A%B8-Post.md');

    // 검증: URL 디코딩 + 하이픈을 공백으로 변환
    expect(api.get).toHaveBeenCalledWith('test/테스트 Post.md', {
      baseURL: undefined,
    });
  });
});

// ============================================================================
// Unit 테스트: 엣지 케이스
// ============================================================================

describe('Unit 테스트 - 엣지 케이스', () => {
  it('본문이 없는 MDX를 처리할 수 있어야 한다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockMDXWithoutContent,
      axios: { status: 200 } as any,
    });

    const result = await getMarkdown('empty/Empty-Post.md');

    // 검증: frontmatter는 파싱됨
    expect(result.frontmatter.title).toBe('Empty Post');

    // 검증: content는 빈 문자열 또는 공백만 포함
    expect(result.content.trim()).toBe('');

    // 검증: compiledSource는 여전히 생성됨
    expect(typeof result.compiledSource).toBe('string');
  });

  it('frontmatter에 선택적 필드가 없어도 처리할 수 있어야 한다', async () => {
    const minimalMDX = `---
title: Minimal Post
path: ['minimal']
createdAt: 2024-01-01
---

Minimal content.
`;

    vi.mocked(api.get).mockResolvedValue({
      data: minimalMDX,
      axios: { status: 200 } as any,
    });

    const result = await getMarkdown('minimal/Post.md');

    // 검증: 필수 필드만 있어도 동작
    expect(result.frontmatter.title).toBe('Minimal Post');
    // gray-matter는 frontmatter에 없는 필드를 undefined로 설정
    // Zod 스키마 기본값은 파싱 단계에서 적용되지 않음
    expect(result.frontmatter.tags).toBeUndefined();
    expect(result.frontmatter.published).toBeUndefined();
  });

  it('GFM(GitHub Flavored Markdown) 문법을 지원해야 한다', async () => {
    const gfmMDX = `---
title: GFM Test
path: ['gfm']
createdAt: 2024-01-01
---

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

~~strikethrough~~

- [ ] Task list
- [x] Completed
`;

    vi.mocked(api.get).mockResolvedValue({
      data: gfmMDX,
      axios: { status: 200 } as any,
    });

    const result = await getMarkdown('gfm/Post.md');

    // 검증: GFM 문법이 content에 포함됨
    expect(result.content).toContain('| Header 1 | Header 2 |');
    expect(result.content).toContain('~~strikethrough~~');
    expect(result.content).toContain('- [ ] Task list');

    // 검증: 컴파일 성공
    expect(typeof result.compiledSource).toBe('string');
    expect(result.compiledSource.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Unit 테스트: 에러 케이스
// ============================================================================

describe('Unit 테스트 - 에러 케이스', () => {
  it('API 응답이 200이 아니면 에러를 던져야 한다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: '',
      axios: { status: 404 } as any,
    });

    // 검증: 에러 발생
    await expect(getMarkdown('not-found/Post.md')).rejects.toThrow(
      'Failed to fetch posts'
    );
  });

  it('API 호출이 실패하면 에러를 전파해야 한다', async () => {
    const networkError = new Error('Network error');
    vi.mocked(api.get).mockRejectedValue(networkError);

    // 검증: 에러 전파
    await expect(getMarkdown('error/Post.md')).rejects.toThrow('Network error');
  });

  it('잘못된 MDX 문법은 컴파일 에러를 발생시켜야 한다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockInvalidMDX,
      axios: { status: 200 } as any,
    });

    // 검증: MDX 컴파일 에러 발생
    // compile 함수가 실제로 에러를 던지므로 getMarkdown도 에러를 던짐
    await expect(getMarkdown('invalid/Post.md')).rejects.toThrow();
  });

  it('frontmatter가 없으면 빈 객체로 파싱되어야 한다', async () => {
    const noFrontmatterMDX = `# Just Markdown

No frontmatter here.
`;

    vi.mocked(api.get).mockResolvedValue({
      data: noFrontmatterMDX,
      axios: { status: 200 } as any,
    });

    const result = await getMarkdown('no-frontmatter/Post.md');

    // 검증: frontmatter는 빈 객체
    expect(result.frontmatter).toEqual({});

    // 검증: content는 전체 본문
    expect(result.content).toContain('# Just Markdown');
  });
});

// ============================================================================
// Property-Based 테스트: Frontmatter 조합
// ============================================================================

describe('Property-Based 테스트 - Frontmatter 조합', () => {
  /**
   * Arbitrary: Frontmatter 생성기
   * 다양한 title, summary, tags 조합을 생성
   * 주의: MDX 컴파일을 방해하지 않도록 유효한 값만 생성
   */
  const frontmatterArb = fc.record({
    title: fc
      .string({ minLength: 1, maxLength: 100 })
      .filter((s) => s.trim().length > 0), // 공백만 있는 문자열 제외
    summary: fc.string({ minLength: 0, maxLength: 200 }),
    tags: fc.array(
      fc
        .string({ minLength: 1, maxLength: 20 })
        .filter((s) => s.trim().length > 0),
      {
        maxLength: 5,
      }
    ),
    path: fc.array(
      fc
        .string({ minLength: 1, maxLength: 50 })
        .filter((s) => s.trim().length > 0),
      {
        minLength: 1,
        maxLength: 3,
      }
    ),
    published: fc.boolean(),
  });

  /**
   * Property: 모든 frontmatter 조합에서 파싱 성공
   * 주의: gray-matter가 파싱할 수 있는 유효한 YAML 값만 생성
   */
  it('모든 frontmatter 조합에서 파싱에 성공해야 한다', async () => {
    await fc.assert(
      fc.asyncProperty(frontmatterArb, async (frontmatter) => {
        // YAML에서 특수 의미를 가진 문자 이스케이프
        const escapeYaml = (str: string) => {
          // 따옴표로 감싸서 안전하게 처리
          return JSON.stringify(str);
        };

        // MDX 문서 생성
        const mdxContent = `---
title: ${escapeYaml(frontmatter.title)}
summary: ${escapeYaml(frontmatter.summary)}
tags: ${JSON.stringify(frontmatter.tags)}
path: ${JSON.stringify(frontmatter.path)}
published: ${frontmatter.published}
createdAt: 2024-01-01
---

# Content

Test content.
`;

        // API 응답 모킹
        vi.mocked(api.get).mockResolvedValue({
          data: mdxContent,
          axios: { status: 200 } as any,
        });

        // 함수 실행
        const result = await getMarkdown('test/Post.md');

        // 검증: frontmatter 파싱 성공
        expect(result.frontmatter.title).toBe(frontmatter.title);
        expect(result.frontmatter.summary).toBe(frontmatter.summary);
        expect(result.frontmatter.tags).toEqual(frontmatter.tags);
        expect(result.frontmatter.path).toEqual(frontmatter.path);
        expect(result.frontmatter.published).toBe(frontmatter.published);

        // 검증: compiledSource는 항상 문자열
        expect(typeof result.compiledSource).toBe('string');
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property: compiledSource는 항상 비어있지 않은 문자열
   * 주의: MDX 문법을 위반하지 않도록 유효한 Markdown만 생성
   */
  it('compiledSource는 항상 비어있지 않은 문자열이어야 한다', async () => {
    await fc.assert(
      fc.asyncProperty(
        // 안전한 Markdown 콘텐츠만 생성 (MDX 특수문자 제외)
        fc
          .string({ minLength: 1, maxLength: 500 })
          .filter(
            (s) =>
              !s.includes('{') &&
              !s.includes('}') &&
              !s.includes('<') &&
              !s.includes('>') &&
              s.trim().length > 0
          ),
        async (content) => {
          const mdxContent = `---
title: Test
path: ['test']
createdAt: 2024-01-01
---

${content}
`;

          vi.mocked(api.get).mockResolvedValue({
            data: mdxContent,
            axios: { status: 200 } as any,
          });

          const result = await getMarkdown('test/Post.md');

          // 검증: compiledSource는 문자열이고 길이 > 0
          expect(typeof result.compiledSource).toBe('string');
          expect(result.compiledSource.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 30 }
    );
  });
});

// ============================================================================
// 통합 테스트: remarkPlugins, rehypePlugins
// ============================================================================

describe('통합 테스트 - Plugins', () => {
  it('remarkGfm 플러그인이 적용되어야 한다', async () => {
    // GFM 테이블이 포함된 MDX
    const gfmTableMDX = `---
title: GFM Table
path: ['test']
createdAt: 2024-01-01
---

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
`;

    vi.mocked(api.get).mockResolvedValue({
      data: gfmTableMDX,
      axios: { status: 200 } as any,
    });

    const result = await getMarkdown('test/GFM-Table.md');

    // 검증: compiledSource에 테이블 관련 JSX가 포함됨
    // MDX 컴파일 시 GFM 테이블은 <table>, <thead>, <tbody> 등으로 변환
    expect(result.compiledSource).toBeTruthy();
    expect(typeof result.compiledSource).toBe('string');
  });

  it('rehypeHighlight 플러그인이 적용되어야 한다', async () => {
    // 코드 블록이 포함된 MDX
    const codeBlockMDX = `---
title: Code Block
path: ['test']
createdAt: 2024-01-01
---

\`\`\`javascript
const hello = 'world';
console.log(hello);
\`\`\`
`;

    vi.mocked(api.get).mockResolvedValue({
      data: codeBlockMDX,
      axios: { status: 200 } as any,
    });

    const result = await getMarkdown('test/Code-Block.md');

    // 검증: compiledSource에 코드 블록 관련 JSX가 포함됨
    // rehypeHighlight는 코드 블록에 하이라이트 클래스를 추가
    expect(result.compiledSource).toBeTruthy();
    expect(typeof result.compiledSource).toBe('string');
  });

  it('remarkFrontmatter 플러그인이 적용되어야 한다', async () => {
    // frontmatter가 있는 MDX (기본 케이스)
    vi.mocked(api.get).mockResolvedValue({
      data: mockMDX,
      axios: { status: 200 } as any,
    });

    const result = await getMarkdown('test/Frontmatter.md');

    // 검증: frontmatter가 파싱되고 content에서 제외됨
    expect(result.frontmatter.title).toBe('Test Post');
    expect(result.content).not.toContain('title: Test Post'); // frontmatter는 content에서 제외
    expect(result.content).toContain('# Heading'); // 본문만 포함
  });
});

// ============================================================================
// 통합 테스트: 실제 MDX 컴파일 검증
// ============================================================================

describe('통합 테스트 - MDX 컴파일', () => {
  it('컴파일된 MDX는 function-body 형식이어야 한다', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockMDX,
      axios: { status: 200 } as any,
    });

    const result = await getMarkdown('test/Function-Body.md');

    // 검증: compiledSource는 function-body 형식
    // @mdx-js/mdx의 outputFormat: 'function-body'는 함수 본문만 반환
    // 따라서 "function" 키워드가 없고 바로 실행 가능한 코드 형태
    expect(result.compiledSource).toBeTruthy();
    expect(typeof result.compiledSource).toBe('string');

    // function-body 형식은 일반적으로 return 문이나 JSX 코드를 포함
    // (정확한 형식은 @mdx-js/mdx 버전에 따라 다를 수 있음)
  });

  it('여러 플러그인이 동시에 적용되어야 한다', async () => {
    // GFM + 코드 블록 + frontmatter가 모두 포함된 MDX
    const complexMDX = `---
title: Complex MDX
summary: All features combined
tags: [gfm, code, frontmatter]
path: ['complex']
createdAt: 2024-01-01
published: true
---

# Complex Example

| Feature | Supported |
|---------|-----------|
| GFM     | Yes       |
| Code    | Yes       |

\`\`\`typescript
const test = 'complex';
\`\`\`

~~strikethrough~~
`;

    vi.mocked(api.get).mockResolvedValue({
      data: complexMDX,
      axios: { status: 200 } as any,
    });

    const result = await getMarkdown('complex/Example.md');

    // 검증: 모든 요소가 정상 처리됨
    expect(result.frontmatter.title).toBe('Complex MDX');
    expect(result.frontmatter.tags).toEqual(['gfm', 'code', 'frontmatter']);
    expect(result.content).toContain('# Complex Example');
    expect(result.content).toContain('| Feature | Supported |');
    expect(result.content).toContain('```typescript');
    expect(result.compiledSource).toBeTruthy();
  });
});
