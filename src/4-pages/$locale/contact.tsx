import { createFileRoute } from '@tanstack/react-router';
import ContactForm from '@/2-features/contact/ui/contact-form';

export const Route = createFileRoute('/$locale/contact')({
  component: ContactPage,
  // TODO: SEO 메타 태그는 Phase 4에서 react-helmet-async로 처리
});

function ContactPage() {
  return (
    <div className="flex justify-center">
      <div className="w-xl">
        <ContactForm />
      </div>
    </div>
  );
}
