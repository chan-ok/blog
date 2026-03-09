/**
 * RSS 엔드포인트 IP 기반 Rate Limiting Edge Function
 *
 * 슬라이딩 윈도우 방식으로 분당 최대 10회 요청 허용.
 * 인메모리 Map 사용 — 인스턴스 내에서만 유효 (개인 블로그 규모에 적합).
 */

// 인메모리 Rate Limit 저장소: IP → 요청 타임스탬프 배열
const requestLog = new Map<string, number[]>();

const WINDOW_MS = 60_000; // 1분 슬라이딩 윈도우
const MAX_REQUESTS = 10; // 분당 최대 10회

export default async function handler(
  request: Request
): Promise<Response | undefined> {
  // Netlify가 주입하는 실제 클라이언트 IP 헤더 (프록시 우회 방지)
  const ip =
    request.headers.get('x-nf-client-connection-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown';

  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // 윈도우 밖 타임스탬프 제거 후 현재 요청 추가
  const timestamps = (requestLog.get(ip) ?? []).filter(
    (t) => t > windowStart
  );
  timestamps.push(now);
  requestLog.set(ip, timestamps);

  if (timestamps.length > MAX_REQUESTS) {
    const resetAt = Math.ceil((windowStart + WINDOW_MS) / 1000);
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': String(MAX_REQUESTS),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(resetAt),
      },
    });
  }

  // 통과 시 undefined 반환 → 다음 핸들러(RSS Function)로 전달
  return undefined;
}

export const config = { path: '/api/rss' };
