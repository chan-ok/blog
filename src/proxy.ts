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

  // 4) Cookie or Accept-Language 기반 locale 감지
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const accept = request.headers.get('accept-language') || '';
  const detected = accept.split(',')[0].split('-')[0];

  const validCookie = LocaleSchema.safeParse(cookieLocale).success
    ? (cookieLocale as LocaleType)
    : undefined;

  const validDetected = LocaleSchema.safeParse(detected).success
    ? (detected as LocaleType)
    : undefined;

  const locale = validCookie || validDetected || DEFAULT;

  // 5) locale prefix 자동 추가
  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
