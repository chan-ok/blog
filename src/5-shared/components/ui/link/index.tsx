import { Link as RouterLink } from '@tanstack/react-router';
import type { LinkProps as RouterLinkProps } from '@tanstack/react-router';

import { useLocaleStore } from '@/5-shared/stores/locale-store';

interface LinkProps extends Omit<RouterLinkProps, 'to' | 'params'> {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

type RouteConfig = {
  to:
    | '/$locale'
    | '/$locale/about'
    | '/$locale/contact'
    | '/$locale/posts'
    | '/$locale/posts/$';
  params: { locale: string; _splat?: string };
};

/**
 * 내부 링크를 TanStack Router의 타입 안전한 형식으로 변환합니다.
 */
function parseInternalLink(
  href: string,
  locale: string
): RouteConfig & { search?: Record<string, unknown> } {
  // 쿼리 파라미터 분리
  const [pathWithLocale, searchString] = href.split('?');
  const searchParams = searchString
    ? Object.fromEntries(new URLSearchParams(searchString))
    : undefined;

  // locale 추출 (예: /ko/about -> locale: ko, path: /about)
  const localeMatch = pathWithLocale.match(/^\/(ko|en|ja)(\/.*)?$/);
  const detectedLocale = localeMatch?.[1] || locale;
  const path = localeMatch
    ? localeMatch[2] || '/'
    : pathWithLocale.startsWith('/')
      ? pathWithLocale
      : `/${pathWithLocale}`;

  // 경로 매칭
  if (path === '/' || path === '') {
    return {
      to: '/$locale',
      params: { locale: detectedLocale },
      ...(searchParams && { search: searchParams }),
    };
  }

  if (path === '/about') {
    return {
      to: '/$locale/about',
      params: { locale: detectedLocale },
      ...(searchParams && { search: searchParams }),
    };
  }

  if (path === '/contact') {
    return {
      to: '/$locale/contact',
      params: { locale: detectedLocale },
      ...(searchParams && { search: searchParams }),
    };
  }

  if (path === '/posts') {
    return {
      to: '/$locale/posts',
      params: { locale: detectedLocale },
      ...(searchParams && { search: searchParams }),
    };
  }

  if (path.startsWith('/posts/')) {
    return {
      to: '/$locale/posts/$',
      params: { locale: detectedLocale, _splat: path.slice('/posts/'.length) },
      ...(searchParams && { search: searchParams }),
    };
  }

  // 일치하는 경로가 없으면 루트로 폴백
  return {
    to: '/$locale',
    params: { locale: detectedLocale },
    ...(searchParams && { search: searchParams }),
  };
}

export default function Link({
  href,
  children,
  className,
  ...props
}: LinkProps) {
  const { locale } = useLocaleStore();

  // 외부 링크는 일반 <a> 태그로 처리
  if (href.startsWith('http')) {
    return (
      <a
        href={href}
        className={className}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  // 내부 링크를 TanStack Router 형식으로 변환
  const { to, params, search } = parseInternalLink(href, locale);

  return (
    <RouterLink
      to={to}
      params={params}
      search={search}
      className={className}
      {...props}
    >
      {children}
    </RouterLink>
  );
}
