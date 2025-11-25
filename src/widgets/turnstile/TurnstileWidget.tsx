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
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!;
    const widgetId = (window as any).turnstile.render(containerRef.current, {
      sitekey,
      callback: (token: string) => {
        onSuccess(token);
      },
    });
    return () => {
      (window as any).turnstile.remove(widgetId);
    };
  }, [onSuccess]);

  return <div ref={containerRef} />;
};
