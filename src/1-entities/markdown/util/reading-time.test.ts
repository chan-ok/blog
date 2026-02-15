import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

import { calculateReadingTime } from './reading-time';

/**
 * ============================================================================
 * calculateReadingTime 유틸리티 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * MDX 콘텐츠의 예상 읽기 시간(분)을 계산하는 유틸리티를 검증합니다.
 *
 * ## 테스트 범위
 * - ✅ 빈 콘텐츠 → 1분
 * - ✅ 짧은 텍스트 → 1분
 * - ✅ 500자 → 1분
 * - ✅ 501자 → 2분
 * - ✅ frontmatter 제거 후 계산
 * - ✅ 코드블록 제거 후 계산
 * - ✅ 마크다운 문법 제거 후 계산
 * - ✅ 항상 1 이상 반환
 * - ✅ Property-based: 결과가 항상 1 이상
 *
 * ## 테스트 전략
 * - Unit 테스트: 문자 수별 계산, 마크다운 제거
 * - Property-Based 테스트: 항상 1 이상 반환
 */

// ============================================================================
// Unit 테스트 - 기본 계산
// ============================================================================

describe('Unit 테스트 - 기본 계산', () => {
  /**
   * **Feature: reading-time, Property: 빈 콘텐츠**
   * **검증: 빈 콘텐츠는 1분 반환**
   *
   * 시나리오: 빈 문자열 전달
   * 기대 결과: 1
   */
  it('빈 콘텐츠에서는 1분을 반환해야 한다', () => {
    const result = calculateReadingTime('');

    expect(result).toBe(1);
  });

  /**
   * **Feature: reading-time, Property: 짧은 텍스트**
   * **검증: 500자 이하는 1분 반환**
   *
   * 시나리오: 짧은 텍스트 전달
   * 기대 결과: 1
   */
  it('짧은 텍스트에서는 1분을 반환해야 한다', () => {
    const shortText = 'Short text.';
    const result = calculateReadingTime(shortText);

    expect(result).toBe(1);
  });

  /**
   * **Feature: reading-time, Property: 정확히 500자**
   * **검증: 500자는 1분 반환**
   *
   * 시나리오: 정확히 500자 텍스트
   * 기대 결과: 1
   */
  it('정확히 500자에서는 1분을 반환해야 한다', () => {
    const text500 = 'a'.repeat(500);
    const result = calculateReadingTime(text500);

    expect(result).toBe(1);
  });

  /**
   * **Feature: reading-time, Property: 501자**
   * **검증: 501자는 2분 반환 (올림)**
   *
   * 시나리오: 501자 텍스트
   * 기대 결과: 2
   */
  it('501자에서는 2분을 반환해야 한다', () => {
    const text501 = 'a'.repeat(501);
    const result = calculateReadingTime(text501);

    expect(result).toBe(2);
  });

  /**
   * **Feature: reading-time, Property: 1000자**
   * **검증: 1000자는 2분 반환**
   *
   * 시나리오: 1000자 텍스트
   * 기대 결과: 2
   */
  it('1000자에서는 2분을 반환해야 한다', () => {
    const text1000 = 'a'.repeat(1000);
    const result = calculateReadingTime(text1000);

    expect(result).toBe(2);
  });

  /**
   * **Feature: reading-time, Property: 2500자**
   * **검증: 2500자는 5분 반환**
   *
   * 시나리오: 2500자 텍스트
   * 기대 결과: 5
   */
  it('2500자에서는 5분을 반환해야 한다', () => {
    const text2500 = 'a'.repeat(2500);
    const result = calculateReadingTime(text2500);

    expect(result).toBe(5);
  });

  /**
   * **Feature: reading-time, Property: 5000자**
   * **검증: 5000자는 10분 반환**
   *
   * 시나리오: 5000자 텍스트
   * 기대 결과: 10
   */
  it('5000자에서는 10분을 반환해야 한다', () => {
    const text5000 = 'a'.repeat(5000);
    const result = calculateReadingTime(text5000);

    expect(result).toBe(10);
  });
});

