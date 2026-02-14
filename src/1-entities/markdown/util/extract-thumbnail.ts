/**
 * MDX/Markdown 콘텐츠에서 첫 번째 이미지 URL 추출
 * @param content - MDX/Markdown 콘텐츠 문자열
 * @returns 첫 번째 이미지 URL 또는 null
 */
export function extractThumbnail(content: string): string | null {
  // Markdown 이미지 패턴: ![alt](url)
  const markdownImageRegex = /!\[.*?\]\((.*?)\)/;
  const markdownMatch = content.match(markdownImageRegex);

  if (markdownMatch?.[1]) {
    return markdownMatch[1].trim();
  }

  // HTML img 태그 패턴: <img src="url">
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["']/;
  const htmlMatch = content.match(htmlImageRegex);

  if (htmlMatch?.[1]) {
    return htmlMatch[1].trim();
  }

  return null;
}
