import { createFileRoute } from '@tanstack/react-router';

import ContactForm from '@/features/contact/ui/contact-form';

export const Route = createFileRoute('/$locale/contact')({
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-[620px] pb-16">
      {/* 페이지 헤더 */}
      <div className="mb-8 border-b-2 border-ink pb-4">
        <h1 className="text-[22px] font-bold tracking-[2px] uppercase text-ink">Contact</h1>
      </div>

      <ContactForm />
    </div>
  );
}
