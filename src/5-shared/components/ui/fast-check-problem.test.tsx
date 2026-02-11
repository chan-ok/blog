/**
 * ============================================================================
 * fast-check에서 unmount 없이 실행할 때 발생하는 문제 검증
 * ============================================================================
 *
 * 이 파일은 Property-Based 테스트에서 unmount()를 호출하지 않으면
 * DOM에 요소가 누적되는 문제를 직접 보여주는 테스트입니다.
 *
 * ## 핵심 개념
 *
 * - Testing Library의 자동 cleanup은 각 `it` 블록이 끝날 때만 동작
 * - fc.assert는 하나의 `it` 블록 내에서 여러 번 콜백을 실행
 * - 따라서 fc.assert 내부에서는 수동으로 unmount()를 호출해야 함
 *
 * ## 디버그 모드
 *
 * 상세 로그를 보려면 DEBUG=true 환경 변수와 함께 실행:
 * ```bash
 * DEBUG=true pnpm test fast-check-problem --run
 * ```
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';

import Button from './button';

// DEBUG 환경 변수가 설정되어 있을 때만 로그 출력
const debug = (...args: unknown[]) => {
  if (process.env.DEBUG === 'true') {
    console.debug(...args);
  }
};

describe('문제 상황: unmount 없이 실행하면 DOM에 요소가 누적됨', () => {
  /**
   * unmount 없이 실행하면 버튼이 DOM에 누적됨을 보여주는 테스트
   *
   * 이 테스트는 의도적으로 unmount를 호출하지 않고,
   * 각 반복마다 DOM에 버튼이 몇 개 있는지 카운트합니다.
   */
  it('unmount 없이 실행하면 버튼이 DOM에 누적됨', () => {
    let iterationCount = 0;

    debug('\n========== 테스트 시작: unmount 없이 실행 ==========\n');

    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), () => {
        iterationCount++;

        // unmount 없이 렌더링
        render(<Button>Button {iterationCount}</Button>);

        // 현재 DOM에 있는 모든 버튼 개수 확인
        const allButtons = screen.getAllByRole('button');

        // 디버그 모드일 때만 현재 상태 출력
        debug(
          `[반복 ${iterationCount}] 렌더링 후 DOM의 버튼 개수: ${allButtons.length}`
        );
        debug(
          `  → 버튼 목록: [${allButtons.map((btn) => btn.textContent).join(', ')}]`
        );

        // 핵심: unmount가 없으면 버튼 개수가 반복 횟수와 같아짐
        // 즉, 이전 반복에서 렌더링한 버튼들이 DOM에 남아있음
        expect(allButtons.length).toBe(iterationCount);
      }),
      { numRuns: 5 } // 5회만 실행해도 충분히 확인 가능
    );

    // 테스트 종료 후 확인: 5개의 버튼이 DOM에 남아있음
    const finalButtons = screen.getAllByRole('button');
    debug(`\n[테스트 종료] 최종 DOM의 버튼 개수: ${finalButtons.length}`);
    debug(
      `  → 버튼 목록: [${finalButtons.map((btn) => btn.textContent).join(', ')}]`
    );
    debug('\n========== 테스트 종료 ==========\n');

    expect(finalButtons.length).toBe(5);
  });

  /**
   * unmount 없이 getByRole 사용 시 에러 발생
   *
   * 여러 버튼이 DOM에 존재할 때 getByRole('button')은
   * "Found multiple elements" 에러를 발생시킵니다.
   */
  it('unmount 없이 getByRole 사용 시 multiple elements 에러 발생', () => {
    let errorOccurred = false;

    try {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 100 }), () => {
          // unmount 없이 렌더링
          render(<Button>Test Button</Button>);

          // 두 번째 반복부터는 버튼이 2개 이상이므로 에러 발생
          screen.getByRole('button');
        }),
        { numRuns: 3 }
      );
    } catch {
      errorOccurred = true;
    }

    // 에러가 발생했음을 확인
    expect(errorOccurred).toBe(true);
  });
});
