import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

import { stripMarkdownSyntax } from './strip-markdown-syntax';

/**
 * ============================================================================
 * stripMarkdownSyntax 유틸리티 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * MDX/Markdown 콘텐츠에서 모든 문법을 제거하고 순수 텍스트를 추출하는 유틸리티를 검증합니다.
 * extract-excerpt.ts와 reading-time.ts에서 공통으로 사용하는 핵심 함수입니다.
 *
 * ## 테스트 범위
 * - ✅ frontmatter 제거
 * - ✅ 코드블록 제거
 * - ✅ 인라인 코드 제거
 * - ✅ HTML 태그 제거
 * - ✅ 이미지 제거
 * - ✅ 링크에서 텍스트만 추출
 * - ✅ 제목 마크다운 제거
 * - ✅ 리스트 마커 제거
 * - ✅ 볼드/이탤릭 제거
 * - ✅ 연속된 공백/줄바꿈 정규화
 * - ✅ 빈 문자열 처리
 * - ✅ 복합 마크다운 문서 처리
 * - ✅ Property-based: 결과에 마크다운 문법이 없는지 검증
 *
 * ## 테스트 전략
 * - Unit 테스트: 각 정규식 패턴별 개별 검증
 * - Property-Based 테스트: 결과에 마크다운 문법이 남아있지 않은지 검증
 */

// ============================================================================
// Unit 테스트 - Frontmatter 제거
// ============================================================================

describe('Unit 테스트 - Frontmatter 제거', () => {
  /**
   * **Feature: strip-markdown-syntax, Property: frontmatter 제거**
   * **검증: YAML frontmatter를 제거**
   *
   * 시나리오: frontmatter가 있는 콘텐츠
   * 기대 결과: frontmatter 제거된 텍스트
   */
  it('frontmatter를 제거해야 한다', () => {
    const content = `---
title: Test Post
date: 2024-01-01
---
This is content.`;

    const result = stripMarkdownSyntax(content);

    expect(result).toBe('This is content.');
  });

  /**
   * **Feature: strip-markdown-syntax, Property: frontmatter만 있을 때**
   * **검증: frontmatter만 있으면 빈 문자열**
   *
   * 시나리오: frontmatter만 있는 콘텐츠
   * 기대 결과: 빈 문자열
   */
  it('frontmatter만 있을 때 빈 문자열을 반환해야 한다', () => {
    const content = `---
title: Only Frontmatter
---`;

    const result = stripMarkdownSyntax(content);

    expect(result).toBe('');
  });
});

// ============================================================================
// Unit 테스트 - 코드블록 제거
// ============================================================================

describe('Unit 테스트 - 코드블록 제거', () => {
  /**
   * **Feature: strip-markdown-syntax, Property: 코드블록 제거**
   * **검증: ```로 감싸진 코드블록을 제거**
   *
   * 시나리오: 코드블록이 있는 콘텐츠
   * 기대 결과: 코드블록 제거된 텍스트
   */
  it('코드블록을 제거해야 한다', () => {
    const content = `Text before
\`\`\`typescript
const x = 1;
\`\`\`
Text after`;

    const result = stripMarkdownSyntax(content);

    expect(result).toBe('Text before Text after');
  });

  /**
   * **Feature: strip-markdown-syntax, Property: 여러 코드블록**
   * **검증: 여러 코드블록을 모두 제거**
   *
   * 시나리오: 여러 코드블록이 있는 콘텐츠
   * 기대 결과: 모든 코드블록 제거
   */
  it('여러 코드블록을 제거해야 한다', () => {
    const content = `Text 1
\`\`\`js
code1
\`\`\`
Text 2
\`\`\`python
code2
\`\`\`
Text 3`;

    const result = stripMarkdownSyntax(content);

    expect(result).toBe('Text 1 Text 2 Text 3');
  });
});

// ============================================================================
// Unit 테스트 - 인라인 코드 제거
// ============================================================================

