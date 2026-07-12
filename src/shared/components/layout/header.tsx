import { useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import Link from '@/shared/components/ui/link';
import LocaleToggle from '@/shared/locale/toggle';

const navItems = [
  { href: '/', key: 'home' },
  { href: '/about', key: 'about' },
  { href: '/posts', key: 'posts' },
];

const navLinkClass = (active: boolean) =>
  [
    'inline-flex h-11 items-center px-4 text-sm font-medium tracking-[-0.01em] transition-all duration-200',
    active ? 'bg-ink text-bg' : 'text-ink2 hover:bg-ink hover:text-bg hover:scale-[1.01]',
    'active:translate-y-[1px] active:scale-[0.99]',
  ].join(' ');

export default function Header() {
  const { t } = useTranslation();
  const { location } = useRouterState();
  const pathname = location.pathname;

  const pathSegments = pathname.split('/').filter(Boolean);
  const activeSegment = pathSegments[1] ?? '';

  const isActive = (path: string) => {
    if (path === '/') {
      return !activeSegment;
    }

    const target = path.replace(/^\//, '');
    return activeSegment === target;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-bg">
      <nav className="app-shell" aria-label="주요 네비게이션">
        <div className="flex h-16 items-center gap-2">
          <Link
            href="/"
            className="mr-2 inline-flex h-10 items-center px-2 text-sm font-semibold text-ink"
            aria-label="chanho.kim home"
          >
            chanho.kim
          </Link>

          <div className="ml-1 hidden items-center divide-x divide-rule border-l border-rule md:flex">
            {navItems.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                aria-label={t(`nav.${key}`)}
                className={navLinkClass(isActive(href))}
              >
                {t(`nav.${key}`, { defaultValue: key })}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center border border-rule">
            <LocaleToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
