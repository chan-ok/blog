import { useActionState, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field, Form } from '@base-ui/react';
import { format } from 'date-fns';
import { Mail } from 'lucide-react';

import Button from '@/5-shared/components/ui/button';
import { TurnstileWidget } from '@/5-shared/components/turnstile';
import { type FormState } from '../model/contact-form.schema';
import { submitFormWithToken } from '../util/submit-form-with-token';

export default function ContactForm() {
  const { t } = useTranslation();
  const [token, setToken] = useState<string>('');
  const [state, formAction, loading] = useActionState<FormState, FormData>(
    submitFormWithToken(token),
    {}
  );

  const today = format(new Date(), 'yyyy. MM. dd');

  return (
    /* 편지지 컨테이너 */
    <div className="border-2 border-ink bg-bg">
      {/* 편지지 헤더: 수신인 + 날짜 */}
      <div className="flex items-center justify-between border-b border-rule px-6 py-4 bg-bg2">
        <div className="flex items-center gap-2">
          <Mail size={12} className="text-ink3" aria-hidden="true" />
          <span className="text-[10px] tracking-[3px] uppercase text-ink2">chan-ok.com</span>
        </div>
        <span className="text-[10px] tracking-[1px] text-ink3 tabular-nums">{today}</span>
      </div>

      {/* 편지 본문 폼 */}
      <Form action={formAction} errors={state.serverErrors} className="flex flex-col">
        {/* 발신자 행 */}
        <Field.Root name="from">
          <div className="flex items-stretch border-b border-rule">
            {/* "From" 레이블 — 고정 너비 열 */}
            <Field.Label className="shrink-0 w-20 flex items-center px-6 text-[10px] tracking-[2.5px] uppercase text-ink3 bg-bg2 border-r border-rule">
              {t('contact.from')}
            </Field.Label>
            {/* 이메일 입력 — 나머지 공간 전체 */}
            <div className="flex-1 flex flex-col">
              <Field.Control
                type="email"
                required
                placeholder={t('contact.fromPlaceholder')}
                className="w-full h-12 px-4 bg-transparent text-[14px] text-ink placeholder:text-ink3 outline-none focus:bg-bg2 transition-colors"
              />
              <Field.Error className="px-4 pb-1.5 text-[11px] text-red-700" />
            </div>
          </div>
        </Field.Root>

        {/* 메시지 본문 */}
        <Field.Root name="message" className="flex flex-col">
          <Field.Control
            render={({ className, ...controlProps }) => (
              <textarea
                {...controlProps}
                placeholder={t('contact.placeholder')}
                className={`h-64 w-full resize-none px-6 py-5 bg-transparent text-[14px] text-ink leading-relaxed placeholder:text-ink3 outline-none focus:bg-bg2 transition-colors ${className ?? ''}`}
              />
            )}
          />
          <Field.Error className="px-6 pb-2 text-[11px] text-red-700" />
        </Field.Root>

        {/* 하단: 봇 확인 + 전송 */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-rule bg-bg2 max-md:flex-col-reverse max-md:items-start">
          <TurnstileWidget onSuccess={setToken} />
          <Button
            type="submit"
            variant="primary"
            className="flex h-10 items-center gap-2 border border-ink bg-bg px-5 text-[11px] tracking-[1.5px] uppercase text-ink outline-0 select-none hover:bg-ink hover:text-bg transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ink active:bg-ink active:text-bg data-disabled:opacity-40 data-disabled:cursor-not-allowed"
            disabled={!token || loading}
            focusableWhenDisabled
          >
            <Mail size={12} aria-hidden="true" />
            {!token
              ? t('contact.checkRobot')
              : loading
                ? t('contact.sending')
                : t('contact.submit')}
          </Button>
        </div>
      </Form>
    </div>
  );
}
