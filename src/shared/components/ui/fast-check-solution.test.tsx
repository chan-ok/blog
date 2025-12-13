/**
 * ============================================================================
 * fast-check에서 unmount를 사용한 올바른 패턴 검증
 * ============================================================================
 *
 * 이 파일은 Property-Based 테스트에서 unmount()를 올바르게 사용하면
 * DOM이 깨끗하게 유지되는 것을 보여주는 테스트입니다.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';

import { Button } from './button';

describe('해결책: unmount를 호출하면 DOM이 깨끗하게 유지됨', () => {
  /**
   * unmount를 호출하면 항상 버튼이 1개만 존재함
   */
  it('unmount를 호출하면 항상 버튼이 1개만 존재함', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), () => {
        // unmount를 받아서 사용
        const { unmount } = render(<Button>Test Button</Button>);

        // 현재 DOM에 있는 모든 버튼 개수 확인
        const allButtons = screen.getAllByRole('button');

        // 핵심: unmount를 호출하면 항상 버튼이 1개만 존재
        expect(allButtons.length).toBe(1);

        // 각 반복이 끝날 때 unmount 호출
        unmount();
      }),
      { numRuns: 5 }
    );

    // 테스트 종료 후 확인: DOM에 버튼이 없음
    const finalButtons = screen.queryAllByRole('button');
    expect(finalButtons.length).toBe(0);
  });

  /**
   * 여러 컴포넌트 렌더링 시 모든 unmount를 호출해야 함
   */
  it('여러 컴포넌트 렌더링 시 모든 unmount를 호출해야 함', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('primary', 'default', 'danger'),
        (variant) => {
          // 두 개의 버튼을 렌더링
          const { unmount: unmount1 } = render(
            <Button variant={variant}>Button A</Button>
          );
          const { unmount: unmount2 } = render(
            <Button variant="link">Button B</Button>
          );

          // 현재 DOM에는 정확히 2개의 버튼만 존재
          const allButtons = screen.getAllByRole('button');
          expect(allButtons.length).toBe(2);

          // 모든 렌더링된 컴포넌트 정리
          unmount1();
          unmount2();

          // 정리 후 버튼이 없음을 확인
          const remainingButtons = screen.queryAllByRole('button');
          expect(remainingButtons.length).toBe(0);
        }
      ),
      { numRuns: 3 }
    );
  });
});
