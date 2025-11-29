'use client';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useDetectScrolled } from '@/shared/hooks/useDetectScrolled';
import { Book, Mail, User } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const scrolled = useDetectScrolled();
  const { isMd } = useBreakpoint();

  const navButtonClasses =
    'flex h-8 items-center gap-1 rounded-2xl p-4 text-sm font-medium text-gray-600 outline-none select-none hover:bg-gray-100 focus-visible:bg-gray-100';

  return (
    <header className="mx-auto flex h-16 max-w-4xl items-center justify-center md:h-24">
      <div
        className={
          `fixed flex w-full items-center justify-between p-4 transition-all duration-200 ` +
          (scrolled
            ? 'bg-white/50 shadow-xl backdrop-blur-sm md:max-w-xl md:rounded-3xl lg:max-w-xl'
            : 'bg-white md:max-w-3xl lg:max-w-4xl')
        }
      >
        <div className="ms-4">
          <Link
            href="/"
            aria-label="Home"
            className={
              `font-bold transition-all duration-200 sm:text-base ` +
              (scrolled ? 'md:text-xl' : 'md:text-3xl')
            }
          >
            Chanho&apos;s dev blog
          </Link>
        </div>
        <div className="flex space-x-1 sm:space-x-1">
          <Link href="/about" aria-label="About" className={navButtonClasses}>
            <User size={16} />
            {isMd ? 'About' : null}
          </Link>
          <Link href="/posts" aria-label="Posts" className={navButtonClasses}>
            <Book size={16} />
            {isMd ? 'Posts' : null}
          </Link>
          <Link
            href="/contact"
            aria-label="Contact"
            className={navButtonClasses}
          >
            <Mail size={16} />
            {isMd ? 'Contact' : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
