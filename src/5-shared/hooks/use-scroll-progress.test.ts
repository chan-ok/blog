import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import fc from 'fast-check';

import { useScrollProgress } from './use-scroll-progress';

// ============================================================================
// 헬퍼: jsdom에서 window/document 스크롤 관련 속성 모킹
// ============================================================================

/**
 * jsdom은 실제 레이아웃이 없으므로 scrollY, scrollHeight, innerHeight를
 * Object.defineProperty로 직접 설정해야 한다.
 */
function mockScrollEnvironment(scrollY: number, scrollHeight: number, innerHeight: number) {
  Object.defineProperty(window, 'scrollY', {
    writable: true,
    configurable: true,
    value: scrollY,
  });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    writable: true,
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: innerHeight,
  });
}

// ============================================================================
// 테스트 전/후 처리
// ============================================================================

afterEach(() => {
  vi.restoreAllMocks();
  // 각 테스트 후 스크롤 환경 초기화
  mockScrollEnvironment(0, 0, 0);
});

// ============================================================================
// Unit 테스트: 초기 상태
// ============================================================================

describe('useScrollProgress - 초기 상태', () => {
  it('초기 렌더 시 scrollY=0, totalHeight>0이면 0을 반환해야 한다', () => {
    // scrollHeight=500, innerHeight=100 → totalHeight=400
    mockScrollEnvironment(0, 500, 100);

    const { result } = renderHook(() => useScrollProgress());

    expect(result.current).toBe(0);
  });

  it('최하단 도달 시(scrollY === totalHeight) 100을 반환해야 한다', () => {
    // totalHeight = scrollHeight - innerHeight = 400
    mockScrollEnvironment(400, 500, 100);

    const { result } = renderHook(() => useScrollProgress());

    expect(result.current).toBe(100);
  });

  it('짧은 페이지(scrollHeight - innerHeight <= 0)에서 100을 반환해야 한다', () => {
    // scrollHeight <= innerHeight → totalHeight <= 0
    mockScrollEnvironment(0, 100, 200);

    const { result } = renderHook(() => useScrollProgress());

    expect(result.current).toBe(100);
  });

  it('scrollHeight === innerHeight 인 경우에도 100을 반환해야 한다', () => {
    // totalHeight = 0
    mockScrollEnvironment(0, 500, 500);

    const { result } = renderHook(() => useScrollProgress());

    expect(result.current).toBe(100);
  });
});

// ============================================================================
// Unit 테스트: scroll 이벤트 반응
// ============================================================================

describe('useScrollProgress - scroll 이벤트', () => {
  it('scroll 이벤트 발생 시 진행률이 업데이트되어야 한다', () => {
    // 초기: scrollY=0
    mockScrollEnvironment(0, 500, 100);

    const { result } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(0);

    // 스크롤 50% 지점으로 이동
    act(() => {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 200, // 200/400 = 50%
      });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(50);
  });

  it('scroll 이벤트 후 최대값 100을 초과하지 않아야 한다', () => {
    // scrollY가 totalHeight보다 큰 경우 (예: 오버스크롤)
    mockScrollEnvironment(0, 500, 100);

    const { result } = renderHook(() => useScrollProgress());

    act(() => {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 999, // totalHeight(400)보다 큼
      });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(100);
  });

  it('scroll 이벤트 후 최솟값 0 미만이 되지 않아야 한다', () => {
    // scrollY가 음수인 경우 (예: iOS 오버스크롤)
    mockScrollEnvironment(0, 500, 100);

    const { result } = renderHook(() => useScrollProgress());

    act(() => {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: -50,
      });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(0);
  });
});

// ============================================================================
// Unit 테스트: 이벤트 리스너 등록/해제
// ============================================================================

describe('useScrollProgress - 이벤트 리스너 생명주기', () => {
  it('mount 시 scroll 이벤트 리스너가 등록되어야 한다', () => {
    mockScrollEnvironment(0, 500, 100);

    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useScrollProgress());

    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('unmount 시 scroll 이벤트 리스너가 제거되어야 한다', () => {
    mockScrollEnvironment(0, 500, 100);

    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useScrollProgress());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('unmount 후 scroll 이벤트를 발생시켜도 상태가 변경되지 않아야 한다', () => {
    mockScrollEnvironment(0, 500, 100);

    const { result, unmount } = renderHook(() => useScrollProgress());
    const progressBeforeUnmount = result.current;

    unmount();

    // unmount 후 scroll 이벤트 발생
    act(() => {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 200,
      });
      window.dispatchEvent(new Event('scroll'));
    });

    // 상태가 변경되지 않음 (컴포넌트가 unmount되었으므로)
    expect(result.current).toBe(progressBeforeUnmount);
  });
});

// ============================================================================
// Property-Based 테스트: 항상 0~100 범위 보장
// ============================================================================

describe('useScrollProgress - Property-Based 테스트', () => {
  it('임의의 scrollY/totalHeight 조합에서 항상 0~100 범위를 반환해야 한다', { timeout: 15000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        // scrollY: 0~10000, scrollHeight: 1~10100, innerHeight: 100
        fc.integer({ min: 0, max: 10000 }),
        fc.integer({ min: 1, max: 10000 }),
        async (scrollY, totalHeight) => {
          // scrollHeight = totalHeight + innerHeight
          const innerHeight = 100;
          const scrollHeight = totalHeight + innerHeight;

          mockScrollEnvironment(scrollY, scrollHeight, innerHeight);

          const { result } = renderHook(() => useScrollProgress());

          // scroll 이벤트로 값 업데이트 유도
          act(() => {
            window.dispatchEvent(new Event('scroll'));
          });

          // 항상 0~100 사이여야 한다
          expect(result.current).toBeGreaterThanOrEqual(0);
          expect(result.current).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('짧은 페이지(totalHeight <= 0)에서 항상 100을 반환해야 한다', async () => {
    await fc.assert(
      fc.asyncProperty(
        // innerHeight >= scrollHeight → totalHeight <= 0
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 0, max: 1000 }),
        async (scrollHeight, extraHeight) => {
          const innerHeight = scrollHeight + extraHeight;
          mockScrollEnvironment(0, scrollHeight, innerHeight);

          const { result } = renderHook(() => useScrollProgress());

          expect(result.current).toBe(100);
        }
      ),
      { numRuns: 20 }
    );
  });
});