// ============================================================================
// Unit 테스트 - Frontmatter 제거 후 계산
// ============================================================================

describe('Unit 테스트 - Frontmatter 제거 후 계산', () => {
  /**
   * **Feature: reading-time, Property: frontmatter 제거**
   * **검증: frontmatter를 제거하고 본문만 계산**
   *
   * 시나리오: frontmatter + 본문
   * 기대 결과: frontmatter를 제외한 본문 길이로 계산
   */
  it('frontmatter를 제거하고 계산해야 한다', () => {
    const content = `---
title: Test Post
date: 2024-01-01
tags: [test, blog]
---
${'a'.repeat(600)}`;

    const result = calculateReadingTime(content);

    // 600자 본문 → 2분
    expect(result).toBe(2);
  });

  /**
   * **Feature: reading-time, Property: frontmatter만 있을 때**
   * **검증: frontmatter만 있으면 1분 반환**
   *
   * 시나리오: frontmatter만 있는 콘텐츠
   * 기대 결과: 1
   */
  it('frontmatter만 있을 때 1분을 반환해야 한다', () => {
    const content = `---
title: Only Frontmatter
---`;

    const result = calculateReadingTime(content);

    expect(result).toBe(1);
  });
});

// ============================================================================
// Unit 테스트 - 코드블록 제거 후 계산
// ============================================================================

describe('Unit 테스트 - 코드블록 제거 후 계산', () => {
  /**
   * **Feature: reading-time, Property: 코드블록 제거**
   * **검증: 코드블록을 제거하고 본문만 계산**
   *
   * 시나리오: 본문 + 코드블록
   * 기대 결과: 코드블록을 제외한 본문 길이로 계산
   */
  it('코드블록을 제거하고 계산해야 한다', () => {
    const content = `${'a'.repeat(600)}
\`\`\`typescript
${'const x = 1; '.repeat(100)}
\`\`\``;

    const result = calculateReadingTime(content);

    // 600자 본문만 계산 → 2분
    expect(result).toBe(2);
  });

  /**
   * **Feature: reading-time, Property: 인라인 코드 제거**
   * **검증: 인라인 코드를 제거하고 계산**
   *
   * 시나리오: 인라인 코드가 포함된 본문
   * 기대 결과: 인라인 코드를 제외한 본문 길이로 계산
   */
  it('인라인 코드를 제거하고 계산해야 한다', () => {
    const content = `${'a'.repeat(600)} \`inline code here\``;

    const result = calculateReadingTime(content);

    // 600자 본문 + 약간의 텍스트 → 2분
    expect(result).toBe(2);
  });
});

// ============================================================================
// Unit 테스트 - 마크다운 문법 제거 후 계산
// ============================================================================

