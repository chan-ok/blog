import { useThemeStore } from '@/5-shared/stores/theme-store';
import clsx from 'clsx';
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
        return 'Toggle theme: Switch to dark theme';
      case 'dark':
        return 'Toggle theme: Switch to system theme';
      case 'system':
        return 'Toggle theme: Switch to light theme';
    }
  };

  const buttonClassName = clsx(
    'flex items-center',
    'h-8',
    'px-3 py-4 gap-1',
    'text-sm font-medium text-gray-600 dark:text-gray-300',
    'rounded-2xl outline-none select-none cursor-pointer transition-colors duration-200',
    'hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800'
  );

  return (
    <button
      onClick={() => toggle(theme)}
      aria-label={getAriaLabel()}
      title={theme ? `Current theme: ${theme}` : 'Switch theme'}
      className={buttonClassName}
    >
      <span className={clsx('flex items-center justify-center w-4 h-4')}>
        {getThemeIcon()}
      </span>
    </button>
  );
}