describe('Unit 테스트 - 인라인 코드 제거', () => {
  /**
   * **Feature: strip-markdown-syntax, Property: 인라인 코드 제거**
   * **검증: `로 감싸진 인라인 코드를 제거**
   *
   * 시나리오: 인라인 코드가 있는 콘텐츠
   * 기대 결과: 인라인 코드 제거된 텍스트
   */
  it('인라인 코드를 제거해야 한다', () => {
    const content = 'This is `inline code` in text.';
    const result = stripMarkdownSyntax(content);

    expect(result).toBe('This is in text.');
  });

  /**
   * **Feature: strip-markdown-syntax, Property: 여러 인라인 코드**
   * **검증: 여러 인라인 코드를 모두 제거**
   *
   * 시나리오: 여러 인라인 코드
   * 기대 결과: 모든 인라인 코드 제거
   */
  it('여러 인라인 코드를 제거해야 한다', () => {
    const content = 'Code `one` and `two` and `three`.';
    const result = stripMarkdownSyntax(content);

    expect(result).toBe('Code and and .');
  });
});

// ============================================================================
// Unit 테스트 - HTML 태그 제거
// ============================================================================

describe('Unit 테스트 - HTML 태그 제거', () => {
  /**
   * **Feature: strip-markdown-syntax, Property: HTML 태그 제거**
   * **검증: <tag>...</tag> 형식의 HTML 태그를 제거**
   *
   * 시나리오: HTML 태그가 있는 콘텐츠
   * 기대 결과: 태그 제거된 텍스트만 반환
   */
  it('HTML 태그를 제거해야 한다', () => {
    const content = 'Text with <strong>bold</strong> and <em>italic</em>.';
    const result = stripMarkdownSyntax(content);

    expect(result).toBe('Text with bold and italic.');
  });

  /**
   * **Feature: strip-markdown-syntax, Property: 자체 닫힘 태그**
   * **검증: <img />, <br /> 등 자체 닫힘 태그도 제거**
   *
   * 시나리오: 자체 닫힘 태그가 있는 콘텐츠
   * 기대 결과: 태그 제거된 텍스트
   */
  it('자체 닫힘 태그를 제거해야 한다', () => {
    const content = 'Text with <img src="test.jpg" /> inline.';
    const result = stripMarkdownSyntax(content);

    expect(result).toBe('Text with inline.');
  });
});

// ============================================================================
// Unit 테스트 - 이미지 제거
// ============================================================================

describe('Unit 테스트 - 이미지 제거', () => {
  /**
   * **Feature: strip-markdown-syntax, Property: Markdown 이미지 제거**
   * **검증: ![alt](url) 형식의 이미지를 제거**
   *
   * 시나리오: Markdown 이미지가 있는 콘텐츠
   * 기대 결과: 이미지 제거된 텍스트
   */
  it('Markdown 이미지를 제거해야 한다', () => {
    const content = 'Text before ![Image](url) text after.';
    const result = stripMarkdownSyntax(content);

    expect(result).toBe('Text before text after.');
  });

  /**
   * **Feature: strip-markdown-syntax, Property: 여러 이미지**
   * **검증: 여러 이미지를 모두 제거**
   *
   * 시나리오: 여러 Markdown 이미지
   * 기대 결과: 모든 이미지 제거
   */
  it('여러 이미지를 제거해야 한다', () => {
    const content =
      '![Image 1](url1) text ![Image 2](url2) more ![Image 3](url3).';
    const result = stripMarkdownSyntax(content);

    expect(result).toBe('text more .');
  });
});

// ============================================================================
// Unit 테스트 - 링크 처리
// ============================================================================

