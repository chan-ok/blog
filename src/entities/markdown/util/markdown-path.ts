import { hasAsciiControlCharacter } from '@/shared/util/text-security';

const MAX_MARKDOWN_PATH_LENGTH = 512;
const MAX_MARKDOWN_PATH_SEGMENTS = 20;
const MAX_MARKDOWN_SEGMENT_LENGTH = 160;

function decodePathOnce(path: string): string {
  try {
    return decodeURIComponent(path);
  } catch {
    throw new Error('Invalid Markdown path: malformed percent encoding');
  }
}

function assertSafePathSegment(segment: string): void {
  if (
    segment.length === 0 ||
    segment.length > MAX_MARKDOWN_SEGMENT_LENGTH ||
    segment === '.' ||
    segment === '..' ||
    /[\\?#]/u.test(segment) ||
    hasAsciiControlCharacter(segment)
  ) {
    throw new Error('Invalid Markdown path segment');
  }
}

export function normalizeMarkdownPath(path: string): string {
  if (typeof path !== 'string' || path.length === 0 || path.length > MAX_MARKDOWN_PATH_LENGTH) {
    throw new Error('Invalid Markdown path');
  }

  const decodedPath = decodePathOnce(path);
  if (decodedPath.startsWith('/') || decodedPath.endsWith('/')) {
    throw new Error('Invalid Markdown path');
  }

  const segments = decodedPath.split('/');
  if (segments.length === 0 || segments.length > MAX_MARKDOWN_PATH_SEGMENTS) {
    throw new Error('Invalid Markdown path');
  }

  segments.forEach(assertSafePathSegment);

  const fileNameIndex = segments.length - 1;
  const normalizedSegments = segments.map((segment, index) =>
    index === fileNameIndex ? segment.replaceAll('_', ' ') : segment
  );

  return normalizedSegments.map((segment) => encodeURIComponent(segment)).join('/');
}

export function buildMarkdownUrl(path: string, baseUrl: string): string {
  let base: URL;
  try {
    base = new URL(baseUrl);
  } catch {
    throw new Error('Invalid Markdown base URL');
  }

  if (
    base.protocol !== 'https:' ||
    base.username !== '' ||
    base.password !== '' ||
    base.search !== '' ||
    base.hash !== ''
  ) {
    throw new Error('Invalid Markdown base URL');
  }

  const baseWithSlash = new URL(base.href.endsWith('/') ? base.href : `${base.href}/`);
  const target = new URL(normalizeMarkdownPath(path), baseWithSlash);

  if (
    target.origin !== baseWithSlash.origin ||
    !target.pathname.startsWith(baseWithSlash.pathname)
  ) {
    throw new Error('Invalid Markdown path');
  }

  return target.href;
}
