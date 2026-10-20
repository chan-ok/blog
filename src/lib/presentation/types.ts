export const FRAMEWORKS = ['react', 'vue', 'svelte'] as const;
export const LOCALES = ['ko', 'ja'] as const;
export type Framework = (typeof FRAMEWORKS)[number];
export type Locale = (typeof LOCALES)[number];
export interface RouteContext {
  framework: Framework;
  locale: Locale;
  explicitFramework: boolean;
}
export type PageRef = { kind: 'home' | 'posts' | 'about' } | { kind: 'post'; slug: string[] };