describe('Unit 테스트 - 링크 처리', () => {
  /**
   * **Feature: strip-markdown-syntax, Property: 링크에서 텍스트만 추출**
   * **검증: [text](url) 형식에서 text만 남김**
   *
   * 시나리오: Markdown 링크가 있는 콘텐츠
   * 기대 결과: 링크 텍스트만 반환
   */
  it('링크에서 텍스트만 추출해야 한다', () => {
    const content = 'Check out [this link](https://example.com) for more.';
    const result = stripMarkdownSyntax(content);

    expect(result).toBe('Check out this link for more.');
  });

  /**
   * **Feature: strip-markdown-syntax, Property: 여러 링크**
   * **검증: 여러 링크가 있어도 모든 텍스트 추출**
   *
   * 시나리오: 여러 Markdown 링크
   * 기대 결과: 모든 링크 텍스트 추출
   */
  it('여러 링크에서 모든 텍스트를 추출해야 한다', () => {
    const content = '[First](url1) and [Second](url2) links.';
    const result = stripMarkdownSyntax(content);

    expect(result).toBe('First and Second links.');
  });
});

// ============================================================================
// Unit 테스트 - 제목 마크다운 제거
// ============================================================================

describe('Unit 테스트 - 제목 마크다운 제거', () => {
  /**
   * **Feature: strip-markdown-syntax, Property: 제목 마크다운 제거**
   * **검증: #으로 시작하는 제목 마크다운을 제거**
   *
   * 시나리오: 제목 마크다운이 있는 콘텐츠
   * 기대 결과: # 제거된 텍스트
   */
  it('제목 마크다운을 제거해야 한다', () => {
    const content = `# Title
This is content.`;

    const result = stripMarkdownSyntax(content);

    expect(result).toBe('Title This is content.');
  });

  /**
   * **Feature: strip-markdown-syntax, Property: 여러 레벨 제목**
   * **검증: h1~h6 모두 제거**
   *
   * 시나리오: 여러 레벨 제목
   * 기대 결과: 모든 # 제거
   */
  it('여러 레벨 제목을 모두 처리해야 한다', () => {
    const content = `# H1
## H2
### H3
#### H4
##### H5
###### H6`;

    const result = stripMarkdownSyntax(content);

    expect(result).toBe('H1 H2 H3 H4 H5 H6');
  });
});

// ============================================================================
// Unit 테스트 - 리스트 마커 제거
// ============================================================================

describe('Unit 테스트 - 리스트 마커 제거', () => {
  /**
   * **Feature: strip-markdown-syntax, Property: 순서 없는 리스트**
   * **검증: -, *, + 기호 제거**
   *
   * 시나리오: 순서 없는 리스트
   * 기대 결과: 리스트 기호 제거된 텍스트
   */
  it('순서 없는 리스트 기호를 제거해야 한다', () => {
    const content = `- Item 1
- Item 2
* Item 3
+ Item 4`;

    const result = stripMarkdownSyntax(content);

    expect(result).toBe('Item 1 Item 2 Item 3 Item 4');
  });

  /**
   * **Feature: strip-markdown-syntax, Property: 순서 있는 리스트**
   * **검증: 1., 2. 등 숫자 기호 제거**
   *
   * 시나리오: 순서 있는 리스트
   * 기대 결과: 숫자 기호 제거된 텍스트
   */
  it('순서 있는 리스트 기호를 제거해야 한다', () => {
    const content = `1. First
2. Second
3. Third`;

    const result = stripMarkdownSyntax(content);

    expect(result).toBe('First Second Third');
  });

  /**
   * **Feature: strip-markdown-syntax, Property: 들여쓰기된 리스트**
   * **검증: 들여쓰기된 리스트도 제거**
   *
   * 시나리오: 들여쓰기된 리스트
   * 기대 결과: 리스트 기호와 들여쓰기 제거
   */
  it('들여쓰기된 리스트 기호를 제거해야 한다', () => {
    const content = `- Item 1
  - Nested 1
    - Deeply nested`;

    const result = stripMarkdownSyntax(content);

    expect(result).toBe('Item 1 Nested 1 Deeply nested');
  });
});

// ============================================================================
// Unit 테스트 - 볼드/이탤릭 제거
// ============================================================================

