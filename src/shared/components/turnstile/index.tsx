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

    // Vite 환경 변수 사용
    const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY!;

    const widgetId = window.turnstile.render(containerRef.current, {
      sitekey,
      callback: (token: string) => {
        onSuccess(token);
      },
    });
    return () => {
      window.turnstile.remove(widgetId);
    };
  }, [onSuccess]);

  return <div ref={containerRef} />;
};
