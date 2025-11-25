'use client';

import AboutEnglishMarkdown from '#/page.md';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About 페이지 설명입니다.',
};

export default function AboutPage() {
  return <AboutEnglishMarkdown />;
}
