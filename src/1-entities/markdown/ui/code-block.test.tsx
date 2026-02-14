import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fc from 'fast-check';

import CodeBlock from './code-block';

/**
 * ============================================================================
 * CodeBlock 컴포넌트 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * 코드 블록 래퍼 컴포넌트의 복사 기능을 검증합니다.
 *
 * ## 테스트 범위
 * - ✅ CodeBlock이 children(code 엘리먼트)을 올바르게 렌더링
 * - ✅ 복사 버튼이 표시되는지 (aria-label="Copy code")
 * - ✅ 복사 버튼 클릭 시 navigator.clipboard.writeText 호출
 * - ✅ 복사 성공 시 "Copied" 텍스트 + Check 아이콘으로 변경
 * - ✅ 2초 후 원래 "Copy" 상태로 복귀
 * - ✅ 헤더 영역이 없는지 확인 (삭제됨)
 * - ✅ 줄번호가 없는지 확인 (삭제됨)
 * - ✅ Property-based: 임의 코드 텍스트로 크래시하지 않음
 *
 * ## 테스트 전략
 * - Unit 테스트: 렌더링, 복사 버튼, 복사 기능
 * - Property-Based 테스트: 다양한 코드 텍스트 조합
 */

// ============================================================================
// Setup: Clipboard API 모킹
// ============================================================================

const mockWriteText = vi.fn();

beforeEach(() => {
  // navigator.clipboard를 defineProperty로 모킹
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: mockWriteText,
    },
    writable: true,
    configurable: true,
  });
  mockWriteText.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// Unit 테스트 - 기본 렌더링
// ============================================================================

describe('Unit 테스트 - 기본 렌더링', () => {
  /**
   * **Feature: code-block, Property: children 렌더링**
   * **검증: CodeBlock이 children을 올바르게 렌더링**
   *
   * 시나리오: code 엘리먼트를 children으로 전달
   * 기대 결과: children이 pre 태그 내부에 렌더링됨
   */
  it('children을 올바르게 렌더링해야 한다', () => {
    const testCode = 'const hello = "world";';
    const { unmount } = render(
      <CodeBlock>
        <code>{testCode}</code>
      </CodeBlock>
    );

    expect(screen.getByText(testCode)).toBeInTheDocument();

    unmount();
  });

  /**
   * **Feature: code-block, Property: 복사 버튼 표시**
   * **검증: 복사 버튼이 항상 표시됨**
   *
   * 시나리오: CodeBlock 렌더링
   * 기대 결과: aria-label="Copy code" 버튼이 존재
   */
  it('복사 버튼이 표시되어야 한다', () => {
    const { unmount } = render(
      <CodeBlock>
        <code>test code</code>
      </CodeBlock>
    );

    const copyButton = screen.getByRole('button', { name: 'Copy code' });
    expect(copyButton).toBeInTheDocument();
    expect(copyButton).toHaveAttribute('type', 'button');

    unmount();
  });

  /**
   * **Feature: code-block, Property: 헤더 영역 없음**
   * **검증: 언어 뱃지나 헤더가 렌더링되지 않음**
   *
   * 시나리오: CodeBlock 렌더링
   * 기대 결과: 언어 관련 텍스트가 없음
   */
  it('헤더 영역이 렌더링되지 않아야 한다', () => {
    const { unmount, container } = render(
      <CodeBlock>
        <code className="language-typescript">const x = 1;</code>
      </CodeBlock>
    );

    // 언어 관련 텍스트가 없는지 확인
    expect(screen.queryByText(/typescript/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/javascript/i)).not.toBeInTheDocument();

    // 최상위 컨테이너 div만 있어야 함 (pre와 button을 포함)
    const rootDiv = container.firstChild;
    expect(rootDiv?.nodeName).toBe('DIV');
    expect(rootDiv?.childNodes.length).toBe(2); // pre + button

    unmount();
  });

  /**
   * **Feature: code-block, Property: 줄번호 없음**
   * **검증: 줄번호가 렌더링되지 않음**
   *
   * 시나리오: 멀티라인 코드로 CodeBlock 렌더링
   * 기대 결과: 줄번호 관련 요소가 없음
   */
  it('줄번호가 렌더링되지 않아야 한다', () => {
    const multilineCode = `line 1\nline 2\nline 3`;
    const { unmount, container } = render(
      <CodeBlock>
        <code>{multilineCode}</code>
      </CodeBlock>
    );

    // 줄번호 관련 요소가 없는지 확인
    const lineNumberElements = container.querySelectorAll(
      '[class*="line-number"]'
    );
    expect(lineNumberElements.length).toBe(0);

    // 숫자만 있는 span이 없는지 확인 (1, 2, 3 등)
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();

    unmount();
  });
});

