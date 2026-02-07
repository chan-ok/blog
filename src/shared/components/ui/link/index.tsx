import { Link as RouterLink } from '@tanstack/react-router';
import type { LinkProps as RouterLinkProps } from '@tanstack/react-router';

import { useLocaleStore } from '@/shared/stores/locale-store';

interface LinkProps extends Omit<RouterLinkProps, 'to'> {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

export default function Link({
  href,
  children,
  className,
  ...props
}: LinkProps) {
  const { locale } = useLocaleStore();
  const isExternal = href.startsWith('http');
  const isStartsWithSlash = href.startsWith('/');
  const isRoot = href === '/';

  // 이미 locale이 포함되어 있는지 확인 (/ko/*, /en/*, /ja/*)
  const hasLocale = /^\/(ko|en|ja)(\/|$)/.test(href);

  let localizedHref: string;
  if (isExternal) {
    // 외부 링크는 그대로 유지
    localizedHref = href;
  } else if (hasLocale) {
    // 이미 locale이 있으면 그대로 유지
    localizedHref = href;
  } else if (isRoot) {
    // 루트 경로는 locale만 추가
    localizedHref = `/${locale}`;
  } else if (isStartsWithSlash) {
    // 슬래시로 시작하면 locale 추가
    localizedHref = `/${locale}${href}`;
  } else {
    // 슬래시 없으면 locale과 슬래시 모두 추가
    localizedHref = `/${locale}/${href}`;
  }

  return (
    <RouterLink
      // @ts-ignore - TanStack Router 타입 이슈
      to={localizedHref}
      className={className}
      {...props}
    >
      {children}
    </RouterLink>
  );
}
