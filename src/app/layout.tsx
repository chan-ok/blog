import { notoSans, notoSansJP, notoSansKR } from '@/shared/config/font';
import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: "Chanho's dev blog",
    template: "%s | Chanho's dev blog",
  },
  description: 'Dev Blog created by Chanho Kim',
  metadataBase: new URL('https://chanho.dev'),

  openGraph: {
    title: "Chanho's dev blog",
    description: 'Dev Blog created by Chanho Kim',
    url: 'https://chanho.dev',
    siteName: "Chanho's dev blog",
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: "Chanho's dev blog",
    description: 'Dev Blog created by Chanho Kim',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyClasses = `${notoSans.variable} ${notoSansKR.variable} ${notoSansJP.variable}`;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="beforeInteractive"
          defer
        />
      </head>
      <body className={`relative isolate antialiased ${bodyClasses}`}>
        {children}
      </body>
    </html>
  );
}
