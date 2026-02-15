import { stripMarkdownSyntax } from './strip-markdown-syntax';

/**
 * MDX/Markdown 콘텐츠의 읽기 시간 계산 (분 단위)
 * - 한국어 기준: 분당 약 500자
 * - Markdown 문법, 코드블록, frontmatter 제거 후 순수 텍스트 기준
 * @param content - MDX/Markdown 콘텐츠 문자열
 * @returns 읽기 시간 (분 단위, 최소 1분)
 */
export function calculateReadingTime(content: string): number {
  const text = stripMarkdownSyntax(content);
  const textLength = text.length;

  // 한국어 기준 분당 500자로 계산
  const CHARS_PER_MINUTE = 500;
  const minutes = Math.ceil(textLength / CHARS_PER_MINUTE);

  // 최소 1분 반환
  return Math.max(minutes, 1);
}
