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
