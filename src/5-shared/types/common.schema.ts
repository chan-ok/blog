import z from 'zod';

export const LocaleSchema = z.enum(['ko', 'en', 'ja']);
export type LocaleType = z.infer<typeof LocaleSchema>;

/**
 * locale 문자열을 안전하게 LocaleType으로 변환
 * @param locale - 변환할 locale 문자열
 * @returns LocaleType (검증 실패 시 기본값 'ko' 반환)
 */
export function parseLocale(locale: unknown): LocaleType {
  const result = LocaleSchema.safeParse(locale);
  return result.success ? result.data : 'ko';
}
