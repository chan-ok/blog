/** 사이트 기본 정보 */
const SITE_NAME = 'chan-ok.com';
const SITE_URL = 'https://chan-ok.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

/**
 * TanStack Router head() 반환값에서 meta 배열로 사용할 타입.
 * RouteMatchExtensions.meta는 React.JSX.IntrinsicElements['meta'] 배열을 기대하지만
 * 런타임의 headContentUtils는 { title } / { name, content } / { property, content } 형식을 처리한다.
 */
type MetaTag =
  | ({ title: string } & Record<string, unknown>)
  | React.JSX.IntrinsicElements['meta'];

/** 페이지별 메타태그 생성 옵션 */
export interface MetaOptions {
  /** 페이지 제목 (탭 타이틀 및 og:title) */
  title: string;
  /** 페이지 설명 */
  description: string;
  /** OG 이미지 URL (절대 URL) */
  image?: string;
  /** OG 콘텐츠 타입 */
  type?: 'website' | 'article';
  /** 페이지 로케일 (e.g. 'ko', 'en', 'ja') */
  locale?: string;
  /** 포스트 발행 일시 (ISO 8601) */
  publishedTime?: string;
  /** 포스트 태그 목록 */
  tags?: string[];
  /** canonical 경로 (e.g. '/ko/posts/my-post') */
  path?: string;
}

/**
 * 페이지별 메타태그 배열을 생성한다.
 * TanStack Router route의 `head()` 옵션에서 meta 필드로 전달한다.
 *
 * 반환 타입은 TanStack Router의 RouteMatchExtensions.meta와 호환되도록
 * React.JSX.IntrinsicElements['meta']로 캐스팅한다.
 */
export function buildMeta(
  options: MetaOptions
): React.JSX.IntrinsicElements['meta'][] {
  const {
    title,
    description,
    image = DEFAULT_IMAGE,
    type = 'website',
    locale = 'ko',
    publishedTime,
    tags = [],
    path,
  } = options;

  const canonicalUrl = path ? `${SITE_URL}${path}` : SITE_URL;

  const meta: MetaTag[] = [
    // 페이지 제목: headContentUtils가 { title } 형식을 인식하여 <title> 태그로 렌더링
    { title },
    // 기본 메타
    { name: 'description', content: description },

    // Open Graph 기본
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:image', content: image },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:locale', content: localeToOgLocale(locale) },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ];

  // 아티클 전용 메타태그 (포스트 상세 페이지)
  if (type === 'article' && publishedTime) {
    meta.push({ property: 'article:published_time', content: publishedTime });
  }

  if (type === 'article' && tags.length > 0) {
    tags.forEach((tag) => {
      meta.push({ property: 'article:tag', content: tag });
    });
  }

  // 런타임 호환성을 위해 캐스팅:
  // TanStack Router headContentUtils는 런타임에 { title }, { name }, { property } 형식을 모두 처리한다
  return meta as React.JSX.IntrinsicElements['meta'][];
}

/**
 * 로케일 코드를 Open Graph locale 형식으로 변환한다.
 * (예: 'ko' → 'ko_KR', 'en' → 'en_US', 'ja' → 'ja_JP')
 */
function localeToOgLocale(locale: string): string {
  const map: Record<string, string> = {
    ko: 'ko_KR',
    en: 'en_US',
    ja: 'ja_JP',
  };
  return map[locale] ?? locale;
}

/**
 * canonical link 태그를 생성한다.
 * TanStack Router route의 `head()` 옵션에서 links 필드로 전달한다.
 */
export function buildCanonicalLink(
  path: string
): React.JSX.IntrinsicElements['link'][] {
  return [{ rel: 'canonical', href: `${SITE_URL}${path}` }];
}

/**
 * 홈 페이지 메타 설명 (로케일별)
 */
export function getHomeDescription(locale: string): string {
  const descriptions: Record<string, string> = {
    ko: '개발, 기술, 일상에 대한 생각을 기록하는 블로그입니다.',
    en: 'A blog recording thoughts on development, technology, and everyday life.',
    ja: '開発、技術、日常についての考えを記録するブログです。',
  };
  return descriptions[locale] ?? descriptions['ko']!;
}

/**
 * 소개 페이지 메타 설명 (로케일별)
 */
export function getAboutDescription(locale: string): string {
  const descriptions: Record<string, string> = {
    ko: 'chan-ok.com 블로그 운영자 소개 페이지입니다.',
    en: 'About the author of chan-ok.com.',
    ja: 'chan-ok.com のブログ運営者の紹介ページです。',
  };
  return descriptions[locale] ?? descriptions['ko']!;
}

/**
 * 포스트 목록 페이지 메타 설명 (로케일별)
 */
export function getPostsDescription(locale: string): string {
  const descriptions: Record<string, string> = {
    ko: '개발, 기술, 일상에 관한 포스트 목록입니다.',
    en: 'A list of posts about development, technology, and everyday life.',
    ja: '開発、技術、日常に関する投稿一覧です。',
  };
  return descriptions[locale] ?? descriptions['ko']!;
}
