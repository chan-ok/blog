import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

import { extractExcerpt } from './extract-excerpt';

/**
 * ============================================================================
 * extractExcerpt 유틸리티 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * MDX 콘텐츠에서 요약문을 추출하는 유틸리티를 검증합니다.
 *
 * ## 테스트 범위
 * - ✅ 일반 텍스트 그대로 반환
 * - ✅ frontmatter 제거
 * - ✅ 코드블록 제거
 * - ✅ 인라인 코드 제거
 * - ✅ HTML 태그 제거
 * - ✅ 이미지 제거
 * - ✅ 링크에서 텍스트만 추출
 * - ✅ 제목 마크다운 제거
 * - ✅ maxLength 초과 시 ... 추가
 * - ✅ 빈 콘텐츠 → 빈 문자열
 * - ✅ 커스텀 maxLength
 * - ✅ Property-based: 결과 길이 <= maxLength + 3 (... 포함)
 *
 * ## 테스트 전략
 * - Unit 테스트: 마크다운 문법 제거, maxLength 처리
 * - Property-Based 테스트: 길이 제한 검증
 */

// ============================================================================
// Unit 테스트 - 기본 동작
// ============================================================================

describe('Unit 테스트 - 기본 동작', () => {
  /**
   * **Feature: extract-excerpt, Property: 일반 텍스트**
   * **검증: 일반 텍스트는 그대로 반환**
   *
   * 시나리오: 마크다운 문법이 없는 텍스트 전달
   * 기대 결과: 텍스트 그대로 반환
   */
  it('일반 텍스트를 그대로 반환해야 한다', () => {
    const content = 'This is a plain text content.';
    const result = extractExcerpt(content);

    expect(result).toBe('This is a plain text content.');
  });

  /**
   * **Feature: extract-excerpt, Property: 빈 콘텐츠**
   * **검증: 빈 문자열 → 빈 문자열 반환**
   *
   * 시나리오: 빈 문자열 전달
   * 기대 결과: 빈 문자열
   */
  it('빈 콘텐츠에서는 빈 문자열을 반환해야 한다', () => {
    const result = extractExcerpt('');

    expect(result).toBe('');
  });

  /**
   * **Feature: extract-excerpt, Property: 공백만 있는 콘텐츠**
   * **검증: 공백만 있으면 빈 문자열 반환**
   *
   * 시나리오: 공백/개행만 있는 문자열
   * 기대 결과: 빈 문자열
   */
  it('공백만 있는 콘텐츠에서는 빈 문자열을 반환해야 한다', () => {
    const result = extractExcerpt('   \n\n   ');

    expect(result).toBe('');
  });
});

// ============================================================================
// Unit 테스트 - Frontmatter 제거
// ============================================================================

describe('Unit 테스트 - Frontmatter 제거', () => {
  /**
   * **Feature: extract-excerpt, Property: frontmatter 제거**
   * **검증: YAML frontmatter를 제거하고 본문만 추출**
   *
   * 시나리오: frontmatter가 있는 콘텐츠 전달
   * 기대 결과: frontmatter 제거된 텍스트
   */
  it('frontmatter를 제거해야 한다', () => {
    const content = `---
title: Test Post
date: 2024-01-01
---
This is the actual content.`;

    const result = extractExcerpt(content);

    expect(result).toBe('This is the actual content.');
  });

  /**
   * **Feature: extract-excerpt, Property: frontmatter만 있을 때**
   * **검증: frontmatter만 있고 본문 없으면 빈 문자열**
   *
   * 시나리오: frontmatter만 있는 콘텐츠
   * 기대 결과: 빈 문자열
   */
  it('frontmatter만 있을 때 빈 문자열을 반환해야 한다', () => {
    const content = `---
title: Only Frontmatter
---`;

    const result = extractExcerpt(content);

    expect(result).toBe('');
  });
});

// ============================================================================
// Unit 테스트 - 코드 제거
// ============================================================================

