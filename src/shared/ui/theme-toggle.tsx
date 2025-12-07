import { useThemeStore } from '@/shared/stores/theme-store';
import { Monitor, Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggle } = useThemeStore();

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
      onClick={() => toggle(theme)}
      aria-label={getAriaLabel()}
      title={theme ? `Current theme: ${theme}` : 'Switch theme'}
      className={`
        flex h-8 items-center gap-1 rounded-2xl p-4 text-sm font-medium
        text-gray-600 outline-none select-none cursor-pointer
        hover:bg-gray-100 focus-visible:bg-gray-100
        dark:text-gray-300 d  ark:hover:bg-gray-800 dark:focus-visible:bg-gray-800
        transition-colors duration-200
        `}
    >
      <span className="w-4 h-4 flex items-center justify-center">
        {getThemeIcon()}
      </span>
    </button>
  );
}
