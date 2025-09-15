// 문자열 자르기 (말줄임표 포함)
export function truncateString(str: string, maxLength: number, ellipsis: string = "..."): string {
  if (str.length <= maxLength) return str;

  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

// 첫 글자 대문자로
export function capitalize(str: string): string {
  if (!str) return "";

  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 카멜케이스로 변환
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

// 케밥케이스로 변환
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

// 스네이크케이스로 변환
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

// 슬러그 생성 (URL 친화적)
export function createSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // 특수문자 제거
    .replace(/[\s_-]+/g, "-") // 공백을 하이픈으로
    .replace(/^-+|-+$/g, ""); // 앞뒤 하이픈 제거
}

// 랜덤 문자열 생성
export function generateRandomString(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

// 이메일 형식 검증
export function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// URL 형식 검증
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 전화번호 형식 검증 (한국)
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const phonePattern = /^(01[016789]|02|0[3-9][0-9])-?[0-9]{3,4}-?[0-9]{4}$/;
  return phonePattern.test(phoneNumber.replace(/\s/g, ""));
}

// 문자열에서 HTML 태그 제거
export function removeHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

// 문자열에서 공백 정리
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, " ").trim();
}

// 문자열 마스킹 (예: 이메일, 전화번호)
export function maskString(str: string, startPosition: number = 2, endPosition?: number): string {
  if (str.length <= startPosition) return str;

  const end = endPosition || str.length - 2;
  const prefix = str.slice(0, startPosition);
  const suffix = str.slice(end);
  const maskLength = end - startPosition;

  return prefix + "*".repeat(maskLength) + suffix;
}

// 문자열을 숫자로 안전하게 변환
export function parseNumber(str: string, defaultValue: number = 0): number {
  const num = Number(str);
  return isNaN(num) ? defaultValue : num;
}

// 바이트 크기를 읽기 쉽게 표시
export function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}