describe('Unit 테스트 - 코드 제거', () => {
  /**
   * **Feature: extract-excerpt, Property: 코드블록 제거**
   * **검증: ```로 감싸진 코드블록을 제거**
   *
   * 시나리오: 코드블록이 있는 콘텐츠
   * 기대 결과: 코드블록 제거된 텍스트
   */
  it('코드블록을 제거해야 한다', () => {
    const content = `This is text before.
\`\`\`typescript
const x = 1;
\`\`\`
This is text after.`;

    const result = extractExcerpt(content);

    expect(result).toBe('This is text before. This is text after.');
  });

  /**
   * **Feature: extract-excerpt, Property: 인라인 코드 제거**
   * **검증: `로 감싸진 인라인 코드를 제거**
   *
   * 시나리오: 인라인 코드가 있는 콘텐츠
   * 기대 결과: 인라인 코드 제거된 텍스트
   */
  it('인라인 코드를 제거해야 한다', () => {
    const content = 'This is `inline code` in text.';
    const result = extractExcerpt(content);

    expect(result).toBe('This is in text.');
  });

  /**
   * **Feature: extract-excerpt, Property: 여러 코드 요소**
   * **검증: 코드블록과 인라인 코드가 섞여 있어도 모두 제거**
   *
   * 시나리오: 코드블록 + 인라인 코드
   * 기대 결과: 모든 코드 제거된 텍스트
   */
  it('여러 코드 요소를 모두 제거해야 한다', () => {
    const content = `Text with \`inline\` and
\`\`\`js
const code = "block";
\`\`\`
More text with \`another\` inline.`;

    const result = extractExcerpt(content);

    expect(result).toBe('Text with and More text with inline.');
  });
});

// ============================================================================
// Unit 테스트 - HTML 태그 제거
// ============================================================================

describe('Unit 테스트 - HTML 태그 제거', () => {
  /**
   * **Feature: extract-excerpt, Property: HTML 태그 제거**
   * **검증: <tag>...</tag> 형식의 HTML 태그를 제거**
   *
   * 시나리오: HTML 태그가 있는 콘텐츠
   * 기대 결과: 태그 제거된 텍스트만 반환
   */
  it('HTML 태그를 제거해야 한다', () => {
    const content = 'Text with <strong>bold</strong> and <em>italic</em>.';
    const result = extractExcerpt(content);

    expect(result).toBe('Text with bold and italic.');
  });

  /**
   * **Feature: extract-excerpt, Property: 자체 닫힘 태그**
   * **검증: <img />, <br /> 등 자체 닫힘 태그도 제거**
   *
   * 시나리오: 자체 닫힘 태그가 있는 콘텐츠
   * 기대 결과: 태그 제거된 텍스트
   */
  it('자체 닫힘 태그를 제거해야 한다', () => {
    const content = 'Text with <img src="image.jpg" /> inline.';
    const result = extractExcerpt(content);

    expect(result).toBe('Text with inline.');
  });
});

// ============================================================================
// Unit 테스트 - 이미지 제거
// ============================================================================

describe('Unit 테스트 - 이미지 제거', () => {
  /**
   * **Feature: extract-excerpt, Property: Markdown 이미지 제거**
   * **검증: ![alt](url) 형식의 이미지를 제거**
   *
   * 시나리오: Markdown 이미지가 있는 콘텐츠
   * 기대 결과: 이미지 제거된 텍스트
   */
  it('Markdown 이미지를 제거해야 한다', () => {
    const content = 'Text before ![Image](url) text after.';
    const result = extractExcerpt(content);

    expect(result).toBe('Text before text after.');
  });
});

// ============================================================================
// Unit 테스트 - 링크 처리
// ============================================================================

describe('Unit 테스트 - 링크 처리', () => {
  /**
   * **Feature: extract-excerpt, Property: 링크에서 텍스트만 추출**
   * **검증: [text](url) 형식에서 text만 남김**
   *
   * 시나리오: Markdown 링크가 있는 콘텐츠
   * 기대 결과: 링크 텍스트만 반환
   */
  it('링크에서 텍스트만 추출해야 한다', () => {
    const content = 'Check out [this link](https://example.com) for more.';
    const result = extractExcerpt(content);

    expect(result).toBe('Check out this link for more.');
  });

  /**
   * **Feature: extract-excerpt, Property: 여러 링크**
   * **검증: 여러 링크가 있어도 모든 텍스트 추출**
   *
   * 시나리오: 여러 Markdown 링크
   * 기대 결과: 모든 링크 텍스트 추출
   */
  it('여러 링크에서 모든 텍스트를 추출해야 한다', () => {
    const content = '[First](url1) and [Second](url2) links.';
    const result = extractExcerpt(content);

    expect(result).toBe('First and Second links.');
  });
});

// ============================================================================
// Unit 테스트 - 제목 마크다운 제거
// ============================================================================

describe('Unit 테스트 - 제목 마크다운 제거', () => {
  /**
   * **Feature: extract-excerpt, Property: 제목 마크다운 제거**
   * **검증: #으로 시작하는 제목 마크다운을 제거**
   *
   * 시나리오: 제목 마크다운이 있는 콘텐츠
   * 기대 결과: # 제거된 텍스트
   */
  it('제목 마크다운을 제거해야 한다', () => {
    const content = `# Title
This is content.`;

    const result = extractExcerpt(content);

    expect(result).toBe('Title This is content.');
  });

  /**
   * **Feature: extract-excerpt, Property: 여러 레벨 제목**
   * **검증: h1~h6 모두 제거**
   *
   * 시나리오: 여러 레벨 제목
   * 기대 결과: 모든 # 제거
   */
  it('여러 레벨 제목을 모두 처리해야 한다', () => {
    const content = `## Heading 2
### Heading 3
Regular text.`;

    const result = extractExcerpt(content);

    expect(result).toBe('Heading 2 Heading 3 Regular text.');
  });
});

