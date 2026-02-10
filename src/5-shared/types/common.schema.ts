import z from 'zod';

export const LocaleSchema = z.enum(['ko', 'en', 'ja']);
export type LocaleType = z.infer<typeof LocaleSchema>;
