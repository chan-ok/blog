'use server';

import { redirect } from 'next/navigation';

interface AboutProps {
  params: { locale: string };
}

const LOCALE_MD_MAP = {
  ko: () => import('#/about.ko.md'),
  ja: () => import('#/about.ja.md'),
  en: () => import('#/about.en.md'),
};

export default async function About({ params }: AboutProps) {
  const { locale } = params;

  if (!(locale in LOCALE_MD_MAP)) {
    redirect('/ko/about');
  }

  const loadMdByLocale = LOCALE_MD_MAP[locale as keyof typeof LOCALE_MD_MAP];
  const mdModule = await loadMdByLocale();
  const MarkdownComponent = mdModule.default;

  return <MarkdownComponent />;
}
