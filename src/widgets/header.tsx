'use client';
import { useDetectScrolled } from '@/shared/hooks/useDetectScrolled';
import ThemeToggle from '@/shared/ui/theme-toggle';
import { Book, Mail, User } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const scrolled = useDetectScrolled();

  const navButtonClasses =
    'flex h-8 items-center gap-1 rounded-2xl px-3 py-4 text-sm font-medium text-gray-600 outline-none select-none hover:bg-gray-100 focus-visible:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800';

  return (
    <header className="mx-auto flex h-16 max-w-4xl items-center justify-center md:h-24">
      <div
        className={
          `fixed flex w-full items-center justify-between p-4 transition-all duration-200 ` +
          (scrolled
            ? 'bg-white/50 shadow-xl backdrop-blur-sm md:max-w-xl md:rounded-3xl lg:max-w-xl dark:bg-gray-900/50'
            : 'bg-white md:max-w-3xl lg:max-w-4xl dark:bg-gray-900')
        }
      >
        <div className="ms-4">
          <Link
            href="/"
            aria-label="Home"
            className={
              `font-bold transition-all duration-200 sm:text-base ` +
              (scrolled ? 'md:text-xl' : 'md:text-2xl')
            }
          >
            Chanho&apos;s dev blog
          </Link>
        </div>
        <div className="flex space-x-0.5">
          <Link href="/about" aria-label="About" className={navButtonClasses}>
            <User size={16} />
            <span className="hidden md:inline">About</span>
          </Link>
          <Link href="/posts" aria-label="Posts" className={navButtonClasses}>
            <Book size={16} />
            <span className="hidden md:inline">Posts</span>
          </Link>
          <Link
            href="/contact"
            aria-label="Contact"
            className={navButtonClasses}
          >
            <Mail size={16} />
            <span className="hidden md:inline">Contact</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
