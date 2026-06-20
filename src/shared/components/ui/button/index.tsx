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
  'focus-visible:ring-2 focus-visible:ring-accent-strong focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'rounded-md',
];

const variantStyles: Record<ButtonVariant, Record<ButtonShape, string[]>> = {
  primary: {
    fill: [
      'bg-accent text-bg',
      'border border-accent',
      'hover:bg-accent-strong hover:border-accent-strong',
    ],
    outline: [
      'bg-transparent text-accent-strong border border-accent',
      'hover:bg-accent-soft hover:text-ink',
    ],
  },
  default: {
    fill: ['bg-bg2 text-ink', 'border border-rule', 'hover:bg-accent-soft hover:border-accent'],
    outline: [
      'bg-transparent text-ink2 border border-rule',
      'hover:bg-bg2 hover:text-ink hover:border-accent',
    ],
  },
  danger: {
    fill: [
      'bg-accent-strong text-bg',
      'border border-accent-strong',
      'hover:bg-accent hover:border-accent',
    ],
    outline: [
      'bg-transparent text-accent-strong border border-accent-strong',
      'hover:bg-accent-soft hover:text-ink',
    ],
  },
  link: {
    fill: [
      'bg-transparent text-accent-strong underline-offset-4',
      'hover:underline hover:text-ink',
      'px-0 py-0',
    ],
    outline: [
      'bg-transparent text-accent-strong underline-offset-4',
      'hover:underline hover:text-ink',
      'px-0 py-0',
    ],
  },
};

export default function Button({
  variant = 'default',
  shape = 'fill',
  className,
  children,
  ...props
}: ButtonProps) {
  // link variant ignores shape prop (Requirements 2.4)
  const effectiveShape = variant === 'link' ? 'fill' : shape;

  const buttonClassName = clsx(baseStyles, variantStyles[variant][effectiveShape], className);

  return (
    <BaseButton className={buttonClassName} nativeButton {...props}>
      {children}
    </BaseButton>
  );
}
