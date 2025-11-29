import { useEffect, useState } from 'react';

export function useResize() {
  const [size, setSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    const handler = () => {
      if (typeof window !== 'undefined') {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handler);
      return () => window.removeEventListener('resize', handler);
    }
  }, []);

  return size;
}
