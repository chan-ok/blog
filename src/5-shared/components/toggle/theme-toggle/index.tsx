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
    'flex items-center h-9 px-3 gap-1',
    'text-[11px] text-ink3 cursor-pointer',
    'hover:bg-ink hover:text-bg transition-colors duration-150',
    'outline-none select-none'
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
