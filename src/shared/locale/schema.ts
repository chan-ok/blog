import { z } from 'zod';

export const LocaleSchema = z.enum(['ko', 'ja']);

export const TranslationResourceSchema = z.object({
  nav: z.object({
    about: z.string().min(1),
    posts: z.string().min(1),
    contact: z.string().min(1),
  }),
  about: z.object({
    label: z.string().min(1),
    greeting: z.string().min(1),
    introduction: z.string().min(1),
    emailLabel: z.string().min(1),
    githubLabel: z.string().min(1),
  }),
  contact: z.object({
    from: z.string().min(1),
    fromPlaceholder: z.string().min(1),
    message: z.string().min(1),
    placeholder: z.string().min(1),
    checkRobot: z.string().min(1),
    sending: z.string().min(1),
    submit: z.string().min(1),
    errors: z.object({
      required: z.string().min(1),
      invalidEmail: z.string().min(1),
    }),
  }),
  post: z.object({
    recentPosts: z.string().min(1),
    noPosts: z.string().min(1),
    readMore: z.string().min(1),
    loading: z.string().min(1),
    tags: z.string().optional(),
    filterAll: z.string().min(1),
    series: z.object({
      otherPosts: z.string().min(1),
    }),
    searchPlaceholder: z.string().min(1),
    noSearchResults: z.string().min(1),
    prev: z.string().min(1),
    next: z.string().min(1),
  }),
  series: z.object({
    empty: z.string().min(1),
  }),
  markdown: z.object({
    loadError: z.string().min(1),
    loading: z.string().min(1),
    retry: z.string().min(1),
  }),
  error: z.object({
    notFound: z.string().min(1),
    notFoundDesc: z.string().min(1),
    forbidden: z.string().min(1),
    forbiddenDesc: z.string().min(1),
    serverError: z.string().min(1),
    serverErrorDesc: z.string().min(1),
    goHome: z.string().min(1),
    retry: z.string().min(1),
  }),
});

/**
 * locale 문자열을 안전하게 LocaleType으로 변환
 * @param locale - 변환할 locale 문자열
 * @returns "ja" | "ko" (검증 실패 시 기본값 'ko' 반환)
 */
export function parseLocale(locale: unknown) {
  const result = LocaleSchema.safeParse(locale);
  return result.success ? result.data : 'ko';
}
