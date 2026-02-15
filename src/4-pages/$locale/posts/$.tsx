import { createFileRoute, notFound } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';

import MDComponent from '@/1-entities/markdown';
import TableOfContents from '@/2-features/post/ui/table-of-contents';
import Reply from '@/5-shared/components/reply';
import { parseLocale } from '@/5-shared/types/common.schema';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export const Route = createFileRoute('/$locale/posts/$')({
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
  const [mdxStatus, setMdxStatus] = useState<'loading' | 'success' | 'error'>('loading');

  // DOM에서 h2, h3 추출
  const contentRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const extractHeadings = () => {
      if (!contentRef.current) return;

      const elements = contentRef.current.querySelectorAll('h2, h3');
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
    <div className={mdxStatus === 'success' ? 'lg:grid lg:grid-cols-[1fr_250px] lg:gap-8' : ''}>
      {/* 메인 콘텐츠 */}
      <div>
        <div ref={contentRef}>
          <MDComponent 
            path={path} 
            baseUrl="https://raw.githubusercontent.com/chan-ok/blog-content/main"
            onParseStatus={setMdxStatus} 
          />
        </div>
        {mdxStatus === 'success' && <Reply locale={parseLocale(locale)} />}
      </div>

      {/* 데스크탑: 오른쪽 TOC 사이드바 */}
      {mdxStatus === 'success' && <TableOfContents headings={headings} />}
    </div>
  );
}
