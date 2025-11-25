import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED = ['ko', 'ja', 'en'];
const DEFAULT = 'ko';

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

  // 2) 이미 locale prefix가 존재
  const hasLocale = SUPPORTED.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );

  if (hasLocale) {
    return NextResponse.next();
  }

  // 3) Accept-Language 기반 locale 감지
  const accept = request.headers.get('accept-language') || '';
  const detected = accept.split(',')[0].split('-')[0];
  const locale = SUPPORTED.includes(detected) ? detected : DEFAULT;

  // 4) locale prefix 자동 추가
  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
