import DOMPurify from 'isomorphic-dompurify';

/**
 * DOMPurify를 사용한 HTML 소독
 * 모든 HTML 태그를 제거하고 텍스트만 반환
 *
 * @param input - 소독할 문자열
 * @returns 모든 HTML 태그가 제거된 문자열
 */
export function sanitizeInput(input: string): string {
  if (input == null) {
    return '';
  }
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}
