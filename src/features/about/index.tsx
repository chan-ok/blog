'use server';

import { redirect } from 'next/navigation';

interface AboutProps {
  params: { locale: string };
}

const LOCALE_MD_MAP = {
  ko: () => import('#/ko/about.md'),
  ja: () => import('#/ja/about.md'),
  en: () => import('#/en/about.md'),
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
