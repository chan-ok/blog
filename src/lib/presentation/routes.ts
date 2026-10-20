import { hasAsciiControlCharacter } from '../../shared/util/text-security';
import {
  FRAMEWORKS,
  LOCALES,
  type Framework,
  type Locale,
  type PageRef,
  type RouteContext,
} from './types';

export function parseFramework(value: unknown): Framework {
  if (!FRAMEWORKS.includes(value as Framework)) throw new Error('Unsupported framework');
  return value as Framework;
}
export function parseLocale(value: unknown): Locale {
  if (!LOCALES.includes(value as Locale)) throw new Error('Unsupported locale');
  return value as Locale;
}
export function validateSegments(segments: string[]): void {
  if (
    !segments.length ||
    segments.length > 20 ||
    segments.some(
      (part) =>
        !part ||
        part.length > 160 ||
        part === '.' ||
        part === '..' ||
        /[%\\/?#]/u.test(part) ||
        hasAsciiControlCharacter(part)
    )
  )
    throw new Error('Invalid post path');
}
export function pageHref(context: RouteContext, page: PageRef): string {
  parseFramework(context.framework);
  parseLocale(context.locale);
  const prefix = context.explicitFramework ? `/${context.framework}` : '';
  let suffix = page.kind === 'home' ? '' : page.kind === 'post' ? 'posts' : page.kind;
  if (page.kind === 'post') {
    validateSegments(page.slug);
    suffix += `/${page.slug.map(encodeURIComponent).join('/')}`;
  }
  return `${prefix}/${context.locale}/${suffix ? `${suffix}/` : ''}`;
}
export function canonicalHref(locale: Locale, page: PageRef): string {
  return `https://chan-ok.com${pageHref({ framework: 'react', locale, explicitFramework: false }, page).replace(/\/$/u, '')}`;
}
