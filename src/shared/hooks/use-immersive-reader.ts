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
