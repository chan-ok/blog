/**
 * MDX/Markdown 콘텐츠에서 문법을 제거하고 순수 텍스트 추출
 * - extract-excerpt.ts와 reading-time.ts에서 공통 사용
 * @param content - MDX/Markdown 콘텐츠 문자열
 * @returns 순수 텍스트 문자열
 */
export function stripMarkdownSyntax(content: string): string {
  // 1. Frontmatter 제거 (파일 맨 앞의 --- ... --- 블록만)
  let text = content.replace(/^---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/, '');
  // 2. 코드 블록 제거 (```...```)
  text = text.replace(/```[\s\S]*?```/g, '');
  // 3. 인라인 코드 제거 (`...`)
  text = text.replace(/`[^`]+`/g, '');
  // 4. HTML 태그 제거 (변형을 고려하여 반복 적용)
  {
    let previous: string;
    do {
      previous = text;
      text = text.replace(/<[^>]+>/g, '');
    } while (text !== previous);
  }
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
  return text.replace(/\s+/g, ' ').trim();
}
