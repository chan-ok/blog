import { useEffect, useState } from 'react';

export function useDetectScrolled() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (typeof window !== 'undefined') {
        setScrolled(window.scrollY > 0);
      }
    };
    handler();

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handler);
      return () => window.removeEventListener('scroll', handler);
    }
  }, []);

  return scrolled;
}
