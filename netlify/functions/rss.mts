/**
 * RSS 2.0 피드 생성 Netlify Function
 *
 * 경로: /api/rss (netlify.toml 리다이렉트 적용)
 * 쿼리파라미터: ?locale=ko|en|ja (기본값: ko)
 */

import z from 'zod';

// H-1: blog-content index.json 응답을 Zod 스키마로 검증
const PostInfoSchema = z.object({
  title: z.string(),
  path: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string().nullish(),
  published: z.boolean(),
  thumbnail: z.string().optional(),
  summary: z.string().optional(),
});

const PostInfoArraySchema = z.array(PostInfoSchema);

type PostInfo = z.infer<typeof PostInfoSchema>;

type NetlifyEvent = {
  httpMethod: string;
  queryStringParameters?: Record<string, string> | null;
};

type NetlifyResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

// 지원하는 locale 목록
const SUPPORTED_LOCALES = ['ko', 'en', 'ja'] as const;
type LocaleType = (typeof SUPPORTED_LOCALES)[number];

// 프로덕션에서 숨겨야 하는 태그
const DEV_ONLY_TAGS = ['test', 'draft'] as const;

/** XML 특수문자 이스케이프 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** locale 파라미터 검증 및 파싱 */
function parseLocale(raw: string | undefined): LocaleType {
  if (raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw)) {
    return raw as LocaleType;
  }
  return 'ko';
}

/** dev-only 태그 보유 여부 확인 */
function hasDevOnlyTag(tags: string[] | undefined): boolean {
  if (!tags?.length) return false;
  return tags.some((tag) => (DEV_ONLY_TAGS as readonly string[]).includes(tag));
}

/** locale별 피드 제목 */
function getFeedTitle(locale: LocaleType): string {
  const titles: Record<LocaleType, string> = {
    ko: 'Chanho.dev 블로그',
    en: 'Chanho.dev Blog',
    ja: 'Chanho.dev ブログ',
  };
  return titles[locale];
}

/** locale별 피드 설명 */
function getFeedDescription(locale: LocaleType): string {
  const descriptions: Record<LocaleType, string> = {
    ko: '프론트엔드 개발, 기술, 경험을 공유합니다.',
    en: 'Sharing frontend development, technology, and experiences.',
    ja: 'フロントエンド開発、技術、経験を共有します。',
  };
  return descriptions[locale];
}

/** RSS 2.0 XML 문자열 생성 */
function buildRssXml(
  posts: PostInfo[],
  locale: LocaleType,
  siteUrl: string
): string {
  const feedTitle = getFeedTitle(locale);
  const feedDescription = getFeedDescription(locale);
  const feedLink = `${siteUrl}/${locale}/posts`;
  const feedUrl = `${siteUrl}/api/rss?locale=${locale}`;
  const lastBuildDate = new Date().toUTCString();

  const items = posts
    .map((post) => {
      // M-1: path 각 세그먼트를 escapeXml + encodeURIComponent 처리하여 XML Injection 방지
      const postPath = post.path
        .map((segment) => encodeURIComponent(escapeXml(segment)))
        .join('/');
      const postLink = `${siteUrl}/${locale}/posts/${postPath}`;
      const pubDate = new Date(post.createdAt).toUTCString();
      const title = escapeXml(post.title);
      const description = post.summary ? escapeXml(post.summary) : '';

      const categories = (post.tags ?? [])
        .map((tag) => `    <category>${escapeXml(tag)}</category>`)
        .join('\n');

      return `  <item>
    <title>${title}</title>
    <link>${postLink}</link>
    <guid isPermaLink="true">${postLink}</guid>
    <pubDate>${pubDate}</pubDate>
    ${description ? `<description>${description}</description>` : ''}
${categories}
  </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${feedLink}</link>
    <description>${escapeXml(feedDescription)}</description>
    <language>${locale}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

export const handler = async (
  event: NetlifyEvent
): Promise<NetlifyResponse> => {
  try {
    if (event.httpMethod.toUpperCase() !== 'GET') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const locale = parseLocale(event.queryStringParameters?.locale);

    // M-2: VITE_ 접두사 없는 서버 전용 환경변수 사용 (VITE_* 는 클라이언트 번들에 노출됨)
    const baseURL = process.env.GIT_RAW_URL;
    if (!baseURL) {
      return {
        statusCode: 500,
        body: 'GIT_RAW_URL is not configured',
      };
    }

    const siteUrl = process.env.URL ?? 'https://chan-ok.com';

    const indexUrl = `${baseURL}/${locale}/index.json`;

    // M-3: 타임아웃 추가로 외부 요청 무한 대기 방지
    const response = await fetch(indexUrl, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return {
        statusCode: 502,
        body: `Failed to fetch posts index: ${response.status}`,
      };
    }

    // H-1: Zod 스키마로 외부 데이터 검증
    const rawData: unknown = await response.json();
    const parseResult = PostInfoArraySchema.safeParse(rawData);
    if (!parseResult.success) {
      console.error('[rss] Invalid posts index format:', parseResult.error);
      return {
        statusCode: 502,
        body: 'Invalid posts index format',
      };
    }

    const allPosts = parseResult.data;

    const publishedPosts = allPosts
      .filter((post) => post.published)
      .filter((post) => !hasDevOnlyTag(post.tags))
      // L-1: 유효하지 않은 날짜 포스트 제외
      .filter((post) => !isNaN(new Date(post.createdAt).getTime()))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const xml = buildRssXml(publishedPosts, locale, siteUrl);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
      body: xml,
    };
  } catch (err: unknown) {
    // H-2: 내부 에러 메시지를 클라이언트에 노출하지 않음
    console.error('[rss] Unhandled error:', err);
    return {
      statusCode: 500,
      body: 'Internal server error',
    };
  }
};
