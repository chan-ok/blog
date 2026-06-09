import clsx from 'clsx';
import { Monitor, Moon, Sun } from 'lucide-react';

import { useThemeStore } from '@/shared/stores/theme-store';

const THEME_ICONS: Record<string, React.ReactNode> = {
  light: <Sun size={12} />,
  dark: <Moon size={12} />,
  system: <Monitor size={12} />,
};

const THEME_LABELS: Record<string, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'Auto',
};

const THEME_ARIA: Record<string, string> = {
  light: 'Toggle theme: Switch to dark',
  dark: 'Toggle theme: Switch to system',
  system: 'Toggle theme: Switch to light',
};

export default function ThemeToggle() {
  const { theme, toggle } = useThemeStore();

  return (
    <button
      onClick={() => toggle(theme)}
      aria-label={THEME_ARIA[theme]}
      title={`Current theme: ${theme}`}
      className={clsx(
        'flex items-center gap-1 px-3 py-2.5',
        'text-[11px] tracking-[1.5px] uppercase text-ink2 cursor-pointer',
        'hover:bg-ink hover:text-bg transition-colors duration-150',
        'outline-none select-none'
      )}
    >
      <span className="flex items-center justify-center">{THEME_ICONS[theme]}</span>
      <span>{THEME_LABELS[theme]}</span>
    </button>
  );
}