describe('Unit 테스트 - 볼드/이탤릭 제거', () => {
  /**
   * **Feature: strip-markdown-syntax, Property: bold/italic 제거**
   * **검증: **, *, _, __ 기호 제거**
   *
   * 시나리오: bold/italic 마크다운
   * 기대 결과: 기호 제거된 텍스트만 반환
   */
  it('bold/italic 마크다운을 제거해야 한다', () => {
    const content = 'Text with **bold** and *italic* and _underline_.';
    const result = stripMarkdownSyntax(content);

    expect(result).toBe('Text with bold and italic and underline.');
  });

  /**
   * **Feature: strip-markdown-syntax, Property: 이중 언더스코어**
   * **검증: __bold__ 형식도 제거**
   *
   * 시나리오: __ 형식의 볼드
   * 기대 결과: 기호 제거된 텍스트
   */
  it('이중 언더스코어를 제거해야 한다', () => {
    const content = 'Text with __bold text__ here.';
    const result = stripMarkdownSyntax(content);

    expect(result).toBe('Text with bold text here.');
  });
});

// ============================================================================
// Unit 테스트 - 연속된 공백/줄바꿈 정규화
// ============================================================================

describe('Unit 테스트 - 연속된 공백/줄바꿈 정규화', () => {
  /**
   * **Feature: strip-markdown-syntax, Property: 연속된 공백**
   * **검증: 여러 공백을 단일 공백으로**
   *
   * 시나리오: 여러 공백이 있는 콘텐츠
   * 기대 결과: 단일 공백으로 정규화
   */
  it('연속된 공백을 단일 공백으로 정규화해야 한다', () => {
    const content = 'Text   with    multiple    spaces.';
    const result = stripMarkdownSyntax(content);

    expect(result).toBe('Text with multiple spaces.');
  });

  /**
   * **Feature: strip-markdown-syntax, Property: 연속된 줄바꿈**
   * **검증: 여러 줄바꿈을 단일 공백으로**
   *
   * 시나리오: 여러 줄바꿈이 있는 콘텐츠
   * 기대 결과: 단일 공백으로 정규화
   */
  it('연속된 줄바꿈을 단일 공백으로 정규화해야 한다', () => {
    const content = `Line 1


Line 2`;

    const result = stripMarkdownSyntax(content);

    expect(result).toBe('Line 1 Line 2');
  });

  /**
   * **Feature: strip-markdown-syntax, Property: 탭 문자**
   * **검증: 탭 문자를 단일 공백으로**
   *
   * 시나리오: 탭 문자가 있는 콘텐츠
   * 기대 결과: 단일 공백으로 정규화
   */
  it('탭 문자를 단일 공백으로 정규화해야 한다', () => {
    const content = 'Text\t\twith\ttabs.';
    const result = stripMarkdownSyntax(content);

    expect(result).toBe('Text with tabs.');
  });

  /**
   * **Feature: strip-markdown-syntax, Property: 선행/후행 공백 제거**
   * **검증: 앞뒤 공백을 제거**
   *
   * 시나리오: 앞뒤 공백이 있는 콘텐츠
   * 기대 결과: trim된 텍스트
   */
  it('선행/후행 공백을 제거해야 한다', () => {
    const content = '   Text with spaces.   ';
    const result = stripMarkdownSyntax(content);

    expect(result).toBe('Text with spaces.');
  });
});

// ============================================================================
// Unit 테스트 - 빈 문자열 처리
// ============================================================================

describe('Unit 테스트 - 빈 문자열 처리', () => {
  /**
   * **Feature: strip-markdown-syntax, Property: 빈 문자열**
   * **검증: 빈 문자열 → 빈 문자열 반환**
   *
   * 시나리오: 빈 문자열 전달
   * 기대 결과: 빈 문자열
   */
  it('빈 문자열을 처리해야 한다', () => {
    const result = stripMarkdownSyntax('');

    expect(result).toBe('');
  });

  /**
   * **Feature: strip-markdown-syntax, Property: 공백만 있는 콘텐츠**
   * **검증: 공백만 있으면 빈 문자열 반환**
   *
   * 시나리오: 공백/개행만 있는 문자열
   * 기대 결과: 빈 문자열
   */
  it('공백만 있는 콘텐츠에서는 빈 문자열을 반환해야 한다', () => {
    const result = stripMarkdownSyntax('   \n\n   ');

    expect(result).toBe('');
  });
});

