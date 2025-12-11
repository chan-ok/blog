import { LocaleSchema } from '@/shared/types/common.schema';
import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = Object.keys(LocaleSchema.enum);
const DEFAULT_LOCALE: LocaleType = 'ko';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일 및 내부 리소스는 무시
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    /\.(svg|png|jpg|jpeg|gif|css|js|ico|txt|xml|webp|map|json)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // locale prefix가 이미 존재하면 통과
  const hasLocalePrefix = SUPPORTED_LOCALES.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );
  if (hasLocalePrefix) {
    return NextResponse.next();
  }

  // 브라우저 Accept-Language 헤더에서 locale 감지
  const acceptLanguage = request.headers.get('accept-language') || '';
  const detectedLang = acceptLanguage.split(',')[0].split('-')[0];
  const { data: browserLocale, success: isBrowserLocaleValid } =
    LocaleSchema.safeParse(detectedLang);

  const targetLocale = isBrowserLocaleValid ? browserLocale : DEFAULT_LOCALE;

  // locale prefix 추가하여 리다이렉트
  return NextResponse.redirect(
    new URL(`/${targetLocale}${pathname}`, request.nextUrl)
  );
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
