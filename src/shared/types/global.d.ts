declare global {
  type LocaleType = import('@/shared/types/common.schema').LocaleType;

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

  namespace NodeJS {
    interface ProcessEnv {
      // Git repository configuration
      NEXT_PUBLIC_GIT_RAW_URL: string;
      NEXT_PUBLIC_CONTENT_REPO_URL: string;
    }
  }
}

export {};
