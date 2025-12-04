'use server';

import { LocaleSchema } from '@/shared/types/common.schema';
import { redirect } from 'next/navigation';

interface AboutProps {
  params: { locale: string };
}

export default async function About({ params }: AboutProps) {
  const { locale } = params;

  if (!LocaleSchema.safeParse(locale).success) {
    redirect('/ko/about');
  }

  const mdModule = await import(`#/${locale}/about.md`);
  const MarkdownComponent = mdModule.default;

  return <MarkdownComponent />;
}
