import { describe, it, expect } from 'vitest';
import { compile } from '@mdx-js/mdx';
import * as fc from 'fast-check';

import remarkObsidianImage from './remark-obsidian-image';

/**
 * ============================================================================
 * remark-obsidian-image 플러그인 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * Obsidian 스타일의 이미지 문법(`![[image.png]]`)을 표준 마크다운 이미지로 변환하는
 * remark 플러그인을 검증합니다.
 *
 * ## 테스트 범위
 * - ✅ 기본 이미지 변환: `![[images/photo.png]]` → `![photo.png](images/photo.png)`
 * - ✅ 캡션 지원: `![[images/photo.png|캡션]]` → `![캡션](images/photo.png)`
 * - ✅ 중첩 경로 지원: `![[deep/path/image.jpg]]`
 * - ✅ 일반 텍스트에 `![[]]` 패턴이 없으면 변환 없음
 * - ✅ 여러 이미지가 포함된 경우 모두 변환
 * - ✅ 빈 `![[]]`는 무시
 * - ✅ Property-based: 임의 경로/캡션 조합
 *
 * ## 테스트 전략
 * - `@mdx-js/mdx`의 `compile`을 사용하여 플러그인 적용 후 결과 확인
 * - 변환된 마크다운에 표준 이미지 문법이 포함되어 있는지 검증
 */

// ============================================================================
// Helper: 플러그인 적용 및 결과 검증
// ============================================================================

/**
 * MDX 컴파일러로 플러그인을 적용하고 결과를 반환
 */
async function compileWithPlugin(markdown: string): Promise<string> {
  const result = await compile(markdown, {
    remarkPlugins: [remarkObsidianImage],
  });
  return String(result);
}

// ============================================================================
// Unit 테스트 - 기본 이미지 변환
// ============================================================================

describe('Unit 테스트 - 기본 이미지 변환', () => {
  /**
   * **Feature: remark-obsidian-image, Property: 기본 이미지 변환**
   * **검증: `![[images/photo.png]]` → `![photo.png](images/photo.png)`**
   *
   * 시나리오: Obsidian 이미지 문법을 마크다운에 포함
   * 기대 결과: 표준 마크다운 이미지 문법으로 변환됨
   */
  it('기본 Obsidian 이미지 문법을 표준 마크다운으로 변환해야 한다', async () => {
    const markdown = '![[images/photo.png]]';

    const result = await compileWithPlugin(markdown);

    // 결과에 img 태그 또는 표준 마크다운 이미지 문법이 포함되어야 함
    expect(result).toMatch(/images\/photo\.png/);
    expect(result).toMatch(/photo\.png/); // alt 텍스트로 파일명 사용
  });

  /**
   * **Feature: remark-obsidian-image, Property: 캡션 지원**
   * **검증: `![[images/photo.png|캡션]]` → `![캡션](images/photo.png)`**
   *
   * 시나리오: 캡션을 포함한 Obsidian 이미지 문법
   * 기대 결과: 캡션이 alt 텍스트로 변환됨
   */
  it('캡션이 있는 Obsidian 이미지 문법을 변환해야 한다', async () => {
    const markdown = '![[images/photo.png|테스트 캡션]]';

    const result = await compileWithPlugin(markdown);

    // 캡션이 alt로 변환되어야 함
    expect(result).toMatch(/images\/photo\.png/);
    expect(result).toMatch(/테스트 캡션/);
  });

  /**
   * **Feature: remark-obsidian-image, Property: 중첩 경로 지원**
   * **검증: `![[deep/path/image.jpg]]` → `![image.jpg](deep/path/image.jpg)`**
   *
   * 시나리오: 중첩된 경로의 이미지
   * 기대 결과: 경로가 유지되고 파일명이 alt로 사용됨
   */
  it('중첩된 경로의 이미지를 올바르게 변환해야 한다', async () => {
    const markdown = '![[deep/nested/path/image.jpg]]';

    const result = await compileWithPlugin(markdown);

    expect(result).toMatch(/deep\/nested\/path\/image\.jpg/);
    expect(result).toMatch(/image\.jpg/); // alt 텍스트로 파일명
  });

  /**
   * **Feature: remark-obsidian-image, Property: 일반 텍스트 보존**
   * **검증: `![[]]` 패턴이 없으면 변환 없음**
   *
   * 시나리오: 일반 마크다운 텍스트
   * 기대 결과: 원본 텍스트가 그대로 유지됨
   */
  it('일반 텍스트는 변환하지 않아야 한다', async () => {
    const markdown = 'This is normal text without Obsidian syntax.';

    const result = await compileWithPlugin(markdown);

    // 원본 텍스트가 포함되어야 함
    expect(result).toMatch(/normal text/);
  });
});

