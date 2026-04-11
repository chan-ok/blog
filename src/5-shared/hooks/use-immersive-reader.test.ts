import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// useRouterState 모킹
vi.mock('@tanstack/react-router', () => ({
  useRouterState: vi.fn(),
}));

import { useRouterState } from '@tanstack/react-router';
import { useImmersiveReader } from './use-immersive-reader';

const mockRouterState = (pathname: string) => {
  vi.mocked(useRouterState).mockReturnValue({
    location: { pathname },
  } as ReturnType<typeof useRouterState>);
};

describe('useImmersiveReader', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('포스트 상세 외 페이지에서는 항상 false를 반환한다', () => {
    mockRouterState('/ko/posts');

    const { result } = renderHook(() => useImmersiveReader());
    expect(result.current).toBe(false);
  });

  it('포스트 상세 페이지에서 최상단(scrollY < 50)이면 false를 반환한다', () => {
    mockRouterState('/ko/posts/2024/test-post');
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });

    const { result } = renderHook(() => useImmersiveReader());
    expect(result.current).toBe(false);
  });

  it('포스트 상세 페이지에서 스크롤 다운 200px 이상이면 true를 반환한다', () => {
    mockRouterState('/ko/posts/2024/test-post');

    const { result } = renderHook(() => useImmersiveReader());

    act(() => {
      Object.defineProperty(window, 'scrollY', {
        value: 250,
        configurable: true,
      });
      // 이전 위치보다 아래로 이동
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(true);
  });

  it('스크롤 업 시 false로 돌아온다', () => {
    mockRouterState('/ko/posts/2024/test-post');

    const { result } = renderHook(() => useImmersiveReader());

    // 스크롤 다운
    act(() => {
      Object.defineProperty(window, 'scrollY', {
        value: 300,
        configurable: true,
      });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(true);

    // 스크롤 업
    act(() => {
      Object.defineProperty(window, 'scrollY', {
        value: 200,
        configurable: true,
      });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(false);
  });
});
