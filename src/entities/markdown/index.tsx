import { useState, useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import * as runtime from 'react/jsx-runtime';
import { run } from '@mdx-js/mdx';

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

  // 2. MDX 컴파일된 코드를 React 컴포넌트로 변환
  const [MDXContent, setMDXContent] = useState<React.ComponentType<{
    components?: unknown;
  }> | null>(null);

  // Fetch markdown data
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

  // Compile and run MDX
  useEffect(() => {
    if (!markdownData) return;

    // @mdx-js/mdx의 run 함수를 사용하여 compiledSource 실행
    // compiledSource는 function body 문자열 (outputFormat: 'function-body')
    // run 함수는 이 코드를 AsyncFunction으로 실행
    run(markdownData.compiledSource, runtime as Parameters<typeof run>[1])
      .then((result) => {
        // result가 없거나 default가 없으면 에러로 처리
        if (!result || !result.default) {
          throw new Error('Invalid MDX result: missing default export');
        }
        // result.default는 MDX 컴포넌트 (React.ComponentType)
        setMDXContent(
          () => result.default as React.ComponentType<{ components?: unknown }>
        );
      })
      .catch((err) => {
        console.error('Failed to render MDX:', err);
        setError(err);
      });
  }, [markdownData]);

  // 3. MDX 컴포넌트 설정
  const components = setMdxComponents();

  // 에러 상태 (우선 체크)
  if (error) {
    return <div>Failed to load content</div>;
  }

  // 로딩 상태
  if (!markdownData || !MDXContent) {
    return <div className="animate-pulse">Loading...</div>;
  }

  // 4. 렌더링
  return <MDXContent components={components} />;
}
