import { Link as RouterLink } from '@tanstack/react-router';
import type { LinkProps as RouterLinkProps } from '@tanstack/react-router';

import { useLocaleStore } from '@/shared/stores/locale-store';

interface LinkProps extends Omit<RouterLinkProps, 'to' | 'params'> {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * 내부 링크를 TanStack Router의 타입 안전한 형식으로 변환합니다.
 *
 * @param href - 변환할 경로 (예: "/about", "/posts", "/ko/contact")
 * @param currentLocale - 현재 locale (예: "ko", "en", "ja")
 * @returns TanStack Router의 to와 params 객체
 */
function parseInternalLink(href: string, currentLocale: string) {
  // 이미 locale이 포함되어 있는지 확인 (/ko/*, /en/*, /ja/*)
  const localeMatch = href.match(/^\/(ko|en|ja)(\/|$)/);

  if (localeMatch) {
    // 이미 locale이 있으면 해당 locale 사용
    const detectedLocale = localeMatch[1];
    const path = href.slice(detectedLocale.length + 1) || '/';

    if (path === '/') {
      return { to: '/$locale' as const, params: { locale: detectedLocale } };
    }

    // 경로 패턴 매칭
    if (path === '/about') {
      return {
        to: '/$locale/about' as const,
        params: { locale: detectedLocale },
      };
    } else if (path === '/contact') {
      return {
        to: '/$locale/contact' as const,
        params: { locale: detectedLocale },
      };
    } else if (path === '/posts') {
      return {
        to: '/$locale/posts' as const,
        params: { locale: detectedLocale },
      };
    } else if (path.startsWith('/posts/')) {
      const postPath = path.slice(7); // Remove '/posts/'
      return {
        to: '/$locale/posts/$' as const,
        params: { locale: detectedLocale, _splat: postPath },
      };
    }

    // 일치하는 경로가 없으면 루트로 폴백
    return { to: '/$locale' as const, params: { locale: detectedLocale } };
  }

  // locale이 없으면 현재 locale 사용
  if (href === '/' || href === '') {
    return { to: '/$locale' as const, params: { locale: currentLocale } };
  }

  // 슬래시로 시작하는지 확인하고 정규화
  const normalizedPath = href.startsWith('/') ? href : `/${href}`;

  // 경로 패턴 매칭
  if (normalizedPath === '/about') {
    return { to: '/$locale/about' as const, params: { locale: currentLocale } };
  } else if (normalizedPath === '/contact') {
    return {
      to: '/$locale/contact' as const,
      params: { locale: currentLocale },
    };
  } else if (normalizedPath === '/posts') {
    return { to: '/$locale/posts' as const, params: { locale: currentLocale } };
  } else if (normalizedPath.startsWith('/posts/')) {
    const postPath = normalizedPath.slice(7); // Remove '/posts/'
    return {
      to: '/$locale/posts/$' as const,
      params: { locale: currentLocale, _splat: postPath },
    };
  }

  // 일치하는 경로가 없으면 루트로 폴백
  return { to: '/$locale' as const, params: { locale: currentLocale } };
}

export default function Link({
  href,
  children,
  className,
  ...props
}: LinkProps) {
  const { locale } = useLocaleStore();
  const isExternal = href.startsWith('http');

  // 외부 링크는 일반 <a> 태그로 처리
  if (isExternal) {
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
  const { to, params } = parseInternalLink(href, locale);

  return (
    <RouterLink to={to} params={params} className={className} {...props}>
      {children}
    </RouterLink>
  );
}