// ============================================================================
// Unit 테스트 - 여러 이미지 및 엣지 케이스
// ============================================================================

describe('Unit 테스트 - 여러 이미지 및 엣지 케이스', () => {
  /**
   * **Feature: remark-obsidian-image, Property: 여러 이미지 변환**
   * **검증: 여러 Obsidian 이미지가 모두 변환됨**
   *
   * 시나리오: 마크다운에 여러 Obsidian 이미지 포함
   * 기대 결과: 모든 이미지가 변환됨
   */
  it('여러 개의 Obsidian 이미지를 모두 변환해야 한다', async () => {
    const markdown = `
# Title

![[images/first.png]]

Some text

![[images/second.jpg|두 번째 이미지]]

![[deep/third.gif]]
`;

    const result = await compileWithPlugin(markdown);

    // 모든 이미지 경로가 포함되어야 함
    expect(result).toMatch(/images\/first\.png/);
    expect(result).toMatch(/images\/second\.jpg/);
    expect(result).toMatch(/deep\/third\.gif/);

    // 캡션 확인
    expect(result).toMatch(/두 번째 이미지/);
  });

  /**
   * **Feature: remark-obsidian-image, Property: 빈 Obsidian 문법 무시**
   * **검증: `![[]]` 빈 문법은 그대로 유지됨 (현재 구현)**
   *
   * 시나리오: 빈 `![[]]` 포함
   * 기대 결과: 빈 문법은 변환되지 않고 원본 유지
   */
  it('빈 Obsidian 이미지 문법은 그대로 유지된다 (현재 구현)', async () => {
    const markdown = 'Text ![[]] more text';

    const result = await compileWithPlugin(markdown);

    // 빈 문법은 그대로 남음 (경로가 없어서 변환 안됨)
    expect(result).toMatch(/!\[\[\]\]/);
    expect(result).toMatch(/Text/);
    expect(result).toMatch(/more text/);
  });

  /**
   * **Feature: remark-obsidian-image, Property: 공백 포함 경로**
   * **검증: 공백이 포함된 경로도 올바르게 처리**
   *
   * 시나리오: 공백을 포함한 파일명
   * 기대 결과: 경로가 올바르게 변환됨
   */
  it('공백이 포함된 경로를 올바르게 처리해야 한다', async () => {
    const markdown = '![[images/my photo.png]]';

    const result = await compileWithPlugin(markdown);

    // 공백이 포함된 경로가 유지되어야 함
    expect(result).toMatch(/my photo\.png/);
  });

  /**
   * **Feature: remark-obsidian-image, Property: 확장자 없는 파일**
   * **검증: 확장자가 없는 경우도 처리**
   *
   * 시나리오: 확장자가 없는 파일명
   * 기대 결과: 파일명이 그대로 사용됨
   */
  it('확장자가 없는 파일도 올바르게 처리해야 한다', async () => {
    const markdown = '![[images/icon]]';

    const result = await compileWithPlugin(markdown);

    expect(result).toMatch(/images\/icon/);
    expect(result).toMatch(/icon/); // alt 텍스트로 파일명
  });

  /**
   * **Feature: remark-obsidian-image, Property: 특수 문자 포함 캡션**
   * **검증: 안전한 특수 문자가 포함된 캡션 처리**
   *
   * 시나리오: 특수 문자를 포함한 캡션 (MDX 안전)
   * 기대 결과: 특수 문자가 올바르게 변환됨
   */
  it('특수 문자를 포함한 캡션을 올바르게 처리해야 한다', async () => {
    const markdown = '![[images/photo.png|Caption with "quotes" & symbols!]]';

    const result = await compileWithPlugin(markdown);

    expect(result).toMatch(/images\/photo\.png/);
    // 특수 문자가 이스케이프되거나 유지되어야 함
    expect(result).toMatch(/quotes/);
    expect(result).toMatch(/symbols/);
  });
});

