import { useEffect, useState } from 'react';

// 현재 스크롤 진행률(0~100)을 반환하는 훅
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handler = () => {
      if (typeof window === 'undefined') return;

      const scrollY = window.scrollY;
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      // 전체 스크롤 높이가 0 이하인 경우(짧은 페이지) 100으로 처리
      if (totalHeight <= 0) {
        setProgress(100);
        return;
      }

      const calculated = (scrollY / totalHeight) * 100;
      // 0~100 사이로 클램핑
      setProgress(Math.min(100, Math.max(0, calculated)));
    };

    // 초기 진행률 계산
    handler();

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handler);
      return () => window.removeEventListener('scroll', handler);
    }
  }, []);

  return progress;
}