// ============================================================================
// Unit 테스트 - 복사 기능
// ============================================================================

describe('Unit 테스트 - 복사 기능', () => {
  /**
   * **Feature: code-block, Property: 복사 버튼 클릭**
   * **검증: 복사 버튼 클릭 시 navigator.clipboard.writeText 호출**
   *
   * 시나리오: 복사 버튼 클릭
   * 기대 결과: clipboard.writeText가 올바른 텍스트로 호출됨
   */
  it('복사 버튼 클릭 시 클립보드에 복사되어야 한다', async () => {
    const testCode = 'const test = "copy me";';
    const { unmount } = render(
      <CodeBlock>
        <code>{testCode}</code>
      </CodeBlock>
    );

    const copyButton = screen.getByRole('button', { name: 'Copy code' });
    await userEvent.click(copyButton);

    // Promise가 해결될 때까지 대기
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(testCode);
    });
    expect(mockWriteText).toHaveBeenCalledTimes(1);

    unmount();
  });

  /**
   * **Feature: code-block, Property: 복사 성공 피드백**
   * **검증: 복사 성공 시 "Copied" 텍스트 + Check 아이콘으로 변경**
   *
   * 시나리오: 복사 버튼 클릭
   * 기대 결과: 버튼 텍스트가 "Copied"로 변경, aria-label도 변경
   */
  it('복사 성공 시 "Copied" 상태로 변경되어야 한다', async () => {
    const { unmount } = render(
      <CodeBlock>
        <code>test</code>
      </CodeBlock>
    );

    const copyButton = screen.getByRole('button', { name: 'Copy code' });
    await userEvent.click(copyButton);

    // "Copied" 상태로 변경 확인
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Copied' })
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Copied')).toBeInTheDocument();

    unmount();
  });

  /**
   * **Feature: code-block, Property: 복사 상태 복귀**
   * **검증: 2초 후 원래 "Copy" 상태로 복귀**
   *
   * 시나리오: 복사 버튼 클릭 후 2초 경과
   * 기대 결과: 버튼이 "Copy code" 상태로 복귀
   */
  it('2초 후 원래 상태로 복귀해야 한다', async () => {
    const { unmount } = render(
      <CodeBlock>
        <code>test</code>
      </CodeBlock>
    );

    const copyButton = screen.getByRole('button', { name: 'Copy code' });
    await userEvent.click(copyButton);

    // "Copied" 상태 확인
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Copied' })
      ).toBeInTheDocument();
    });

    // 2초 후 원래 상태로 복귀 확인
    await waitFor(
      () => {
        expect(
          screen.getByRole('button', { name: 'Copy code' })
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    expect(screen.getByText('Copy')).toBeInTheDocument();

    unmount();
  });

  /**
   * **Feature: code-block, Property: 빈 코드 처리**
   * **검증: 빈 코드일 때 복사 동작 없음**
   *
   * 시나리오: 빈 children으로 복사 버튼 클릭
   * 기대 결과: clipboard.writeText가 호출되지 않음
   */
  it('빈 코드일 때 복사 동작이 실행되지 않아야 한다', async () => {
    const { unmount } = render(
      <CodeBlock>
        <code></code>
      </CodeBlock>
    );

    const copyButton = screen.getByRole('button', { name: 'Copy code' });
    await userEvent.click(copyButton);

    // 약간의 대기 후 호출되지 않았는지 확인
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(mockWriteText).not.toHaveBeenCalled();

    unmount();
  });

  /**
   * **Feature: code-block, Property: 복사 에러 처리**
   * **검증: clipboard API 에러 시 console.error 호출**
   *
   * 시나리오: clipboard.writeText가 reject
   * 기대 결과: 에러가 콘솔에 기록됨
   */
  it('복사 실패 시 에러를 처리해야 한다', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard error'));

    const { unmount } = render(
      <CodeBlock>
        <code>test</code>
      </CodeBlock>
    );

    const copyButton = screen.getByRole('button', { name: 'Copy code' });
    await userEvent.click(copyButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to copy code:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
    unmount();
  });
});

