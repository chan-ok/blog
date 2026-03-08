import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { sanitizeInput } from './sanitize';

/**
 * **Feature: contact-form-sanitization, Property 1: HTML 태그 제거**
 * **검증: 요구사항 1.1, 1.2, 1.3**
 *
 * 모든 HTML 태그(script, style, event handlers 포함)가 포함된 문자열에 대해,
 * sanitizeInput 함수는 HTML 태그가 없는 출력을 생성해야 한다.
 */
describe('Property 1: HTML 태그 제거', () => {
  // HTML 태그를 감지하는 정규식
  const htmlTagRegex = /<[^>]*>/;

  // 다양한 HTML 태그 생성기
  const htmlTagArb = fc.oneof(
    fc.constant('<script>alert("xss")</script>'),
    fc.constant('<img src="x" onerror="alert(1)">'),
    fc.constant('<div onclick="evil()">'),
    fc.constant('<style>body{display:none}</style>'),
    fc.constant('<iframe src="evil.com"></iframe>'),
    fc.constant('<a href="javascript:alert(1)">click</a>'),
    fc.constant('<svg onload="alert(1)">'),
    fc.constant('<input onfocus="alert(1)">'),
    fc.constant('<body onload="alert(1)">'),
    fc.constant('<marquee onstart="alert(1)">')
  );

  // 안전한 텍스트와 HTML 태그를 조합
  const inputWithHtmlArb = fc
    .tuple(fc.string(), htmlTagArb, fc.string())
    .map(([before, tag, after]) => before + tag + after);

  it('HTML 태그가 포함된 입력에서 모든 태그가 제거되어야 한다', () => {
    fc.assert(
      fc.property(inputWithHtmlArb, (input) => {
        const result = sanitizeInput(input);
        expect(htmlTagRegex.test(result)).toBe(false);
      }),
      { numRuns: 20 }
    );
  });

  it('중첩된 HTML 태그도 모두 제거되어야 한다', () => {
    const nestedHtmlArb = fc.oneof(
      fc.constant('<div><script>alert(1)</script></div>'),
      fc.constant('<p><span onclick="evil()">text</span></p>'),
      fc.constant(
        '<table><tr><td><img src=x onerror=alert(1)></td></tr></table>'
      )
    );

    fc.assert(
      fc.property(nestedHtmlArb, (input) => {
        const result = sanitizeInput(input);
        expect(htmlTagRegex.test(result)).toBe(false);
      }),
      { numRuns: 20 }
    );
  });
});

/**
 * **Feature: contact-form-sanitization, Property 2: 안전한 콘텐츠 보존**
 * **검증: 요구사항 1.4, 2.2**
 *
 * 알파벳, 숫자, 공백, 일반 구두점만 포함된 문자열에 대해,
 * sanitizeInput 함수는 정확히 동일한 문자열을 반환해야 한다.
 */
describe('Property 2: 안전한 콘텐츠 보존', () => {
  // 안전한 문자만 포함하는 문자열 생성기
  // 알파벳, 숫자, 공백, 일반 구두점 (HTML 특수문자 제외)
  const safeCharArb = fc
    .string()
    .filter((s) => /^[a-zA-Z0-9 .,!?:;()\-_@#$%^*+=[\]{}|\\/~`]*$/.test(s));

  it('안전한 문자만 포함된 입력은 변경되지 않아야 한다', () => {
    fc.assert(
      fc.property(safeCharArb, (input) => {
        const result = sanitizeInput(input);
        expect(result).toBe(input);
      }),
      { numRuns: 20 }
    );
  });

  it('유니코드 문자(한글, 일본어 등)는 보존되어야 한다', () => {
    const unicodeArb = fc.oneof(
      fc.constant('안녕하세요'),
      fc.constant('こんにちは'),
      fc.constant('你好'),
      fc.constant('مرحبا'),
      fc.constant('🎉🚀💻')
    );

    fc.assert(
      fc.property(unicodeArb, (input) => {
        const result = sanitizeInput(input);
        expect(result).toBe(input);
      }),
      { numRuns: 20 }
    );
  });
});

/**
 * **Feature: contact-form-sanitization, Property 3: 멱등성**
 * **검증: 요구사항 2.3**
 *
 * 모든 문자열에 대해, sanitize(x) === sanitize(sanitize(x))가 성립해야 한다.
 * 즉, 한 번 소독한 결과를 다시 소독해도 동일한 결과가 나와야 한다.
 */
describe('Property 3: 멱등성', () => {
  // 임의의 문자열 (HTML 포함 가능)
  const anyStringArb = fc.string();

  it('sanitize(x) === sanitize(sanitize(x))가 성립해야 한다', () => {
    fc.assert(
      fc.property(anyStringArb, (input) => {
        const once = sanitizeInput(input);
        const twice = sanitizeInput(once);
        expect(once).toBe(twice);
      }),
      { numRuns: 20 }
    );
  });

  it('HTML이 포함된 입력에서도 멱등성이 유지되어야 한다', () => {
    const htmlInputArb = fc.oneof(
      fc.constant('<script>alert(1)</script>'),
      fc.constant('Hello <b>World</b>'),
      fc.constant('<div>Test</div><script>evil()</script>'),
      fc.constant('Normal text with <img src=x onerror=alert(1)> embedded')
    );

    fc.assert(
      fc.property(htmlInputArb, (input) => {
        const once = sanitizeInput(input);
        const twice = sanitizeInput(once);
        expect(once).toBe(twice);
      }),
      { numRuns: 20 }
    );
  });
});
