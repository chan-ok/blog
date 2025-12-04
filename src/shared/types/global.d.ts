declare global {
  // reference: https://github.com/vnphanquang/svelte-put
  interface TurnstileConfig {
    sitekey: string;
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact' | 'invisible';
    tabindex?: number;
    retry?: 'auto' | boolean;
    action?: string;
    cData?: string;
    [key: string]: unknown;
  }

  interface TurnstileWidget {
    render(container: string | HTMLElement, config: TurnstileConfig): string;
    reset(widgetId: string): void;
    remove(widgetId: string): void;
    getResponse(widgetId: string): string | undefined;
    isExpired(widgetId: string): boolean;
    execute?(container: string | HTMLElement, config?: TurnstileConfig): void;
  }
  interface Window {
    turnstile: TurnstileWidget;
  }

  // locale
  const LOCALES = ['ko', 'en', 'ja'] as const;
  type Locale = (typeof LOCALES)[number];
}

export {};