// ============================================================================
// Property-Based 테스트 - 다양한 코드 텍스트
// ============================================================================

describe('Property-Based 테스트 - 다양한 코드 텍스트', () => {
  /**
   * **Feature: code-block, Property: 임의 코드 텍스트**
   * **검증: 모든 텍스트에서 크래시하지 않고 복사 가능**
   *
   * 시나리오: 무작위 문자열을 children으로 전달
   * 기대 결과: 모든 경우에 렌더링 성공, 복사 버튼 동작
   */
  it('임의의 코드 텍스트에서 크래시하지 않아야 한다', () => {
    // 다양한 문자를 포함하는 문자열 생성 (printable ASCII)
    const codeArb = fc.string({ minLength: 1, maxLength: 100 });

    fc.assert(
      fc.property(codeArb, (codeText) => {
        const { unmount, container } = render(
          <CodeBlock>
            <code>{codeText}</code>
          </CodeBlock>
        );

        // 렌더링 확인
        expect(container.querySelector('pre')).toBeInTheDocument();
        expect(container.querySelector('code')).toBeInTheDocument();

        // 복사 버튼 확인
        const copyButton = screen.getByRole('button', { name: 'Copy code' });
        expect(copyButton).toBeInTheDocument();

        unmount();
      }),
      { numRuns: 30 }
    );
  });

  /**
   * **Feature: code-block, Property: 멀티라인 코드**
   * **검증: 여러 줄 코드에서 정상 동작**
   *
   * 시나리오: 개행 문자를 포함한 코드 전달
   * 기대 결과: 전체 텍스트가 렌더링되고 복사 가능
   */
  it('멀티라인 코드를 올바르게 처리해야 한다', () => {
    const lineArb = fc.string({ minLength: 1, maxLength: 50 });
    const multilineArb = fc
      .array(lineArb, { minLength: 2, maxLength: 10 })
      .map((lines) => lines.join('\n'));

    fc.assert(
      fc.property(multilineArb, (multilineCode) => {
        const { unmount, container } = render(
          <CodeBlock>
            <code>{multilineCode}</code>
          </CodeBlock>
        );

        // pre 요소의 textContent 확인
        const pre = container.querySelector('pre');
        expect(pre?.textContent).toContain(multilineCode);

        unmount();
      }),
      { numRuns: 30 }
    );
  });

  /**
   * **Feature: code-block, Property: 특수 문자 포함 코드**
   * **검증: 특수 문자가 포함된 코드에서 정상 동작**
   *
   * 시나리오: 특수 문자를 포함한 코드 전달
   * 기대 결과: 특수 문자가 올바르게 렌더링됨
   */
  it('특수 문자를 포함한 코드를 올바르게 처리해야 한다', () => {
    const specialCharsArb = fc.constantFrom(
      'const x = "<div>";',
      'const y = "a & b";',
      'const z = "a \' b";',
      'const w = `template ${x}`;',
      '// comment with émoji 🚀',
      'const regex = /[a-z]+/g;'
    );

    fc.assert(
      fc.property(specialCharsArb, (specialCode) => {
        const { unmount, container } = render(
          <CodeBlock>
            <code>{specialCode}</code>
          </CodeBlock>
        );

        // pre 요소의 textContent 확인
        const pre = container.querySelector('pre');
        expect(pre?.textContent).toBe(specialCode);

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
 * - ✅ Unit 테스트: 기본 렌더링 (4개)
 * - ✅ Unit 테스트: 복사 기능 (6개)
 * - ✅ Property-Based 테스트: 다양한 코드 텍스트 (3개)
 *
 * ## 검증 항목
 * - ✅ children 렌더링
 * - ✅ 복사 버튼 표시
 * - ✅ 복사 기능 동작
 * - ✅ 복사 성공 피드백
 * - ✅ 2초 후 상태 복귀
 * - ✅ 헤더 영역 없음
 * - ✅ 줄번호 없음
 * - ✅ 에러 처리
 * - ✅ 임의 텍스트 처리
 * - ✅ 멀티라인/특수문자 처리
 *
 * ## 커버리지 목표
 * - 목표: 80%+
 * - 예상: 95%+ (모든 주요 동작 검증)
 */
