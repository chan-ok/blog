'use client';
import { useDetectScrolled } from '@/shared/hooks/useDetectScrolled';
import NavigationBar from '@/shared/ui/navigation-bar';
import Link from 'next/link';

export default function Header() {
  const scrolled = useDetectScrolled();

  return (
    <header className="mx-auto flex h-16 max-w-4xl items-center justify-center md:h-24">
      <div
        className={
          `fixed flex w-full items-center justify-between p-4 transition-all duration-200 ` +
          (scrolled
            ? 'bg-white/50 shadow-xl backdrop-blur-sm md:w-xl md:rounded-3xl lg:w-xl'
            : 'bg-white md:w-3xl lg:w-4xl')
        }
      >
        <div className="ms-4">
          <Link
            href="/"
            className={
              `font-bold transition-all duration-200 sm:text-base ` +
              (scrolled ? 'md:text-xl' : 'md:text-3xl')
            }
          >
            Chanho&apos;s dev blog
          </Link>
        </div>
        <NavigationBar />
      </div>
    </header>
  );
}