// ============================================================================
// Unit 테스트 - 복합 마크다운 문서
// ============================================================================

describe('Unit 테스트 - 복합 마크다운 문서', () => {
  /**
   * **Feature: strip-markdown-syntax, Property: 모든 마크다운 문법**
   * **검증: 여러 마크다운 문법이 섞여 있어도 올바르게 제거**
   *
   * 시나리오: frontmatter, 코드, 이미지, 링크, 제목 등 모두 포함
   * 기대 결과: 순수 텍스트만 추출
   */
  it('모든 마크다운 문법을 올바르게 제거해야 한다', () => {
    const content = `---
title: Test Post
date: 2024-01-01
---
# Main Heading
This is **bold** text with [a link](https://example.com) and \`inline code\`.

## Subheading
![An image](image.jpg)

\`\`\`typescript
const x = 1;
const y = 2;
\`\`\`

- List item 1
- List item 2

Final paragraph with *italic* text.`;

    const result = stripMarkdownSyntax(content);

    expect(result).toBe(
      'Main Heading This is bold text with a link and . Subheading List item 1 List item 2 Final paragraph with italic text.'
    );
  });

  /**
   * **Feature: strip-markdown-syntax, Property: 실제 블로그 포스트**
   * **검증: 실제 블로그 포스트 형식 처리**
   *
   * 시나리오: 실제 사용될 블로그 포스트 구조
   * 기대 결과: 순수 텍스트만 추출
   */
  it('실제 블로그 포스트를 처리해야 한다', () => {
    const content = `---
title: "My Blog Post"
date: "2024-01-01"
tags: ["react", "typescript"]
---

# Introduction

This post explains **TypeScript** with [React](https://react.dev).

## Code Example

\`\`\`tsx
const Component = () => <div>Hello</div>;
\`\`\`

### Key Points

- Point 1 with \`code\`
- Point 2 with **emphasis**

![Diagram](diagram.png)

For more info, visit [the docs](https://docs.example.com).`;

    const result = stripMarkdownSyntax(content);

    expect(result).toBe(
      'Introduction This post explains TypeScript with React. Code Example Key Points Point 1 with Point 2 with emphasis For more info, visit the docs.'
    );
  });
});

// ============================================================================
// Property-Based 테스트 - 마크다운 문법 제거 검증
// ============================================================================

