import { createFileRoute, notFound } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';

import MDComponent, { MarkdownFrontmatter } from '@/1-entities/markdown';
import { getFrontmatter } from '@/1-entities/markdown/util/get-frontmatter';
import TableOfContents from '@/2-features/post/ui/table-of-contents';
import TagChip from '@/2-features/post/ui/tag-chip';
import Reply from '@/5-shared/components/reply';
import { parseLocale } from '@/5-shared/types/common.schema';
import { buildMeta, buildCanonicalLink } from '@/5-shared/util/build-meta';

interface Heading {
  id: string;
  text: string;
  level: number;
}

const BASE_URL =
  'https://raw.githubusercontent.com/chan-ok/blog-content/main';

export const Route = createFileRoute('/$locale/posts/$')({
  // loader: SEO 메타태그 생성을 위해 frontmatter를 미리 로드한다.
  // MDX 컴파일은 컴포넌트 내부에서 별도로 수행한다.
  loader: async ({ params }) => {
    const { locale, _splat } = params;

    if (!_splat || _splat.trim() === '') {
      throw notFound();
    }

    const path = `${locale}/${_splat}.mdx`;

    try {
      const frontmatter = await getFrontmatter(path, BASE_URL);
      return { frontmatter };
    } catch {
      // frontmatter 로드 실패 시 빈 객체 반환 (컴포넌트에서 재시도)
      return { frontmatter: {} };
    }
  },
  // 포스트 상세 페이지 메타태그: loader에서 받은 frontmatter를 활용
  head: ({ params, loaderData }) => {
    const { locale, _splat } = params;

    if (!_splat || !loaderData) {
      return {};
    }

    const { frontmatter } = loaderData;
    const path = `/${locale}/posts/${_splat}`;

    const title = frontmatter.title
      ? `${frontmatter.title} | chan-ok.com`
      : 'chan-ok.com';

    const description =
      frontmatter.summary ??
      (frontmatter.tags?.join(', ')
        ? `${frontmatter.tags.join(', ')} - chan-ok.com`
        : 'chan-ok.com');

    const publishedTime = frontmatter.createdAt
      ? frontmatter.createdAt instanceof Date
        ? frontmatter.createdAt.toISOString()
        : new Date(frontmatter.createdAt).toISOString()
      : undefined;

    return {
      meta: buildMeta({
        title,
        description,
        image: frontmatter.thumbnail,
        type: 'article',
        locale,
        publishedTime,
        tags: frontmatter.tags ?? [],
        path,
      }),
      links: buildCanonicalLink(path),
    };
  },
  component: PostDetailPage,
});

function PostDetailPage() {
  const { locale, _splat } = Route.useParams();

  // _splat이 비어있으면 404
  if (!_splat || _splat.trim() === '') {
    throw notFound();
  }

  // 경로 생성: ko/posts/example.mdx
  const path = `${locale}/${_splat}.mdx`;

  // MDX 파싱 상태
  const [mdxStatus, setMdxStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  // Frontmatter 상태 (partial: README 등 일부 필드 없는 파일 지원)
  const [frontmatter, setFrontmatter] = useState<MarkdownFrontmatter | null>(
    null
  );

  // DOM에서 h1, h2, h3 추출
  const contentRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const extractHeadings = () => {
      if (!contentRef.current) return;

      const elements = contentRef.current.querySelectorAll('h1, h2, h3');
      const extracted: Heading[] = Array.from(elements)
        .filter((el) => el.id) // id가 있는 것만
        .map((el) => ({
          id: el.id,
          text: el.textContent?.replace('#', '').trim() || '',
          level: parseInt(el.tagName[1], 10),
        }));

      setHeadings(extracted);
    };

    // MutationObserver: MDX 비동기 로딩 후 DOM 변경 감지
    const observer = new MutationObserver(() => {
      extractHeadings();
    });

    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
      });
    }

    // 초기 추출 시도
    extractHeadings();

    return () => {
      observer.disconnect();
    };
  }, [path]);

  return (
    <div>
      {/* 메인 콘텐츠: max-w-4xl 중앙 정렬 (부모 레이아웃에서 상속) */}
      <div>
        {/* 메타 헤더: 제목, 날짜, 태그 */}
        {frontmatter && (
          <div className="mb-8 border-b border-zinc-200 pb-6 dark:border-zinc-700">
            <h1 className="mb-4 text-3xl font-bold">{frontmatter.title}</h1>
            {frontmatter.createdAt && (
              <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {format(frontmatter.createdAt, 'yyyy-MM-dd')}
              </div>
            )}
            {frontmatter.tags && frontmatter.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {frontmatter.tags.map((tag) => (
                  <TagChip key={tag} tag={tag} locale={locale} />
                ))}
              </div>
            )}
          </div>
        )}
        <div ref={contentRef} className="mdx-content">
          <MDComponent
            path={path}
            baseUrl={BASE_URL}
            onParseStatus={setMdxStatus}
            onFrontmatterLoaded={setFrontmatter}
          />
        </div>
        {mdxStatus === 'success' && <Reply locale={parseLocale(locale)} />}
      </div>

      {/* TOC: 포스트 콘텐츠 영역 밖에 fixed로 배치 */}
      {mdxStatus === 'success' && <TableOfContents headings={headings} />}
    </div>
  );
}
