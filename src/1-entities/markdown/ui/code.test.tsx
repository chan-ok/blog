import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';

import Code from './code';

/**
 * ============================================================================
 * Code 컴포넌트 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * 인라인 코드와 코드 블록을 렌더링하는 Code 컴포넌트의 정확성을 검증합니다.
 *
 * ## 테스트 범위
 * - ✅ 인라인 코드 렌더링 (className 없을 때)
 * - ✅ 코드 블록 렌더링 (className 있을 때)
 * - ✅ 다크모드 스타일 적용
 * - ✅ children 콘텐츠 렌더링
 * - ✅ className 전달
 *
 * ## 테스트 전략
 * - Unit 테스트: 인라인/블록 모드 구분, 스타일 적용
 * - Property-Based 테스트: 다양한 children과 className 조합
 */

// ============================================================================
// Unit 테스트 - 인라인 코드 렌더링
// ============================================================================

describe('Unit 테스트 - 인라인 코드 렌더링', () => {
  /**
   * **Feature: code-component, Property: 인라인 코드**
   * **검증: className이 없으면 인라인 코드 스타일 적용**
   *
   * 시나리오: className prop 없이 Code 렌더링
   * 기대 결과: 인라인 코드 스타일 (rounded, bg-gray-100, px-1.5, py-0.5) 적용
   */
  it('className이 없으면 인라인 코드로 렌더링해야 한다', () => {
    const { unmount } = render(<Code>const test = 'hello';</Code>);
    const code = screen.getByText("const test = 'hello';");

    // 인라인 코드 스타일 확인
    expect(code.tagName).toBe('CODE');
    expect(code.className).toContain('rounded');
    expect(code.className).toContain('bg-gray-100');
    expect(code.className).toContain('px-1.5');
    expect(code.className).toContain('py-0.5');
    expect(code.className).toContain('font-mono');
    expect(code.className).toContain('text-sm');

    unmount();
  });

  /**
   * **Feature: code-component, Property: 인라인 코드 다크모드**
   * **검증: 인라인 코드에 다크모드 스타일 포함**
   *
   * 시나리오: 인라인 코드 렌더링
   * 기대 결과: dark: 접두사가 붙은 클래스 포함
   */
  it('인라인 코드에 다크모드 클래스가 포함되어야 한다', () => {
    const { unmount } = render(<Code>inline code</Code>);
    const code = screen.getByText('inline code');

    // 다크모드 클래스 확인
    expect(code.className).toContain('dark:bg-gray-700');
    expect(code.className).toContain('dark:text-gray-200');

    unmount();
  });

  /**
   * **Feature: code-component, Property: children 렌더링**
   * **검증: children 텍스트가 올바르게 표시됨**
   *
   * 시나리오: 다양한 텍스트 children 전달
   * 기대 결과: 동일한 텍스트가 렌더링됨
   */
  it('children을 올바르게 렌더링해야 한다', () => {
    const testText = 'const hello = "world";';
    const { unmount } = render(<Code>{testText}</Code>);

    expect(screen.getByText(testText)).toBeInTheDocument();

    unmount();
  });
});

// ============================================================================
// Unit 테스트 - 코드 블록 렌더링
// ============================================================================

describe('Unit 테스트 - 코드 블록 렌더링', () => {
  /**
   * **Feature: code-component, Property: 코드 블록**
   * **검증: className이 있으면 코드 블록 스타일 적용**
   *
   * 시나리오: className prop과 함께 Code 렌더링
   * 기대 결과: 인라인 스타일 없음, className 전달됨
   */
  it('className이 있으면 코드 블록으로 렌더링해야 한다', () => {
    const { unmount } = render(
      <Code className="language-typescript">const test = 'block';</Code>
    );
    const code = screen.getByText("const test = 'block';");

    // 코드 블록 스타일 확인 (인라인 스타일이 없음)
    expect(code.className).toContain('font-mono');
    expect(code.className).toContain('text-sm');
    expect(code.className).toContain('language-typescript');

    // 인라인 코드 스타일이 없어야 함
    expect(code.className).not.toContain('rounded');
    expect(code.className).not.toContain('bg-gray-100');
    expect(code.className).not.toContain('px-1.5');
    expect(code.className).not.toContain('py-0.5');

    unmount();
  });

  /**
   * **Feature: code-component, Property: className 전달**
   * **검증: 전달된 className이 DOM에 반영됨**
   *
   * 시나리오: 다양한 language- className 전달
   * 기대 결과: className이 code 요소에 포함됨
   */
  it('className을 올바르게 전달해야 한다', () => {
    const testClassName = 'language-javascript hljs';
    const { unmount } = render(
      <Code className={testClassName}>const x = 1;</Code>
    );
    const code = screen.getByText('const x = 1;');

    expect(code.className).toContain('language-javascript');
    expect(code.className).toContain('hljs');

    unmount();
  });

  /**
   * **Feature: code-component, Property: 코드 블록 children**
   * **검증: 멀티라인 코드 렌더링**
   *
   * 시나리오: 여러 줄의 코드 전달
   * 기대 결과: 전체 코드가 올바르게 렌더링됨
   */
  it('멀티라인 코드를 올바르게 렌더링해야 한다', () => {
    const multilineCode = `function hello() {\n  console.log("world");\n}`;
    const { unmount, container } = render(
      <Code className="language-javascript">{multilineCode}</Code>
    );

    // container에서 code 요소 찾기
    const code = container.querySelector('code');
    // textContent로 직접 비교 (toHaveTextContent는 공백 정규화)
    expect(code?.textContent).toBe(multilineCode);

    unmount();
  });
});

