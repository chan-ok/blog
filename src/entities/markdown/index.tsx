import { useState, useEffect, useMemo } from 'react';
import { useRouter } from '@tanstack/react-router';
import * as runtime from 'react/jsx-runtime';
import getMarkdown from './util/get-markdown';
import setMdxComponents from './util/set-md-components';

interface MDComponentProps {
  path: string;
  baseUrl?: string;
}

export default function MDComponent({ path, baseUrl }: MDComponentProps) {
  const router = useRouter();

  // 1. 데이터 페칭 (클라이언트 사이드)
  const [markdownData, setMarkdownData] = useState<{
    compiledSource: string;
    frontmatter: unknown;
  } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getMarkdown(path, baseUrl)
      .then((data) => {
        setMarkdownData({
          compiledSource: data.compiledSource,
          frontmatter: data.frontmatter,
        });
      })
      .catch((err) => {
        setError(err);
        console.error('Failed to fetch markdown:', err);
        // TODO: 404 페이지 처리는 나중에
      });
  }, [path, baseUrl, router]);

  // 2. MDX 컴파일된 코드를 React 컴포넌트로 변환
  const MDXContent = useMemo(() => {
    if (!markdownData) return null;

    try {
      // new Function으로 컴파일된 MDX 실행
      const { default: Component } = new Function(
        ...Object.keys(runtime),
        markdownData.compiledSource
      )(...Object.values(runtime));

      return Component;
    } catch (err) {
      console.error('Failed to render MDX:', err);
      return null;
    }
  }, [markdownData]);

  // 3. MDX 컴포넌트 설정
  const components = setMdxComponents();

  // 로딩 상태
  if (!markdownData) {
    return <div className="animate-pulse">Loading...</div>;
  }

  // 에러 상태
  if (error || !MDXContent) {
    return <div>Failed to load content</div>;
  }

  // 4. 렌더링
  return <MDXContent components={components} />;
}