describe('Unit 테스트 - 마크다운 문법 제거 후 계산', () => {
  /**
   * **Feature: reading-time, Property: HTML 태그 제거**
   * **검증: HTML 태그를 제거하고 텍스트만 계산**
   *
   * 시나리오: HTML 태그가 포함된 본문
   * 기대 결과: 태그를 제외한 텍스트 길이로 계산
   */
  it('HTML 태그를 제거하고 계산해야 한다', () => {
    const content = `<div>${'a'.repeat(600)}</div>`;

    const result = calculateReadingTime(content);

    // 600자 본문 → 2분
    expect(result).toBe(2);
  });

  /**
   * **Feature: reading-time, Property: 이미지 제거**
   * **검증: 이미지를 제거하고 계산**
   *
   * 시나리오: 이미지가 포함된 본문
   * 기대 결과: 이미지를 제외한 텍스트 길이로 계산
   */
  it('이미지를 제거하고 계산해야 한다', () => {
    const content = `${'a'.repeat(600)} ![Image](url)`;

    const result = calculateReadingTime(content);

    // 600자 본문 → 2분
    expect(result).toBe(2);
  });

  /**
   * **Feature: reading-time, Property: 링크 텍스트만 계산**
   * **검증: 링크 URL을 제거하고 텍스트만 계산**
   *
   * 시나리오: 링크가 포함된 본문
   * 기대 결과: 링크 텍스트만 계산
   */
  it('링크 텍스트만 계산해야 한다', () => {
    const content = `${'a'.repeat(600)} [Link text](https://very-long-url.com/path/to/page)`;

    const result = calculateReadingTime(content);

    // 600자 + "Link text" → 2분
    expect(result).toBe(2);
  });

  /**
   * **Feature: reading-time, Property: 제목 마크다운 제거**
   * **검증: 제목 마크다운 기호를 제거하고 텍스트만 계산**
   *
   * 시나리오: 제목이 포함된 본문
   * 기대 결과: 제목 텍스트만 계산
   */
  it('제목 마크다운을 제거하고 계산해야 한다', () => {
    const content = `# ${'a'.repeat(100)}
${'b'.repeat(500)}`;

    const result = calculateReadingTime(content);

    // 100 + 500 = 600자 → 2분
    expect(result).toBe(2);
  });

  /**
   * **Feature: reading-time, Property: 리스트 마크다운 제거**
   * **검증: 리스트 기호를 제거하고 텍스트만 계산**
   *
   * 시나리오: 리스트가 포함된 본문
   * 기대 결과: 리스트 텍스트만 계산
   */
  it('리스트 마크다운을 제거하고 계산해야 한다', () => {
    const content = `- ${'a'.repeat(200)}
- ${'b'.repeat(200)}
1. ${'c'.repeat(200)}`;

    const result = calculateReadingTime(content);

    // 600자 → 2분
    expect(result).toBe(2);
  });

  /**
   * **Feature: reading-time, Property: 강조 마크다운 제거**
   * **검증: bold/italic 기호를 제거하고 텍스트만 계산**
   *
   * 시나리오: 강조가 포함된 본문
   * 기대 결과: 강조 텍스트만 계산
   */
  it('강조 마크다운을 제거하고 계산해야 한다', () => {
    const content = `**${'a'.repeat(300)}** *${'b'.repeat(300)}*`;

    const result = calculateReadingTime(content);

    // 600자 → 2분
    expect(result).toBe(2);
  });
});

// ============================================================================
// Unit 테스트 - 복합 시나리오
// ============================================================================

describe('Unit 테스트 - 복합 시나리오', () => {
  /**
   * **Feature: reading-time, Property: 모든 마크다운 문법**
   * **검증: 여러 마크다운 문법이 섞여 있어도 올바르게 계산**
   *
   * 시나리오: frontmatter, 코드, 이미지, 링크, 제목 등 모두 포함
   * 기대 결과: 순수 텍스트만으로 계산
   */
  it('모든 마크다운 문법을 제거하고 계산해야 한다', () => {
    const content = `---
title: Test
---
# Heading
${'a'.repeat(200)}
![Image](url)
[Link](url)
\`\`\`js
${'const x = 1; '.repeat(50)}
\`\`\`
**Bold** ${'b'.repeat(300)}`;

    const result = calculateReadingTime(content);

    // "Heading" (7자) + 200a + "Link" (4자) + "Bold" (4자) + 300b = 515자 → 2분
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(2);
  });

  /**
   * **Feature: reading-time, Property: 공백과 개행 정규화**
   * **검증: 여러 공백/개행을 단일 공백으로 정규화**
   *
   * 시나리오: 여러 공백/개행이 포함된 본문
   * 기대 결과: 공백을 정규화하여 계산
   */
  it('공백과 개행을 정규화하고 계산해야 한다', () => {
    const content = `${'a'.repeat(100)}


${'b'.repeat(100)}    ${'c'.repeat(100)}

${'d'.repeat(300)}`;

    const result = calculateReadingTime(content);

    // 600자 → 2분
    expect(result).toBe(2);
  });
});

// ============================================================================
// Unit 테스트 - 최소값 보장
// ============================================================================

