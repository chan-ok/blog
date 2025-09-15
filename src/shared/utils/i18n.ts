export type Locale = "ko" | "en" | "ja";

export const SUPPORTED_LOCALES: Locale[] = ["ko", "en", "ja"];
export const DEFAULT_LOCALE: Locale = "ko";

// 브라우저 언어 감지 함수
export function detectBrowserLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const browserLang = navigator.language.split("-")[0] as Locale;
  return SUPPORTED_LOCALES.includes(browserLang) ? browserLang : DEFAULT_LOCALE;
}

// Locale 유효성 검사
export function validateLocale(locale: string | undefined): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}
