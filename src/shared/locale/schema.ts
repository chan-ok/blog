import { z } from 'zod';

export const LocaleSchema = z.enum(['ko', 'ja']);

const TranslationStringSchema = z.string().trim().min(1);

export const TranslationResourceSchema = z
  .object({
    nav: z
      .object({
        home: TranslationStringSchema,
        about: TranslationStringSchema,
        posts: TranslationStringSchema,
        primaryLabel: TranslationStringSchema,
        changeLanguage: TranslationStringSchema,
      })
      .strict(),
    about: z
      .object({
        label: TranslationStringSchema,
        greeting: TranslationStringSchema,
        introduction: TranslationStringSchema,
        viewWork: TranslationStringSchema,
        readMore: TranslationStringSchema,
        profileAlt: TranslationStringSchema,
        loading: TranslationStringSchema,
      })
      .strict(),
    post: z
      .object({
        recentPosts: TranslationStringSchema,
        noPosts: TranslationStringSchema,
        readMore: TranslationStringSchema,
        loading: TranslationStringSchema,
        tableOfContents: TranslationStringSchema,
      })
      .strict(),
    error: z
      .object({
        notFound: TranslationStringSchema,
        notFoundDesc: TranslationStringSchema,
        forbidden: TranslationStringSchema,
        forbiddenDesc: TranslationStringSchema,
        serverError: TranslationStringSchema,
        serverErrorDesc: TranslationStringSchema,
        goHome: TranslationStringSchema,
        retry: TranslationStringSchema,
      })
      .strict(),
  })
  .strict();

/**
 * locale 문자열을 안전하게 LocaleType으로 변환
 * @param locale - 변환할 locale 문자열
 * @returns "ja" | "ko" (검증 실패 시 기본값 'ko' 반환)
 */
export function parseLocale(locale: unknown) {
  const result = LocaleSchema.safeParse(locale);
  return result.success ? result.data : 'ko';
}
