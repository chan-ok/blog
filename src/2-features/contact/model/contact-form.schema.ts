import { Form } from '@base-ui/react';
import z from 'zod';

import { sanitizeInput } from '@/5-shared/util/sanitize';

export const ContactFormInputsSchema = z.object({
  from: z.email('Invalid email'),
  message: z.string().min(1, 'Message is required').transform(sanitizeInput),
});

export type ContactFormInputs = z.infer<typeof ContactFormInputsSchema>;

export interface FormState {
  serverErrors?: Form.Props['errors'];
}