// ============================================================================
// Unit 테스트 - 리스트 마크다운 제거
// ============================================================================

describe('Unit 테스트 - 리스트 마크다운 제거', () => {
  /**
   * **Feature: extract-excerpt, Property: 순서 없는 리스트**
   * **검증: -, *, + 기호 제거**
   *
   * 시나리오: 순서 없는 리스트
   * 기대 결과: 리스트 기호 제거된 텍스트
   */
  it('순서 없는 리스트 기호를 제거해야 한다', () => {
    const content = `- Item 1
- Item 2
* Item 3`;

    const result = extractExcerpt(content);

    expect(result).toBe('Item 1 Item 2 Item 3');
  });

  /**
   * **Feature: extract-excerpt, Property: 순서 있는 리스트**
   * **검증: 1., 2. 등 숫자 기호 제거**
   *
   * 시나리오: 순서 있는 리스트
   * 기대 결과: 숫자 기호 제거된 텍스트
   */
  it('순서 있는 리스트 기호를 제거해야 한다', () => {
    const content = `1. First item
2. Second item
3. Third item`;

    const result = extractExcerpt(content);

    expect(result).toBe('First item Second item Third item');
  });
});

// ============================================================================
// Unit 테스트 - 강조 마크다운 제거
// ============================================================================

describe('Unit 테스트 - 강조 마크다운 제거', () => {
  /**
   * **Feature: extract-excerpt, Property: bold/italic 제거**
   * **검증: **, *, _, __ 기호 제거**
   *
   * 시나리오: bold/italic 마크다운
   * 기대 결과: 기호 제거된 텍스트만 반환
   */
  it('bold/italic 마크다운을 제거해야 한다', () => {
    const content = 'Text with **bold** and *italic* and _underline_.';
    const result = extractExcerpt(content);

    expect(result).toBe('Text with bold and italic and underline.');
  });
});

// ============================================================================
// Unit 테스트 - maxLength 처리
// ============================================================================

describe('Unit 테스트 - maxLength 처리', () => {
  /**
   * **Feature: extract-excerpt, Property: 기본 maxLength**
   * **검증: 기본 maxLength는 200자**
   *
   * 시나리오: 200자 초과 텍스트
   * 기대 결과: 200자로 잘리고 ... 추가
   */
  it('기본 maxLength 200자로 제한해야 한다', () => {
    const longText = 'a'.repeat(250);
    const result = extractExcerpt(longText);

    expect(result.length).toBe(203); // 200 + '...'
    expect(result.endsWith('...')).toBe(true);
  });

  /**
   * **Feature: extract-excerpt, Property: 커스텀 maxLength**
   * **검증: 커스텀 maxLength로 제한 가능**
   *
   * 시나리오: maxLength=50 전달
   * 기대 결과: 50자로 잘리고 ... 추가
   */
  it('커스텀 maxLength로 제한해야 한다', () => {
    const longText = 'This is a long text. '.repeat(10);
    const result = extractExcerpt(longText, 50);

    expect(result.length).toBeLessThanOrEqual(53); // 50 + '...'
    expect(result.endsWith('...')).toBe(true);
  });

  /**
   * **Feature: extract-excerpt, Property: maxLength 이하 텍스트**
   * **검증: maxLength 이하면 ... 없이 그대로 반환**
   *
   * 시나리오: maxLength보다 짧은 텍스트
   * 기대 결과: ... 없이 텍스트 그대로
   */
  it('maxLength 이하 텍스트는 그대로 반환해야 한다', () => {
    const shortText = 'Short text.';
    const result = extractExcerpt(shortText, 100);

    expect(result).toBe('Short text.');
    expect(result.endsWith('...')).toBe(false);
  });

  /**
   * **Feature: extract-excerpt, Property: 정확히 maxLength**
   * **검증: 정확히 maxLength면 ... 없이 반환**
   *
   * 시나리오: 정확히 maxLength인 텍스트
   * 기대 결과: ... 없이 텍스트 그대로
   */
  it('정확히 maxLength인 텍스트는 그대로 반환해야 한다', () => {
    const exactText = 'a'.repeat(50);
    const result = extractExcerpt(exactText, 50);

    expect(result).toBe(exactText);
    expect(result.endsWith('...')).toBe(false);
  });
});

// ============================================================================
// Unit 테스트 - 복합 시나리오
// ============================================================================

