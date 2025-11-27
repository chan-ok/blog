'use client';
import NavigationBar from '@/shared/ui/navigation-bar';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 0);
    };
    handler();
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header className="mx-auto flex h-20 max-w-4xl items-center justify-center p-6">
      <div
        className={
          `fixed m-4 flex max-w-4xl items-center justify-between rounded-3xl px-2 py-4 transition-all duration-200 ` +
          (scrolled
            ? 'h-12 w-xl bg-white/50 shadow-xl backdrop-blur-sm'
            : 'h-16 w-4xl bg-white')
        }
      >
        <div className="ms-4">
          <Link
            href="/"
            className={
              `font-bold transition-all duration-200 ` +
              (scrolled ? 'text-xl' : 'text-3xl')
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