// ============================================================================
// Property-Based 테스트 - 다양한 언어 className
// ============================================================================

describe('Property-Based 테스트 - 다양한 언어 className', () => {
  /**
   * **Feature: code-component, Property: 모든 언어 지원**
   * **검증: 다양한 language- className에서 에러 없이 렌더링**
   *
   * 시나리오: 여러 프로그래밍 언어의 className 전달
   * 기대 결과: 모든 경우에 정상 렌더링, className 포함
   */
  it('모든 언어 className에서 정상 렌더링되어야 한다', () => {
    const languageArb = fc.constantFrom(
      'language-typescript',
      'language-javascript',
      'language-python',
      'language-java',
      'language-rust',
      'language-go',
      'language-bash',
      'language-json',
      'language-yaml',
      'language-markdown'
    );

    // 알파벳과 숫자만 포함한 안전한 문자열 생성
    const contentArb = fc.stringMatching(/^[a-zA-Z0-9]+$/);

    fc.assert(
      fc.property(languageArb, contentArb, (lang, content) => {
        const { unmount, container } = render(
          <Code className={lang}>{content}</Code>
        );

        // container에서 code 요소 찾기
        const code = container.querySelector('code');
        expect(code).toBeTruthy();

        // className이 포함되어 있는지 확인
        expect(code?.className).toContain(lang);

        // 코드 블록 기본 스타일 확인
        expect(code?.className).toContain('font-mono');
        expect(code?.className).toContain('text-sm');

        unmount();
      }),
      { numRuns: 30 }
    );
  });

  /**
   * **Feature: code-component, Property: 인라인 코드 children 다양성**
   * **검증: 모든 텍스트 children에서 정상 렌더링**
   *
   * 시나리오: 무작위 문자열을 children으로 전달 (인라인 모드)
   * 기대 결과: 모든 경우에 에러 없이 렌더링, 인라인 스타일 적용
   */
  it('모든 텍스트 children을 인라인 코드로 렌더링해야 한다', () => {
    // 알파벳과 숫자만 포함한 안전한 문자열 생성
    const textArb = fc.stringMatching(/^[a-zA-Z0-9]+$/);

    fc.assert(
      fc.property(textArb, (text) => {
        const { unmount, container } = render(<Code>{text}</Code>);

        // container에서 code 요소 찾기
        const code = container.querySelector('code');
        expect(code).toBeTruthy();

        // 인라인 코드 스타일 확인
        expect(code?.className).toContain('rounded');
        expect(code?.className).toContain('bg-gray-100');
        expect(code?.className).toContain('dark:bg-gray-700');

        unmount();
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
 * - ✅ Unit 테스트: 인라인 코드 렌더링 (3개)
 * - ✅ Unit 테스트: 코드 블록 렌더링 (3개)
 * - ✅ Property-Based 테스트: 다양한 언어/children (2개)
 *
 * ## 검증 항목
 * - ✅ 인라인/블록 모드 자동 감지 (className 유무)
 * - ✅ 다크모드 스타일 적용
 * - ✅ children 렌더링
 * - ✅ className 전달
 * - ✅ 모든 언어 지원
 *
 * ## 커버리지 목표
 * - 목표: 80%+
 * - 예상: 100% (단순한 조건부 렌더링 컴포넌트)
 */
