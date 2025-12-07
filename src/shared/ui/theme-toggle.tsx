'use client';

import { useThemeStore } from '@/shared/stores/theme-store';
import { Monitor, Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const handleToggle = () => {
    // 순환: light → dark → system → light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  // 현재 테마에 따른 아이콘과 레이블
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={16} />;
      case 'dark':
        return <Moon size={16} />;
      case 'system':
        return <Monitor size={16} />;
    }
  };

  const getAriaLabel = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to system theme';
      case 'system':
        return 'Switch to light mode';
    }
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={getAriaLabel()}
      title={`Current theme: ${theme}`}
      className={`
        flex h-8 items-center gap-1 rounded-2xl p-4 text-sm font-medium
        text-gray-600 outline-none select-none cursor-pointer
        hover:bg-gray-100 focus-visible:bg-gray-100
        dark:text-gray-300 dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800
        transition-colors duration-200
        `}
    >
      {getThemeIcon()}
    </button>
  );
}
