import { Form } from '@base-ui/react';
import z from 'zod';

export const ContactFormInputsSchema = z.object({
  from: z.email('Invalid email'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(100, 'Subject length is over'),
  message: z.string().min(1, 'Message is required'),
});

export type ContactFormInputs = z.infer<typeof ContactFormInputsSchema>;

export interface FormState {
  serverErrors?: Form.Props['errors'];
}
