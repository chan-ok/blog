import { Button as BaseButton } from '@base-ui/react';
import clsx from 'clsx';
import type { ComponentProps } from 'react';

export type ButtonVariant = 'primary' | 'default' | 'danger' | 'link';
export type ButtonShape = 'fill' | 'outline';

type BaseButtonProps = ComponentProps<typeof BaseButton>;

export type ButtonProps = BaseButtonProps & {
  variant?: ButtonVariant;
  shape?: ButtonShape;
};

const baseStyles = [
  'inline-flex items-center justify-center',
  'gap-2',
  'px-4 py-2',
  'font-medium',
  'transition-colors duration-200',
  'outline-none select-none cursor-pointer',
  'focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
  'disabled:opacity-50 disabled:cursor-not-allowed',
];

const variantStyles: Record<ButtonVariant, Record<ButtonShape, string[]>> = {
  primary: {
    fill: [
      'bg-gray-900 text-white',
      'hover:bg-gray-800',
      'dark:bg-white dark:text-gray-900',
      'dark:hover:bg-gray-100',
      'focus-visible:ring-gray-900 dark:focus-visible:ring-white',
      'rounded-lg',
    ],
    outline: [
      'bg-transparent text-gray-900 border border-gray-900',
      'hover:bg-gray-900 hover:text-white',
      'dark:text-white dark:border-white',
      'dark:hover:bg-white dark:hover:text-gray-900',
      'focus-visible:ring-gray-900 dark:focus-visible:ring-white',
      'rounded-lg',
    ],
  },
  default: {
    fill: [
      'bg-gray-100 text-gray-900',
      'hover:bg-gray-200',
      'dark:bg-gray-800 dark:text-gray-100',
      'dark:hover:bg-gray-700',
      'focus-visible:ring-gray-500',
      'rounded-lg',
    ],
    outline: [
      'bg-transparent text-gray-600 border border-gray-300',
      'hover:bg-gray-100 hover:text-gray-900',
      'dark:text-gray-400 dark:border-gray-600',
      'dark:hover:bg-gray-800 dark:hover:text-gray-100',
      'focus-visible:ring-gray-500',
      'rounded-lg',
    ],
  },
  danger: {
    fill: [
      'bg-red-600 text-white',
      'hover:bg-red-700',
      'dark:bg-red-600 dark:text-white',
      'dark:hover:bg-red-700',
      'focus-visible:ring-red-600',
      'rounded-lg',
    ],
    outline: [
      'bg-transparent text-red-600 border border-red-600',
      'hover:bg-red-600 hover:text-white',
      'dark:text-red-500 dark:border-red-500',
      'dark:hover:bg-red-600 dark:hover:text-white',
      'focus-visible:ring-red-600',
      'rounded-lg',
    ],
  },
  link: {
    fill: [
      'bg-transparent text-gray-600 underline-offset-4',
      'hover:underline hover:text-gray-900',
      'dark:text-gray-400',
      'dark:hover:text-gray-100',
      'focus-visible:ring-gray-500',
      'px-0 py-0',
    ],
    outline: [
      'bg-transparent text-gray-600 underline-offset-4',
      'hover:underline hover:text-gray-900',
      'dark:text-gray-400',
      'dark:hover:text-gray-100',
      'focus-visible:ring-gray-500',
      'px-0 py-0',
    ],
  },
};

export function Button({
  variant = 'default',
  shape = 'fill',
  className,
  children,
  ...props
}: ButtonProps) {
  // link variant ignores shape prop (Requirements 2.4)
  const effectiveShape = variant === 'link' ? 'fill' : shape;

  const buttonClassName = clsx(
    baseStyles,
    variantStyles[variant][effectiveShape],
    className
  );

  return (
    <BaseButton className={buttonClassName} {...props}>
      {children}
    </BaseButton>
  );
}

export default Button;
