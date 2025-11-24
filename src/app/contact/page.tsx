import ContactForm from '@/features/contact-form/contact-form';
import { Toast } from '@base-ui-components/react';

export default function ContactPage() {
  return (
    <Toast.Provider>
      <div className="flex justify-center">
        <div className="w-xl">
          <ContactForm />
        </div>
      </div>
    </Toast.Provider>
  );
}
