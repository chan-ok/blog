import { Noto_Sans, Noto_Sans_JP, Noto_Sans_KR } from 'next/font/google';

const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const notoSansKR = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export { notoSans, notoSansJP, notoSansKR };
