'use client';

import { useEffect, useRef } from 'react';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onSuccess,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 환경 변수 확인
    const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

    // ⭐ 환경 변수가 없을 때 에러 처리
    if (!sitekey) {
      console.error(
        '[Turnstile] VITE_TURNSTILE_SITE_KEY environment variable is not set'
      );
      return;
    }

    // Turnstile 스크립트가 로드되지 않았을 때 처리
    if (typeof window.turnstile === 'undefined') {
      console.error('[Turnstile] Turnstile script not loaded');
      return;
    }

    const widgetId = window.turnstile.render(containerRef.current, {
      sitekey,
      callback: (token: string) => {
        onSuccess(token);
      },
    });

    return () => {
      if (widgetId !== undefined) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [onSuccess]);

  return <div ref={containerRef} />;
};
