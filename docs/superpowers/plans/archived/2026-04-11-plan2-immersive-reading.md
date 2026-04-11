> ✅ **완료** — 2026-04-11

# 몰입형 읽기 모드 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 포스트 상세 페이지에서 스크롤 다운 시 헤더를 자동으로 숨겨 읽기 몰입감을 높인다.

**Architecture:** `useImmersiveReader` 훅이 현재 라우트 + 스크롤 방향을 감지해 `isHidden` 상태를 반환한다. 헤더가 이 상태를 받아 CSS transform으로 슬라이드 업/다운한다.

**Tech Stack:** React 19, TanStack Router (`useRouterState`), Vitest

**전제 조건:** Plan 1 (디자인 개편) 완료 후 진행한다. 헤더가 마스트헤드 방식으로 바뀌어 있어야 한다.

---

## 파일 맵

| 동작 | 파일                                              | 내용                         |
| ---- | ------------------------------------------------- | ---------------------------- |
| 생성 | `src/5-shared/hooks/use-immersive-reader.ts`      | 스크롤 방향 + 라우트 감지 훅 |
| 생성 | `src/5-shared/hooks/use-immersive-reader.test.ts` | 훅 단위 테스트               |
| 수정 | `src/3-widgets/header.tsx`                        | isHidden 상태 연결           |

---

## Task 1: useImmersiveReader 훅

**Files:**

- Create: `src/5-shared/hooks/use-immersive-reader.ts`
- Create: `src/5-shared/hooks/use-immersive-reader.test.ts`

동작 규칙:

- 포스트 상세 페이지(`/$locale/posts/$`) 이외에서는 항상 `false` 반환
- `scrollY < 50` (최상단): 항상 `false`
- 스크롤 다운 200px 이상: `true`
- 스크롤 업: `false`

- [ ] **Step 1: 테스트 파일 작성**

```ts
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
      Object.defineProperty(window, 'scrollY', { value: 250, configurable: true });
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
      Object.defineProperty(window, 'scrollY', { value: 300, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(true);

    // 스크롤 업
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 200, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(false);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
pnpm test run src/5-shared/hooks/use-immersive-reader.test.ts
```

Expected: FAIL (파일 없음)

- [ ] **Step 3: 훅 구현**

```ts
import { useState, useEffect, useRef } from 'react';
import { useRouterState } from '@tanstack/react-router';

/**
 * 포스트 상세 페이지에서 스크롤 방향을 감지하여
 * 헤더 숨김 여부를 반환하는 훅.
 *
 * - 포스트 상세 외 페이지: 항상 false
 * - scrollY < 50 (최상단): false
 * - 스크롤 다운 > 200px: true
 * - 스크롤 업: false
 */
export function useImmersiveReader(): boolean {
  const { location } = useRouterState();
  const pathname = location.pathname;

  // /$locale/posts/... 패턴 — 최소 4개 세그먼트 (locale/posts/year/slug)
  const isPostDetail = /^\/[^/]+\/posts\/.+/.test(pathname);

  const [isHidden, setIsHidden] = useState(false);
  const prevScrollY = useRef(0);

  useEffect(() => {
    if (!isPostDetail) {
      setIsHidden(false);
      return;
    }

    const handleScroll = () => {
      const currentY = window.scrollY;

      // 최상단 근처에서는 항상 표시
      if (currentY < 50) {
        setIsHidden(false);
        prevScrollY.current = currentY;
        return;
      }

      const diff = currentY - prevScrollY.current;

      if (diff > 0) {
        // 스크롤 다운
        setIsHidden(true);
      } else if (diff < 0) {
        // 스크롤 업
        setIsHidden(false);
      }

      prevScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPostDetail]);

  return isHidden;
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
pnpm test run src/5-shared/hooks/use-immersive-reader.test.ts
```

Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/5-shared/hooks/use-immersive-reader.ts \
        src/5-shared/hooks/use-immersive-reader.test.ts
git commit -m "feat(hooks): useImmersiveReader 훅 추가"
```

---

## Task 2: 헤더에 몰입형 읽기 모드 연결

**Files:**

- Modify: `src/3-widgets/header.tsx`

- [ ] **Step 1: header.tsx에 훅 연결**

`src/3-widgets/header.tsx`에 import 추가 및 애니메이션 적용:

```tsx
import { useImmersiveReader } from '@/5-shared/hooks/use-immersive-reader';
import clsx from 'clsx';
```

`Header` 함수 상단에 추가:

```tsx
export default function Header() {
  const { location } = useRouterState();
  const pathname = location.pathname;
  const isHidden = useImmersiveReader();
  // ... 기존 코드 ...
```

`<header>` 태그에 숨김 클래스 적용:

```tsx
<header
  className={clsx(
    'border-b-2 border-ink bg-bg',
    'transition-transform duration-300 ease-in-out',
    isHidden ? '-translate-y-full' : 'translate-y-0'
  )}
>
```

- [ ] **Step 2: ScrollProgressBar 독립성 확인**

`src/4-pages/$locale/posts/$.tsx`에서 `<ScrollProgressBar />`는 헤더와 별도로 `fixed` 포지션이어야 한다. 현재 코드를 확인하고 `z-index`가 헤더보다 높게 설정되어 있는지 확인한다.

`src/5-shared/components/scroll-progress-bar/index.tsx`를 읽어 `fixed top-0` 클래스가 있는지 확인. 없으면 추가:

```tsx
// scroll-progress-bar가 fixed top-0 z-50 이상이어야 함
// 헤더가 숨겨져도 progress bar는 항상 보여야 한다
```

- [ ] **Step 3: 포스트 페이지에서 동작 확인**

`http://localhost:5173/ko/posts/{실제-슬러그}` 에서:

1. 페이지 열면 헤더 보임
2. 스크롤 다운 → 헤더 슬라이드 업으로 사라짐
3. 스크롤 업 → 헤더 슬라이드 다운으로 나타남
4. 페이지 상단으로 돌아오면 헤더 항상 표시

`http://localhost:5173/ko/posts` (목록 페이지)에서:

- 스크롤해도 헤더가 사라지지 않음

- [ ] **Step 4: 전체 테스트 실행**

```bash
pnpm test run
```

Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/3-widgets/header.tsx
git commit -m "feat(header): 포스트 상세 페이지 스크롤 시 헤더 자동 숨김"
```

---

## 완료 기준

- [ ] 전체 테스트 PASS
- [ ] 타입 오류 없음 (`pnpm tsc --noEmit`)
- [ ] 포스트 상세 페이지 스크롤 다운 시 헤더 숨김
- [ ] 스크롤 업 또는 최상단 복귀 시 헤더 재표시
- [ ] 다른 페이지(홈, 목록)에서 헤더 항상 표시
- [ ] ScrollProgressBar는 헤더 상태와 무관하게 항상 표시
