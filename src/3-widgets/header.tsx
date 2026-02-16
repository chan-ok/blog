import { useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import Link from '@/5-shared/components/ui/link';
import LocaleToggle from '@/5-shared/components/toggle/locale-toggle';
import ThemeToggle from '@/5-shared/components/toggle/theme-toggle';
import { useDetectScrolled } from '@/5-shared/hooks/use-detect-scrolled';

import { Book, Mail, Tag, User } from 'lucide-react';
import clsx from 'clsx';

export default function Header() {
  const { location } = useRouterState();
  const pathname = location.pathname;
  const scrolled = useDetectScrolled();
  const { t } = useTranslation();

  const getNavButtonClasses = (path: string) =>
    clsx(
      'flex items-center',
      'h-8',
      'px-2 py-4 gap-1',
      'text-sm font-medium',
      'rounded-2xl outline-none select-none',
      'hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800',
      pathname.startsWith(path)
        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
        : 'text-gray-600 dark:text-gray-300'
    );

  const dynamicHeaderClasses = clsx(
    'fixed flex items-center justify-between',
    'w-full h-16 sm:h-12',
    'px-4 py-2',
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
    <header className="flex items-center justify-center max-w-4xl h-16 sm:h-20 mx-auto">
      <div className={dynamicHeaderClasses}>
        <div className="ms-2">
          <Link href="/" aria-label="Home" className={titleClasses}>
            Chanho.dev
          </Link>
        </div>
        <div className="flex space-x-1">
          <Link
            href="/about"
            aria-label={t('nav.about')}
            className={getNavButtonClasses('/about')}
          >
            <User size={16} />
            <span className="hidden md:inline">{t('nav.about')}</span>
          </Link>
          <Link
            href="/posts"
            aria-label={t('nav.posts')}
            className={getNavButtonClasses('/posts')}
          >
            <Book size={16} />
            <span className="hidden md:inline">{t('nav.posts')}</span>
          </Link>
          <Link
            href="/tag"
            aria-label={t('nav.tag')}
            className={getNavButtonClasses('/tag')}
          >
            <Tag size={16} />
            <span className="hidden md:inline">{t('nav.tag')}</span>
          </Link>
          <Link
            href="/contact"
            aria-label={t('nav.contact')}
            className={getNavButtonClasses('/contact')}
          >
            <Mail size={16} />
            <span className="hidden md:inline">{t('nav.contact')}</span>
          </Link>
          <ThemeToggle />
          <LocaleToggle />
        </div>
      </div>
    </header>
  );
}
