'use client';
import { TurnstileWidget } from '@/shared/ui/turnstile';
import { Button, Field, Form } from '@base-ui-components/react';
import { useActionState, useState } from 'react';
import { type FormState } from '../model/contact-form.schema';
import { submitFormWithToken } from '../util/submit-form-with-token';

export default function ContactForm() {
  const [token, setToken] = useState<string>('');
  const [state, formAction, loading] = useActionState<FormState, FormData>(
    submitFormWithToken(token),
    {}
  );

  return (
    <Form
      action={formAction}
      errors={state.serverErrors}
      className="flex flex-col space-y-4"
    >
      <Field.Root name="from" className="flex flex-col items-start gap-1">
        <Field.Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          From
        </Field.Label>
        <Field.Control
          type="email"
          required
          className="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        <Field.Error className="text-sm text-red-800" />
      </Field.Root>

      <Field.Root name="subject" className="flex flex-col items-start gap-1">
        <Field.Label>Subject</Field.Label>
        <Field.Control
          type="text"
          required
          className="h-10 w-full rounded-md border border-gray-200 pl-3.5 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
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
              className={`h-60 w-full resize-none rounded-md border border-gray-200 p-2 text-base text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 ${className ?? ''}`}
            />
          )}
        />
        <Field.Error className="text-sm text-red-800" />
      </Field.Root>
      <Field.Root name="submit" className="container">
        <div className="flex justify-between max-md:flex-col-reverse max-md:gap-4">
          <TurnstileWidget onSuccess={setToken} />
          <Button
            focusableWhenDisabled
            type="submit"
            disabled={!token || loading}
            className="flex h-12 w-40 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base leading-6 font-medium text-gray-900 outline-0 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:border-t-gray-300 active:bg-gray-200 active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] data-disabled:bg-gray-200 data-disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:active:bg-gray-900 dark:data-disabled:bg-gray-800 dark:data-disabled:text-gray-600"
          >
            {!token ? 'Check Robot' : loading ? 'Sending...' : 'Submit'}
          </Button>
        </div>
        <Field.Error className="text-sm text-red-800" />
      </Field.Root>
    </Form>
  );
}
