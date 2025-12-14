import BaseLink from 'next/link';
import { useLocaleStore } from '@/shared/stores/locale-store';

interface LinkProps {
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
    <BaseLink href={localizedHref} className={className} {...props}>
      {children}
    </BaseLink>
  );
}
