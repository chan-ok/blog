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

  let localizedHref: string;
  if (isExternal) {
    localizedHref = href;
  } else if (isRoot) {
    localizedHref = `/${locale}`;
  } else if (isStartsWithSlash) {
    localizedHref = `/${locale}${href}`;
  } else {
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
