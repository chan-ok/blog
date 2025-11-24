'use client';
import { Button, Field, Form } from '@base-ui-components/react';
import { useActionState } from 'react';
import { ContactFormInputsSchema } from './contact-form.schema';

interface FormState {
  serverErrors?: Form.Props['errors'];
}

export default function ContactForm() {
  const [state, formAction, loading] = useActionState<FormState, FormData>(
    submitForm,
    {}
  );

  return (
    <Form
      action={formAction}
      errors={state.serverErrors}
      className="flex flex-col space-y-4"
    >
      <Field.Root name="from" className="flex flex-col items-start gap-1">
        <Field.Label className="text-sm font-medium text-gray-900">
          From
        </Field.Label>
        <Field.Control
          type="email"
          required
          className="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
        />
        <Field.Error className="text-sm text-red-800" />
      </Field.Root>

      <Field.Root name="subject" className="flex flex-col items-start gap-1">
        <Field.Label>Subject</Field.Label>
        <Field.Control
          type="text"
          required
          className="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800"
        />
        <Field.Error className="text-sm text-red-800" />
      </Field.Root>

      <Field.Root name="message" className="flex flex-col items-start gap-1">
        <Field.Label>Message</Field.Label>
        <Field.Control
          render={({ className, ...controlProps }) => (
            <textarea
              {...controlProps}
              placeholder="Write your message..."
              className={`h-60 w-full rounded-md border border-gray-200 p-2 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 ${className ?? ''}`}
            />
          )}
        />
        <Field.Error className="text-sm text-red-800" />
      </Field.Root>

      <Button
        focusableWhenDisabled
        type="submit"
        disabled={loading}
        className="mt-4 flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base leading-6 font-medium text-gray-900 outline-0 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:border-t-gray-300 active:bg-gray-200 active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] data-[disabled]:text-gray-500 hover:data-[disabled]:bg-gray-50 active:data-[disabled]:border-t-gray-200 active:data-[disabled]:bg-gray-50 active:data-[disabled]:shadow-none"
      >
        {loading ? 'Sending...' : 'Submit'}
      </Button>
    </Form>
  );
}

async function submitForm(_previousState: FormState, formData: FormData) {
  const raw: Record<string, unknown> = {
    from: formData.get('from'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  };

  // 2. zod validation
  const parsed = ContactFormInputsSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      serverErrors: parsed.error.flatten((issue) => issue.message).fieldErrors,
    };
  }

  try {
    // 3. API 요청
    const res = await fetch(`/api/mail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    });

    if (!res.ok) {
      let errorMsg = 'Failed to send message';

      try {
        const errJson = await res.json();
        if (errJson?.error) errorMsg = errJson.error;
      } catch {
        // ignore parse errors
      }

      return {
        serverErrors: { subject: errorMsg },
      };
    }
  } catch {
    return {
      serverErrors: { subject: 'Network error occurred' },
    };
  }

  return {};
}
