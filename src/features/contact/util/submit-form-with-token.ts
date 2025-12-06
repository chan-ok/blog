import { api } from '@/shared/config/api';
import {
  ContactFormInputsSchema,
  type FormState,
} from '../model/contact-form.schema';

export function submitFormWithToken(token: string) {
  return async (_previousState: FormState, formData: FormData) => {
    if (!token) {
      return {
        serverErrors: {
          submit: '로봇이 아닙니다 확인이 필요합니다.',
        },
      };
    }
    // 2. zod validation
    const raw = Object.fromEntries(formData.entries());
    const parsed = ContactFormInputsSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        serverErrors: parsed.error.flatten((issue) => issue.message)
          .fieldErrors,
      };
    }

    try {
      const params = {
        ...parsed.data,
        turnstileToken: token,
      };
      const res = await api.post('/api/mail', params);
      if (res.axios.status !== 200) {
        throw new Error('Failed to send message');
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to send message';
      console.error(message);
      return {
        serverErrors: { submit: message },
      };
    }
    return {};
  };
}
