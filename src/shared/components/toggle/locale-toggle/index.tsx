import { useRouterState, useRouter } from '@tanstack/react-router';
import { Menu } from '@base-ui/react';
import clsx from 'clsx';

import { useLocaleStore } from '@/shared/stores/locale-store';
import type { LocaleType } from '@/shared/types/common.schema';

const LOCALE_LABELS: Record<LocaleType, string> = {
  ko: 'KO',
  ja: 'JA',
};

const LOCALE_NAMES: Record<LocaleType, string> = {
  ko: '한국어',
  ja: '日本語',
};

export default function LocaleToggle() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const { location } = useRouterState();
  const pathname = location.pathname;
  const router = useRouter();

  function changeLocale(newLocale: LocaleType) {
    const newPath = pathname.replace(/^\/(ko|en|ja)/, `/${newLocale}`);
    setLocale(newLocale);
    router.navigate({ to: newPath });
  }

  const triggerClass = clsx(
    'flex items-center gap-1 px-3 py-2.5',
    'text-[11px] tracking-[1.5px] uppercase text-ink2 cursor-pointer',
    'hover:bg-ink hover:text-bg transition-colors duration-150',
    'outline-none select-none border-l border-rule'
  );

  const popupClass = clsx(
    'py-1 min-w-[88px]',
    'bg-bg border border-rule',
    'origin-[var(--transform-origin)]',
    'transition-[transform,opacity] duration-150',
    'data-[starting-style]:opacity-0 data-[starting-style]:scale-95',
    'data-[ending-style]:opacity-0 data-[ending-style]:scale-95'
  );

  const itemClass = clsx(
    'px-4 py-2 cursor-default select-none outline-0',
    'text-[11px] tracking-[1.5px] uppercase text-ink2',
    'flex items-center gap-2',
    'data-[highlighted]:bg-ink data-[highlighted]:text-bg'
  );

  return (
    <Menu.Root>
      <Menu.Trigger className={triggerClass} aria-label="Change language" openOnHover>
        {LOCALE_LABELS[locale]}
        <ChevronDownIcon />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={0}
          alignOffset={0}
          className="outline-0"
        >
          <Menu.Popup className={popupClass}>
            {(Object.keys(LOCALE_LABELS) as LocaleType[]).map((loc) => (
              <Menu.Item key={loc} className={itemClass} onClick={() => changeLocale(loc)}>
                <span
                  className={clsx(
                    'w-1.5 h-1.5 rounded-full',
                    locale === loc ? 'bg-ink' : 'bg-transparent'
                  )}
                />
                {LOCALE_NAMES[loc]}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function ChevronDownIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="8" height="8" viewBox="0 0 10 10" fill="none" {...props}>
      <path d="M1 3.5L5 7.5L9 3.5" stroke="currentcolor" strokeWidth="1.5" />
    </svg>
  );
}
