import { LocaleSchema } from '@/shared/types/common.schema';
import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED = LocaleSchema.enum;
const DEFAULT: LocaleType = 'ko';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) 정적 파일 및 내부 리소스는 무시
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    /\.(svg|png|jpg|jpeg|gif|css|js|ico|txt|xml|webp|map|json)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2) path에 locale prefix가 이미 존재
  const hasLocaleInPathname = Object.values(SUPPORTED).some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );
  if (hasLocaleInPathname) {
    return NextResponse.next();
  }
  // 3) path에 locale prefix가 없고 쿠키에 locale이 존재
  if (request.cookies.has('NEXT_LOCALE')) {
    const { data: validCookie, success: isCookieValid } =
      LocaleSchema.safeParse(request.cookies.get('NEXT_LOCALE')?.value);
    if (isCookieValid) {
      return NextResponse.redirect(
        new URL(`/${validCookie}${pathname}`, request.url)
      );
    }
  }

  // 4) Accept-Language 기반 locale 감지
  const accept = request.headers.get('accept-language') || '';
  const detected = accept.split(',')[0].split('-')[0];

  const { data: browserLocale, success: isBrowserLocaleValid } =
    LocaleSchema.safeParse(detected);
  const defaultLocale = isBrowserLocaleValid ? browserLocale : DEFAULT;

  // 5) locale prefix 자동 추가
  const response = NextResponse.redirect(
    new URL(`/${defaultLocale}${pathname}`, request.url)
  );
  response.cookies.set('NEXT_LOCALE', defaultLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
  });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