describe('Unit 테스트 - 최소값 보장', () => {
  /**
   * **Feature: reading-time, Property: 항상 1 이상**
   * **검증: 결과는 항상 1 이상**
   *
   * 시나리오: 빈 콘텐츠, 짧은 콘텐츠
   * 기대 결과: 최소 1분 반환
   */
  it('항상 1 이상을 반환해야 한다', () => {
    const testCases = ['', ' ', '\n\n', 'a', 'ab', 'abc', 'Short text.'];

    testCases.forEach((content) => {
      const result = calculateReadingTime(content);
      expect(result).toBeGreaterThanOrEqual(1);
    });
  });
});

// ============================================================================
// Property-Based 테스트 - 항상 1 이상 반환
// ============================================================================

describe('Property-Based 테스트 - 항상 1 이상 반환', () => {
  /**
   * **Feature: reading-time, Property: 임의 콘텐츠**
   * **검증: 모든 콘텐츠에 대해 결과 >= 1**
   *
   * 시나리오: 무작위 문자열 전달
   * 기대 결과: 항상 1 이상 반환
   */
  it('임의의 콘텐츠에서 항상 1 이상을 반환해야 한다', () => {
    const contentArb = fc.string();

    fc.assert(
      fc.property(contentArb, (content) => {
        const result = calculateReadingTime(content);

        expect(result).toBeGreaterThanOrEqual(1);
        expect(Number.isInteger(result)).toBe(true);
      }),
      { numRuns: 30 }
    );
  });

  /**
   * **Feature: reading-time, Property: 긴 콘텐츠**
   * **검증: 긴 콘텐츠는 적절한 분 수 반환**
   *
   * 시나리오: 1000~10000자 콘텐츠
   * 기대 결과: 2~20분 사이 반환
   */
  it('긴 콘텐츠에서 적절한 분 수를 반환해야 한다', () => {
    const longContentArb = fc
      .integer({ min: 1000, max: 10000 })
      .map((len) => 'a'.repeat(len));

    fc.assert(
      fc.property(longContentArb, (content) => {
        const result = calculateReadingTime(content);

        // 1000자 → 2분, 10000자 → 20분
        expect(result).toBeGreaterThanOrEqual(2);
        expect(result).toBeLessThanOrEqual(20);
      }),
      { numRuns: 30 }
    );
  });

  /**
   * **Feature: reading-time, Property: 문자 수 비례**
   * **검증: 문자 수가 많을수록 읽기 시간 증가**
   *
   * 시나리오: 2배 길이 콘텐츠 비교
   * 기대 결과: 긴 콘텐츠의 읽기 시간 >= 짧은 콘텐츠
   */
  it('문자 수가 많을수록 읽기 시간이 증가해야 한다', () => {
    const lengthArb = fc.integer({ min: 100, max: 5000 });

    fc.assert(
      fc.property(lengthArb, (length) => {
        const shortContent = 'a'.repeat(length);
        const longContent = 'a'.repeat(length * 2);

        const shortTime = calculateReadingTime(shortContent);
        const longTime = calculateReadingTime(longContent);

        expect(longTime).toBeGreaterThanOrEqual(shortTime);
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
 * - ✅ Unit 테스트: 기본 계산 (7개)
 * - ✅ Unit 테스트: Frontmatter 제거 후 계산 (2개)
 * - ✅ Unit 테스트: 코드블록 제거 후 계산 (2개)
 * - ✅ Unit 테스트: 마크다운 문법 제거 후 계산 (6개)
 * - ✅ Unit 테스트: 복합 시나리오 (2개)
 * - ✅ Unit 테스트: 최소값 보장 (1개)
 * - ✅ Property-Based 테스트: 항상 1 이상 반환 (3개)
 *
 * ## 검증 항목
 * - ✅ 빈 콘텐츠/짧은 텍스트 → 1분
 * - ✅ 500자 → 1분, 501자 → 2분
 * - ✅ frontmatter 제거
 * - ✅ 코드블록/인라인 코드 제거
 * - ✅ 마크다운 문법 제거
 * - ✅ 항상 1 이상 반환
 * - ✅ 정수 반환
 * - ✅ 문자 수 비례
 *
 * ## 커버리지 목표
 * - 목표: 80%+
 * - 예상: 100% (모든 정규식 및 분기 검증)
 */
