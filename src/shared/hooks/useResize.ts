import { useEffect, useState } from 'react';

export function useResize() {
  // 초기 상태를 0으로 설정하여 서버와 클라이언트의 렌더링 결과를 일치시킴
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // 첫 마운트 시 실제 window 크기를 설정
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // 즉시 크기 업데이트
    updateSize();

    // resize 이벤트 리스너 등록
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}
