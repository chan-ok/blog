import { z } from 'zod';

export const TranslationResourceSchema = z.object({
  nav: z.object({
    about: z.string().min(1),
    posts: z.string().min(1),
    contact: z.string().min(1),
  }),
  about: z.object({
    greeting: z.string().min(1),
    introduction: z.string().min(1),
    emailLabel: z.string().min(1),
    githubLabel: z.string().min(1),
  }),
  contact: z.object({
    from: z.string().min(1),
    fromPlaceholder: z.string().min(1),
    subject: z.string().min(1),
    subjectPlaceholder: z.string().min(1),
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
});

export type TranslationResourceFromSchema = z.infer<
  typeof TranslationResourceSchema
>;