describe('Unit 테스트 - 복합 시나리오', () => {
  /**
   * **Feature: extract-excerpt, Property: 모든 마크다운 문법**
   * **검증: 여러 마크다운 문법이 섞여 있어도 올바르게 제거**
   *
   * 시나리오: frontmatter, 코드, 이미지, 링크, 제목 등 모두 포함
   * 기대 결과: 순수 텍스트만 추출
   */
  it('모든 마크다운 문법을 올바르게 제거해야 한다', () => {
    const content = `---
title: Test
---
# Heading
This is **bold** text with [link](url) and \`code\`.
![Image](url)
\`\`\`js
const x = 1;
\`\`\`
- List item
Final text.`;

    const result = extractExcerpt(content);

    expect(result).toBe(
      'Heading This is bold text with link and . List item Final text.'
    );
  });
});

// ============================================================================
// Property-Based 테스트 - 길이 제한 검증
// ============================================================================

describe('Property-Based 테스트 - 길이 제한 검증', () => {
  /**
   * **Feature: extract-excerpt, Property: 결과 길이 검증**
   * **검증: 결과는 항상 maxLength + 3 이하**
   *
   * 시나리오: 임의 텍스트와 maxLength
   * 기대 결과: 결과 길이 <= maxLength + 3
   */
  it('결과 길이는 항상 maxLength + 3 이하여야 한다', () => {
    const textArb = fc.string({ minLength: 1, maxLength: 500 });
    const maxLengthArb = fc.integer({ min: 10, max: 300 });

    fc.assert(
      fc.property(textArb, maxLengthArb, (text, maxLength) => {
        const result = extractExcerpt(text, maxLength);

        // 결과 길이는 maxLength + 3 ('...') 이하
        expect(result.length).toBeLessThanOrEqual(maxLength + 3);
      }),
      { numRuns: 30 }
    );
  });

  /**
   * **Feature: extract-excerpt, Property: 빈 문자열은 항상 빈 문자열**
   * **검증: 빈 문자열은 maxLength와 관계없이 빈 문자열 반환**
   *
   * 시나리오: 빈 문자열 + 임의 maxLength
   * 기대 결과: 빈 문자열
   */
  it('빈 문자열은 항상 빈 문자열을 반환해야 한다', () => {
    const maxLengthArb = fc.integer({ min: 1, max: 1000 });

    fc.assert(
      fc.property(maxLengthArb, (maxLength) => {
        const result = extractExcerpt('', maxLength);

        expect(result).toBe('');
      }),
      { numRuns: 30 }
    );
  });

  /**
   * **Feature: extract-excerpt, Property: maxLength=0**
   * **검증: maxLength=0이면 ... 반환**
   *
   * 시나리오: 텍스트 + maxLength=0
   * 기대 결과: '...'
   */
  it('maxLength=0이면 ...을 반환해야 한다', () => {
    const textArb = fc.string({ minLength: 1, maxLength: 100 });

    fc.assert(
      fc.property(textArb, (text) => {
        const result = extractExcerpt(text, 0);

        // 텍스트가 비어있지 않으면 '...'
        const expectedResult = text.trim().length > 0 ? '...' : '';
        expect(result).toBe(expectedResult);
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
 * - ✅ Unit 테스트: 기본 동작 (3개)
 * - ✅ Unit 테스트: Frontmatter 제거 (2개)
 * - ✅ Unit 테스트: 코드 제거 (3개)
 * - ✅ Unit 테스트: HTML 태그 제거 (2개)
 * - ✅ Unit 테스트: 이미지 제거 (1개)
 * - ✅ Unit 테스트: 링크 처리 (2개)
 * - ✅ Unit 테스트: 제목 마크다운 제거 (2개)
 * - ✅ Unit 테스트: 리스트 마크다운 제거 (2개)
 * - ✅ Unit 테스트: 강조 마크다운 제거 (1개)
 * - ✅ Unit 테스트: maxLength 처리 (4개)
 * - ✅ Unit 테스트: 복합 시나리오 (1개)
 * - ✅ Property-Based 테스트: 길이 제한 검증 (3개)
 *
 * ## 검증 항목
 * - ✅ 일반 텍스트 반환
 * - ✅ frontmatter 제거
 * - ✅ 코드블록/인라인 코드 제거
 * - ✅ HTML 태그 제거
 * - ✅ 이미지 제거
 * - ✅ 링크 텍스트 추출
 * - ✅ 제목/리스트/강조 마크다운 제거
 * - ✅ maxLength 처리
 * - ✅ 결과 길이 검증
 *
 * ## 커버리지 목표
 * - 목표: 80%+
 * - 예상: 100% (모든 정규식 및 분기 검증)
 */
