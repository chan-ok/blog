import { stripMarkdownSyntax } from './strip-markdown-syntax';

/**
 * MDX/Markdown 콘텐츠에서 발췌문 추출
 * @param content - MDX/Markdown 콘텐츠 문자열
 * @param maxLength - 최대 길이 (기본값: 200)
 * @returns 순수 텍스트 발췌문
 */
export function extractExcerpt(
  content: string,
  maxLength: number = 200
): string {
  const text = stripMarkdownSyntax(content);

  if (text.length > maxLength) {
    return text.slice(0, maxLength).trim() + '...';
  }

  return text;
}
