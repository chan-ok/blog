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

  // 10. 연속된 공백/줄바꿈을 하나의 공백으로
  text = text.replace(/\s+/g, ' ').trim();

  // 11. maxLength 초과 시 자르기
  if (text.length > maxLength) {
    return text.slice(0, maxLength).trim() + '...';
  }

  return text;
}
