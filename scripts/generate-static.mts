/**
 * 정적 파일 사전 생성 스크립트
 *
 * Netlify 빌드 시 실행되어 public/ 디렉터리에 아래 파일을 생성한다.
 *   - public/sitemap.xml  (SEO용 사이트맵)
 *   - public/llms.txt     (LLM 크롤러용 사이트 개요)
 *
 * 실행: pnpm generate
 * 환경변수:
 *   GIT_RAW_URL — blog-content GitHub Raw base URL (필수)
 *   URL         — 배포 사이트 URL (기본값: https://chan-ok.com)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import z from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '../public');

// H-1: blog-content index.json 응답을 Zod 스키마로 검증
const PostInfoSchema = z.object({
  title: z.string(),
  path: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string().nullish(),
  published: z.boolean(),
  summary: z.string().optional(),
});

const PostInfoArraySchema = z.array(PostInfoSchema);

type PostInfo = z.infer<typeof PostInfoSchema>;

const SUPPORTED_LOCALES = ['ko', 'en', 'ja'] as const;
type LocaleType = (typeof SUPPORTED_LOCALES)[number];

const DEV_ONLY_TAGS = ['test', 'draft'] as const;

const STATIC_PATHS = ['', '/posts', '/about', '/contact'] as const;

// ── 유틸 ───────────────────────────────────────────────────────────────────

function hasDevOnlyTag(tags: string[] | undefined): boolean {
  if (!tags?.length) return false;
  return tags.some((tag) => (DEV_ONLY_TAGS as readonly string[]).includes(tag));
}

function toIsoDate(dateStr: string): string {
  return new Date(dateStr).toISOString().split('T')[0];
}

function todayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

// ── Fetch ──────────────────────────────────────────────────────────────────

async function fetchPostsForLocale(
  baseURL: string,
  locale: LocaleType
): Promise<PostInfo[]> {
  const indexUrl = `${baseURL}/${locale}/index.json`;

  const response = await fetch(indexUrl, {
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    console.warn(`[generate] ${locale} index fetch 실패: ${response.status}`);
    return [];
  }

  const rawData: unknown = await response.json();
  const parseResult = PostInfoArraySchema.safeParse(rawData);

  if (!parseResult.success) {
    console.warn(`[generate] ${locale} index 스키마 불일치:`, parseResult.error.message);
    return [];
  }

  return parseResult.data
    .filter((post) => post.published)
    .filter((post) => !hasDevOnlyTag(post.tags))
    .filter((post) => !isNaN(new Date(post.createdAt).getTime()))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

// ── Sitemap 생성 ───────────────────────────────────────────────────────────

function buildSitemapXml(
  postsByLocale: Record<LocaleType, PostInfo[]>,
  siteUrl: string
): string {
  const today = todayIsoDate();
  const entries: string[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const path of STATIC_PATHS) {
      const loc = `${siteUrl}/${locale}${path}`;
      const priority = path === '' ? '1.0' : '0.8';
      entries.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`);
    }

    for (const post of postsByLocale[locale]) {
      const postPath = post.path
        .map((segment) => encodeURIComponent(segment))
        .join('/');
      const loc = `${siteUrl}/${locale}/posts/${postPath}`;
      const lastmod = post.updatedAt
        ? toIsoDate(post.updatedAt)
        : toIsoDate(post.createdAt);
      entries.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;
}

// ── llms.txt 생성 ──────────────────────────────────────────────────────────

function buildLocaleSection(
  posts: PostInfo[],
  locale: LocaleType,
  siteUrl: string
): string {
  const labels: Record<LocaleType, string> = {
    ko: '한국어 (Korean)',
    en: 'English',
    ja: '日本語 (Japanese)',
  };

  if (posts.length === 0) return '';

  const lines = posts
    .map((post) => {
      const postPath = post.path
        .map((segment) => encodeURIComponent(segment))
        .join('/');
      const url = `${siteUrl}/${locale}/posts/${postPath}`;
      const date = toIsoDate(post.createdAt);
      const tags = post.tags?.length ? ` [${post.tags.join(', ')}]` : '';
      const summary = post.summary ? `: ${post.summary}` : '';
      return `- [${post.title}](${url}) (${date})${tags}${summary}`;
    })
    .join('\n');

  return `## ${labels[locale]} Posts\n\n${lines}`;
}

function buildLlmsTxt(
  postsByLocale: Record<LocaleType, PostInfo[]>,
  siteUrl: string
): string {
  const totalPosts = Object.values(postsByLocale).reduce(
    (sum, posts) => sum + posts.length,
    0
  );

  const sections = SUPPORTED_LOCALES.map((locale) =>
    buildLocaleSection(postsByLocale[locale], locale, siteUrl)
  )
    .filter(Boolean)
    .join('\n\n');

  return `# chan-ok.com

> 프론트엔드 개발, 기술, 경험을 기록하는 개인 블로그입니다.
> A personal blog sharing frontend development, technology, and experiences.

## Site Info

- URL: ${siteUrl}
- Author: Chanho Kim
- Languages: Korean, English, Japanese
- Topics: Frontend Development, React, TypeScript, Web Performance, Career
- Total Posts: ${totalPosts}

## Navigation

- [Korean Blog](${siteUrl}/ko): 한국어 포스트
- [English Blog](${siteUrl}/en): English posts
- [Japanese Blog](${siteUrl}/ja): 日本語のポスト
- [About](${siteUrl}/ko/about): 저자 소개 / About the author
- [Contact](${siteUrl}/ko/contact): 연락처 / Contact
- [RSS Feed](${siteUrl}/api/rss?locale=ko): RSS 피드 (한국어)
- [Sitemap](${siteUrl}/sitemap.xml): 전체 사이트맵

## Content Policy

All content is original writing by the author.
Posts are written in Korean, English, or Japanese.
Code examples are provided for educational purposes.

${sections}
`;
}

// ── 메인 ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const baseURL = process.env.GIT_RAW_URL;
  if (!baseURL) {
    // 로컬 개발 시 환경변수 없으면 빈 파일 생성 후 종료
    console.warn('[generate] GIT_RAW_URL 미설정 — 빈 파일로 생성합니다.');
    mkdirSync(PUBLIC_DIR, { recursive: true });
    writeFileSync(resolve(PUBLIC_DIR, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
    writeFileSync(resolve(PUBLIC_DIR, 'llms.txt'), '# chan-ok.com\n');
    return;
  }

  const siteUrl = process.env.URL ?? 'https://chan-ok.com';

  console.log('[generate] 포스트 index fetch 중...');
  const [koPosts, enPosts, jaPosts] = await Promise.all(
    SUPPORTED_LOCALES.map((locale) => fetchPostsForLocale(baseURL, locale))
  );

  const postsByLocale: Record<LocaleType, PostInfo[]> = {
    ko: koPosts,
    en: enPosts,
    ja: jaPosts,
  };

  const total = koPosts.length + enPosts.length + jaPosts.length;
  console.log(`[generate] 포스트 수집 완료 — ko:${koPosts.length} en:${enPosts.length} ja:${jaPosts.length} (합계: ${total})`);

  mkdirSync(PUBLIC_DIR, { recursive: true });

  const sitemapXml = buildSitemapXml(postsByLocale, siteUrl);
  writeFileSync(resolve(PUBLIC_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log('[generate] public/sitemap.xml 생성 완료');

  const llmsTxt = buildLlmsTxt(postsByLocale, siteUrl);
  writeFileSync(resolve(PUBLIC_DIR, 'llms.txt'), llmsTxt, 'utf-8');
  console.log('[generate] public/llms.txt 생성 완료');
}

main().catch((err: unknown) => {
  console.error('[generate] 오류:', err);
  process.exit(1);
});
