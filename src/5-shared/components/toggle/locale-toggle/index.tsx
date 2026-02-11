import OptimizedImage from '@/5-shared/components/ui/optimized-image';
import { useRouterState, useRouter } from '@tanstack/react-router';
import { useLocaleStore } from '@/5-shared/stores/locale-store';
import { Menu } from '@base-ui/react';
import clsx from 'clsx';

export default function LocaleToggle() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const { location } = useRouterState();
  const pathname = location.pathname;
  const router = useRouter();

  const getLocaleIcon = (locale: LocaleType, w = 24, h = 24) => {
    return (
      <OptimizedImage
        src={`/icon/${locale}.svg`}
        width={w}
        height={h}
        alt={`${locale} flag`}
        className="w-full h-full object-cover"
      />
    );
  };

  const getAriaLabel = () => {
    switch (locale) {
      case 'ko':
        return 'Change language: Switch to Korean';
      case 'en':
        return 'Change language: Switch to English';
      case 'ja':
        return 'Change language: Switch to Japanese';
    }
  };

  const buttonClassName = clsx(
    'flex h-8 items-center gap-1 rounded-2xl mx-0 p-2 text-sm font-medium',
    'text-gray-600 outline-none select-none cursor-pointer',
    'hover:bg-gray-100 focus-visible:bg-gray-100',
    'dark:text-gray-300 dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800',
    'transition-colors duration-200'
  );

  const positionerClassName = 'outline-0';

  const popupClassName = clsx(
    'box-border py-1 rounded-md',
    'bg-white dark:bg-gray-900',
    'text-gray-900 dark:text-gray-100',
    'origin-[var(--transform-origin)]',
    'transition-[transform,opacity] duration-150',
    'outline outline-1 outline-gray-200 dark:outline-gray-700',
    'shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50',
    'data-[starting-style]:opacity-0 data-[starting-style]:scale-90',
    'data-[ending-style]:opacity-0 data-[ending-style]:scale-90'
  );

  const arrowClassName = clsx(
    'flex',
    'data-[side=top]:-bottom-2 data-[side=top]:rotate-180',
    'data-[side=bottom]:-top-2 data-[side=bottom]:rotate-0',
    'data-[side=left]:-right-3.5 data-[side=left]:rotate-90',
    'data-[side=right]:-left-3.5 data-[side=right]:-rotate-90'
  );

  const itemClassName = clsx(
    'outline-0 cursor-default select-none',
    'py-2 pl-4 pr-8',
    'flex items-center gap-1.5',
    'text-sm leading-4',
    'data-[highlighted]:relative data-[highlighted]:z-0',
    'data-[highlighted]:text-gray-50',
    'data-[highlighted]:before:content-[""]',
    'data-[highlighted]:before:absolute data-[highlighted]:before:z-[-1]',
    'data-[highlighted]:before:inset-y-0 data-[highlighted]:before:inset-x-1',
    'data-[highlighted]:before:rounded',
    'data-[highlighted]:before:bg-gray-900 dark:data-[highlighted]:before:bg-gray-100',
    'dark:data-[highlighted]:text-gray-900'
  );

  function changeLocale(newLocale: LocaleType) {
    const newPath = pathname.replace(/^\/(ko|en|ja)/, `/${newLocale}`);
    setLocale(newLocale);
    router.navigate({ to: newPath });
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        className={buttonClassName}
        aria-label={getAriaLabel()}
        openOnHover
      >
        <div className="h-6 w-6 bg-white rounded-full overflow-hidden">
          <div className="h-5 w-5 m-0.5 bg-white rounded-full overflow-hidden">
            {getLocaleIcon(locale)}
          </div>
        </div>
        <ChevronDownIcon className="-mr-1" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          className={positionerClassName}
          alignOffset={-30}
          sideOffset={12}
        >
          <Menu.Popup className={popupClassName}>
            <Menu.Arrow className={arrowClassName}>
              <ArrowSvg />
            </Menu.Arrow>
            <Menu.Item
              className={itemClassName}
              onClick={() => changeLocale('ko')}
            >
              <div className="h-4 w-6 border bg-white border-zinc-200">
                {getLocaleIcon('ko')}
              </div>
              <div>한국어</div>
            </Menu.Item>
            <Menu.Item
              className={itemClassName}
              onClick={() => changeLocale('ja')}
            >
              <div className="h-4 w-6 border bg-white border-zinc-200">
                {getLocaleIcon('ja')}
              </div>
              <div>日本語</div>
            </Menu.Item>
            <Menu.Item
              className={itemClassName}
              onClick={() => changeLocale('en')}
            >
              <div className="h-4 w-6 border bg-white border-zinc-200">
                {getLocaleIcon('en')}
              </div>
              <div>English</div>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function ArrowSvg(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className="fill-white dark:fill-gray-900"
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        className="fill-gray-200 dark:fill-gray-700"
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className="fill-gray-200 dark:fill-gray-700"
      />
    </svg>
  );
}

function ChevronDownIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" {...props}>
      <path d="M1 3.5L5 7.5L9 3.5" stroke="currentcolor" strokeWidth="1.5" />
    </svg>
  );
}
