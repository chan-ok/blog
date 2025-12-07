'use client';
import LocaleToggle from '@/shared/components/toggle/locale-toggle';
import ThemeToggle from '@/shared/components/toggle/theme-toggle';
import { useDetectScrolled } from '@/shared/hooks/useDetectScrolled';
import clsx from 'clsx';
import { Book, Mail, User } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const scrolled = useDetectScrolled();

  const navButtonClasses = clsx(
    'flex items-center',
    'h-8',
    'px-2 py-4 gap-1',
    'text-sm font-medium text-gray-600 dark:text-gray-300',
    'rounded-2xl outline-none select-none',
    'hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800'
  );

  const dynamicHeaderClasses = clsx(
    'fixed flex items-center justify-between',
    'w-full',
    'p-2',
    'transition-all duration-200',
    scrolled
      ? 'bg-white/50 shadow-xl backdrop-blur-sm md:max-w-xl md:rounded-3xl lg:max-w-xl dark:bg-gray-900/50'
      : 'bg-white md:max-w-3xl lg:max-w-4xl dark:bg-gray-900'
  );

  const titleClasses = clsx(
    'font-bold sm:text-base',
    'transition-all duration-200',
    scrolled ? 'md:text-md' : 'md:text-4xl'
  );

  return (
    <header className="flex items-center justify-center md:h-24 max-w-4xl h-16 mx-auto">
      <div className={dynamicHeaderClasses}>
        <div className="ms-2">
          <Link href="/" aria-label="Home" className={titleClasses}>
            Chanho&apos;s dev blog
          </Link>
        </div>
        <div className="flex space-x-1">
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
          <LocaleToggle />
        </div>
      </div>
    </header>
  );
}