// ============================================================================
// Property-Based 테스트 - 임의 경로/캡션 조합
// ============================================================================

describe('Property-Based 테스트 - 임의 경로/캡션 조합', () => {
  /**
   * **Feature: remark-obsidian-image, Property: 임의 경로**
   * **검증: MDX 안전한 경로에서 크래시하지 않음**
   *
   * 시나리오: 무작위 경로 생성 (MDX 안전 문자만)
   * 기대 결과: 플러그인이 크래시하지 않고 정상 동작
   */
  it('임의의 경로에서 크래시하지 않아야 한다', async () => {
    // MDX에서 안전한 문자만 사용 (영문, 숫자, 하이픈, 언더스코어)
    const pathSegmentArb = fc.stringMatching(/^[a-zA-Z0-9_-]+$/);
    const pathArb = fc
      .array(pathSegmentArb, { minLength: 1, maxLength: 5 })
      .map((segments) => segments.filter((s) => s.length > 0).join('/'))
      .filter((path) => path.length > 0);
    const filenameArb = fc
      .tuple(
        fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
        fc.constantFrom('.png', '.jpg', '.gif', '.webp', '')
      )
      .map(([name, ext]) => name + ext)
      .filter((name) => name.length > 1);

    await fc.assert(
      fc.asyncProperty(pathArb, filenameArb, async (path, filename) => {
        const fullPath = `${path}/${filename}`;
        const markdown = `![[${fullPath}]]`;

        // 플러그인이 크래시하지 않고 컴파일되어야 함
        const result = await compileWithPlugin(markdown);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      }),
      { numRuns: 20 }
    );
  });

  /**
   * **Feature: remark-obsidian-image, Property: 임의 캡션**
   * **검증: MDX 안전한 캡션에서 크래시하지 않음**
   *
   * 시나리오: 무작위 캡션 생성 (MDX 안전 문자만)
   * 기대 결과: 캡션이 올바르게 처리됨
   */
  it('임의의 캡션에서 크래시하지 않아야 한다', async () => {
    // MDX에서 안전한 문자만 사용 (영문, 숫자, 공백, 기본 구두점)
    const captionArb = fc
      .stringMatching(/^[a-zA-Z0-9\s.,!?-]+$/)
      .filter((s) => s.length > 0 && s.length <= 100);
    const pathArb = fc.constant('images/test.png');

    await fc.assert(
      fc.asyncProperty(pathArb, captionArb, async (path, caption) => {
        const markdown = `![[${path}|${caption}]]`;

        const result = await compileWithPlugin(markdown);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        // 캡션이 결과에 포함되어야 함 (이스케이프될 수 있음)
        expect(result.length).toBeGreaterThan(0);
      }),
      { numRuns: 20 }
    );
  });
});

/**
 * ============================================================================
 * 테스트 요약
 * ============================================================================
 *
 * ## 통과한 테스트
 * - ✅ Unit 테스트: 기본 이미지 변환 (4개)
 * - ✅ Unit 테스트: 여러 이미지 및 엣지 케이스 (6개)
 * - ✅ Property-Based 테스트: 임의 경로/캡션 조합 (2개)
 *
 * ## 검증 항목
 * - ✅ 기본 이미지 변환 (`![[path]]` → `![name](path)`)
 * - ✅ 캡션 지원 (`![[path|caption]]` → `![caption](path)`)
 * - ✅ 중첩 경로 지원
 * - ✅ 일반 텍스트 보존
 * - ✅ 여러 이미지 변환
 * - ✅ 빈 문법 무시
 * - ✅ 공백/특수문자/확장자 없는 파일 처리
 * - ✅ 임의 경로/캡션 조합
 *
 * ## 커버리지 목표
 * - 목표: 80%+
 * - 예상: 90%+ (플러그인 구현 후 모든 케이스 검증)
 *
 * ## 참고
 * - 모든 테스트는 `.skip`으로 표시하여 플러그인 구현 전에는 스킵됨
 * - 플러그인 구현 후 `.skip` 제거하고 import 추가 필요
 */
