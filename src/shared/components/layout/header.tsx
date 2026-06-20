import { useRouterState } from '@tanstack/react-router';

import Link from '@/shared/components/ui/link';
import LocaleToggle from '@/shared/components/toggle/locale-toggle';

export default function Header() {
  const { location } = useRouterState();
  const pathname = location.pathname;

  const isActive = (path: string) => pathname.includes(path);

  const navLinkClass = (path: string) =>
    [
      'text-[11px] tracking-[1.5px] uppercase px-3 py-2.5 sm:px-5',
      'border-r border-rule transition-colors duration-150',
      'hover:bg-ink hover:text-bg',
      isActive(path) ? 'bg-ink text-bg' : 'text-ink2',
    ].join(' ');

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-bg">
      {/* 마스트헤드 영역 */}
      <div className="flex flex-col items-center pt-6 pb-0">
        <Link
          href="/"
          aria-label="Home"
          className="text-[32px] font-bold tracking-[8px] uppercase text-ink no-underline"
        >
          Chanho.dev
        </Link>
        <p className="text-[10px] tracking-[2.5px] text-ink3 mt-1 mb-3">개발 · 사유 · 기록</p>
      </div>

      {/* nav 바 */}
      <nav className="border-t border-rule" aria-label="주요 네비게이션">
        <div className="mx-auto flex max-w-[960px] items-center">
          {/* 좌측 경계선 */}
          <span className="border-l border-rule self-stretch" />

          <Link href="/about" aria-label="About" className={navLinkClass('/about')}>
            About
          </Link>
          <Link href="/posts" aria-label="Posts" className={navLinkClass('/posts')}>
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
