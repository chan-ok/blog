import ContactForm from '@/features/contact-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: '블로그에 대한 문의사항을 남길 수 있습니다.',
};

export default function ContactPage() {
  return (
    <div className="flex justify-center">
      <div className="w-xl">
        <ContactForm />
      </div>
    </div>
  );
}
