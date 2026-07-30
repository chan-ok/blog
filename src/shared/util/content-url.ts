import { hasAsciiControlCharacter } from './text-security';

const MAX_CONTENT_URL_LENGTH = 2_048;
const SCHEME = /^[a-z][a-z\d+.-]*:/iu;
const EXTERNAL_CONTENT_ORIGINS = new Set(['https://skillicons.dev']);

function parseHttpsUrl(value: string): URL | undefined {
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.username !== '' ||
      url.password !== '' ||
      value.startsWith('//')
    ) {
      return undefined;
    }
    return url;
  } catch {
    return undefined;
  }
}

function containsTraversal(value: string): boolean {
  const path = value.split(/[?#]/u, 1)[0] ?? '';

  try {
    return decodeURIComponent(path)
      .split('/')
      .some((segment) => segment === '.' || segment === '..');
  } catch {
    return true;
  }
}

function parseContentRoot(baseUrl?: string): URL | undefined {
  if (!baseUrl) {
    return undefined;
  }

  const base = parseHttpsUrl(baseUrl);
  if (!base || base.search !== '' || base.hash !== '') {
    return undefined;
  }

  return new URL(base.href.endsWith('/') ? base.href : `${base.href}/`);
}

function isWithinContentRoot(url: URL, contentRoot: URL): boolean {
  return url.origin === contentRoot.origin && url.pathname.startsWith(contentRoot.pathname);
}

/**
 * Resolves an image or other passive content URL without allowing active schemes,
 * credentials, protocol-relative URLs, or paths outside a configured HTTPS root.
 */
export function resolveContentUrl(source: string, baseUrl?: string): string | undefined {
  if (
    typeof source !== 'string' ||
    source.length === 0 ||
    source.length > MAX_CONTENT_URL_LENGTH ||
    source !== source.trim() ||
    source.includes('\\') ||
    hasAsciiControlCharacter(source) ||
    source.startsWith('//') ||
    containsTraversal(source)
  ) {
    return undefined;
  }

  if (SCHEME.test(source)) {
    const absoluteUrl = parseHttpsUrl(source);
    if (!absoluteUrl) {
      return undefined;
    }

    if (EXTERNAL_CONTENT_ORIGINS.has(absoluteUrl.origin)) {
      return absoluteUrl.href;
    }

    const contentRoot = parseContentRoot(baseUrl);
    return contentRoot && isWithinContentRoot(absoluteUrl, contentRoot)
      ? absoluteUrl.href
      : undefined;
  }

  if (!baseUrl || source.startsWith('/')) {
    return undefined;
  }

  const contentRoot = parseContentRoot(baseUrl);
  if (!contentRoot) {
    return undefined;
  }

  const resolved = new URL(source, contentRoot);

  if (resolved.protocol !== 'https:' || !isWithinContentRoot(resolved, contentRoot)) {
    return undefined;
  }

  return resolved.href;
}
