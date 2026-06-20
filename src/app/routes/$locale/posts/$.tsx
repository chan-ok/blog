import { createFileRoute, notFound } from '@tanstack/react-router';
import { Suspense, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';

import MDComponent from '@/entities/markdown';
import getMarkdown from '@/entities/markdown/util/get-markdown';
import TableOfContents from '@/features/post/ui/table-of-contents';
import { buildMeta, buildCanonicalLink } from '@/shared/util/build-meta';

interface Heading {
  id: string;
  text: string;
  level: number;
}

const BASE_URL = 'https://raw.githubusercontent.com/chan-ok/blog-content/main';

export const Route = createFileRoute('/$locale/posts/$')({
  loader: async ({ params }) => {
    const { locale, _splat } = params;

    if (!_splat || _splat.trim() === '') {
      throw notFound();
    }

    const path = `${locale}/${_splat}.mdx`;
    const markdown = await getMarkdown(path, BASE_URL);

    return {
      frontmatter: markdown.frontmatter,
      markdownPromise: Promise.resolve(markdown),
      path,
    };
  },
  // 포스트 상세 페이지 메타태그: loader에서 받은 frontmatter를 활용
  head: ({ params, loaderData }) => {
    const { locale, _splat } = params;

    if (!_splat || !loaderData) {
      return {};
    }

    const { frontmatter } = loaderData;
    const path = `/${locale}/posts/${_splat}`;

    const title = frontmatter.title ? `${frontmatter.title} | chan-ok.com` : 'chan-ok.com';

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
  const { frontmatter, markdownPromise, path } = Route.useLoaderData();

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
    <div className="mx-auto max-w-155 pb-16">
      <div>
        {/* 메타 헤더: 제목, 날짜 */}
        {frontmatter.title && (
          <div className="mb-8 border-b-2 border-ink pb-6">
            <h1 className="mb-4 text-[32px] font-bold leading-tight text-ink">
              {frontmatter.title}
            </h1>
            {frontmatter.createdAt && (
              <div className="mb-4 flex items-center gap-3 text-[11px] tracking-[1px] text-ink3 tabular-nums">
                <span>{format(frontmatter.createdAt, 'yyyy.MM.dd')}</span>
              </div>
            )}
          </div>
        )}
        {/* TOC: 모바일에서는 본문 위에 표시, 데스크탑에서는 fixed 사이드바 */}
        <TableOfContents headings={headings} />
        <div ref={contentRef} className="mdx-content">
          <Suspense fallback={<MarkdownSkeleton />}>
            <MDComponent dataPromise={markdownPromise} baseUrl={BASE_URL} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function MarkdownSkeleton() {
  return (
    <div className="flex items-center justify-center p-8 text-ink3">
      <div
        className="h-5 w-5 animate-spin rounded-full border-2 border-rule border-t-accent"
        aria-label="Loading post"
      />
    </div>
  );
}
