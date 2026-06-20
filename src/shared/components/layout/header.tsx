import { useRouterState } from '@tanstack/react-router';

import Link from '@/shared/components/ui/link';
import LocaleToggle from '@/shared/locale/toggle';

const navLinkClass = (active: boolean) =>
  [
    'text-[11px] tracking-[1.5px] uppercase px-3 py-2.5 sm:px-5',
    'border-r border-rule transition-colors duration-150',
    'hover:bg-ink hover:text-bg',
    active ? 'bg-ink text-bg' : 'text-ink2',
  ].join(' ');

export default function Header() {
  const { location } = useRouterState();
  const pathname = location.pathname;

  const isHome = /^\/(ko|ja)\/?$/.test(pathname);
  const isActive = (path: string) => pathname.includes(path);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-bg">
      {/* nav 바 */}
      <nav className="" aria-label="주요 네비게이션">
        <div className="mx-auto flex max-w-240 items-center">
          {/* 좌측 경계선 */}
          <span className="border-l border-rule self-stretch" />

          <Link href="/" aria-label="Home" className={navLinkClass(isHome)}>
            Home
          </Link>
          <Link href="/about" aria-label="About" className={navLinkClass(isActive('/about'))}>
            About
          </Link>
          <Link href="/posts" aria-label="Posts" className={navLinkClass(isActive('/posts'))}>
            Posts
          </Link>

          {/* 토글 영역 */}
          <span className="ml-auto flex items-stretch border-l border-rule">
            <LocaleToggle />
          </span>

          {/* 우측 경계선 */}
          <span className="border-r border-rule self-stretch" />
        </div>
      </nav>
    </header>
  );
}