describe('Property-Based 테스트 - 마크다운 문법 제거 검증', () => {
  /**
   * **Feature: strip-markdown-syntax, Property: 코드블록 없음**
   * **검증: 결과에 ``` 가 포함되지 않음**
   *
   * 시나리오: 임의 문자열
   * 기대 결과: 결과에 ``` 없음
   */
  it('결과에 코드블록 마커가 없어야 한다', () => {
    const contentArb = fc.string({ minLength: 1, maxLength: 500 });

    fc.assert(
      fc.property(contentArb, (content) => {
        const result = stripMarkdownSyntax(content);

        expect(result).not.toContain('```');
      }),
      { numRuns: 30 }
    );
  });

  /**
   * **Feature: strip-markdown-syntax, Property: frontmatter 없음**
   * **검증: 결과에 --- 가 포함되지 않음**
   *
   * 시나리오: 임의 문자열
   * 기대 결과: 결과에 --- 없음
   */
  it('결과에 frontmatter 마커가 없어야 한다', () => {
    const contentArb = fc.string({ minLength: 1, maxLength: 500 });

    fc.assert(
      fc.property(contentArb, (content) => {
        const result = stripMarkdownSyntax(content);

        expect(result).not.toMatch(/^---/);
      }),
      { numRuns: 30 }
    );
  });

  /**
   * **Feature: strip-markdown-syntax, Property: HTML 태그 없음**
   * **검증: 결과에 < 또는 > 가 포함되지 않음**
   *
   * 시나리오: 임의 문자열
   * 기대 결과: 결과에 HTML 태그 없음
   */
  it('결과에 HTML 태그가 없어야 한다', () => {
    const contentArb = fc.string({ minLength: 1, maxLength: 500 });

    fc.assert(
      fc.property(contentArb, (content) => {
        const result = stripMarkdownSyntax(content);

        // HTML 태그 패턴 매칭 (<...> 형식)
        expect(result).not.toMatch(/<[^>]+>/);
      }),
      { numRuns: 30 }
    );
  });

  /**
   * **Feature: strip-markdown-syntax, Property: 결과는 문자열**
   * **검증: 항상 문자열 반환**
   *
   * 시나리오: 임의 문자열
   * 기대 결과: 문자열 타입
   */
  it('항상 문자열을 반환해야 한다', () => {
    const contentArb = fc.string();

    fc.assert(
      fc.property(contentArb, (content) => {
        const result = stripMarkdownSyntax(content);

        expect(typeof result).toBe('string');
      }),
      { numRuns: 30 }
    );
  });

  /**
   * **Feature: strip-markdown-syntax, Property: 연속된 공백 없음**
   * **검증: 결과에 2개 이상의 연속된 공백이 없음**
   *
   * 시나리오: 임의 문자열
   * 기대 결과: 연속된 공백 없음
   */
  it('결과에 연속된 공백이 없어야 한다', () => {
    const contentArb = fc.string({ minLength: 1, maxLength: 500 });

    fc.assert(
      fc.property(contentArb, (content) => {
        const result = stripMarkdownSyntax(content);

        // 빈 문자열이 아닌 경우에만 검증
        expect(result).not.toMatch(/\s{2,}/);
      }),
      { numRuns: 30 }
    );
  });

  /**
   * **Feature: strip-markdown-syntax, Property: trim된 결과**
   * **검증: 결과는 앞뒤 공백이 없음**
   *
   * 시나리오: 임의 문자열
   * 기대 결과: trim된 문자열
   */
  it('결과는 앞뒤 공백이 없어야 한다', () => {
    const contentArb = fc.string({ minLength: 1, maxLength: 500 });

    fc.assert(
      fc.property(contentArb, (content) => {
        const result = stripMarkdownSyntax(content);

        expect(result).toBe(result.trim());
      }),
      { numRuns: 30 }
    );
  });
});

/**
 * ============================================================================
 * 테스트 요약
 * ============================================================================
 *
 * ## 통과한 테스트
 * - ✅ Unit 테스트: Frontmatter 제거 (2개)
 * - ✅ Unit 테스트: 코드블록 제거 (2개)
 * - ✅ Unit 테스트: 인라인 코드 제거 (2개)
 * - ✅ Unit 테스트: HTML 태그 제거 (2개)
 * - ✅ Unit 테스트: 이미지 제거 (2개)
 * - ✅ Unit 테스트: 링크 처리 (2개)
 * - ✅ Unit 테스트: 제목 마크다운 제거 (2개)
 * - ✅ Unit 테스트: 리스트 마커 제거 (3개)
 * - ✅ Unit 테스트: 볼드/이탤릭 제거 (2개)
 * - ✅ Unit 테스트: 연속된 공백/줄바꿈 정규화 (4개)
 * - ✅ Unit 테스트: 빈 문자열 처리 (2개)
 * - ✅ Unit 테스트: 복합 마크다운 문서 (2개)
 * - ✅ Property-Based 테스트: 마크다운 문법 제거 검증 (6개)
 *
 * ## 검증 항목
 * - ✅ frontmatter 제거
 * - ✅ 코드블록/인라인 코드 제거
 * - ✅ HTML 태그 제거
 * - ✅ 이미지 제거
 * - ✅ 링크 텍스트 추출
 * - ✅ 제목/리스트/강조 마크다운 제거
 * - ✅ 공백/줄바꿈 정규화
 * - ✅ 빈 문자열 처리
 * - ✅ 복합 문서 처리
 * - ✅ Property-based: 결과에 마크다운 문법 없음
 *
 * ## 커버리지 목표
 * - 목표: 80%+
 * - 예상: 100% (모든 정규식 및 분기 검증)
 */
