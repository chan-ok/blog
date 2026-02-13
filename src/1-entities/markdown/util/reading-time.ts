/**
 * MDX/Markdown 콘텐츠의 읽기 시간 계산 (분 단위)
 * - 한국어 기준: 분당 약 500자
 * - Markdown 문법, 코드블록, frontmatter 제거 후 순수 텍스트 기준
 * @param content - MDX/Markdown 콘텐츠 문자열
 * @returns 읽기 시간 (분 단위, 최소 1분)
 */
export function calculateReadingTime(content: string): number {
  // 1. Frontmatter 제거 (---...---)
  let text = content.replace(/^---[\s\S]*?---\n*/m, '');

  // 2. 코드 블록 제거 (```...```)
  text = text.replace(/```[\s\S]*?```/g, '');

  // 3. 인라인 코드 제거 (`...`)
  text = text.replace(/`[^`]+`/g, '');

  // 4. HTML 태그 제거
  text = text.replace(/<[^>]+>/g, '');

  // 5. 이미지 제거 (![alt](url))
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');

  // 6. 링크 제거 ([text](url) -> text)
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 7. 제목 마크다운 제거 (###, ##, # 등)
  text = text.replace(/^#{1,6}\s+/gm, '');

  // 8. 리스트 마커 제거 (-, *, +, 1.)
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');

  // 9. 볼드/이탤릭 제거 (**, *, __, _)
  text = text.replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1');

  // 10. 연속된 공백/줄바꿈 제거
  text = text.replace(/\s+/g, ' ').trim();

  // 11. 순수 텍스트 길이 계산
  const textLength = text.length;

  // 12. 한국어 기준 분당 500자로 계산
  const CHARS_PER_MINUTE = 500;
  const minutes = Math.ceil(textLength / CHARS_PER_MINUTE);

  // 13. 최소 1분 반환
  return Math.max(minutes, 1);
}
