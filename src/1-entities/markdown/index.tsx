import { useState, useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import * as runtime from 'react/jsx-runtime';
import { run } from '@mdx-js/mdx';
import { AlertCircle, RotateCcw } from 'lucide-react';

import getMarkdown from './util/get-markdown';
import setMdxComponents from './util/set-md-components';

interface MDComponentProps {
  path: string;
  baseUrl?: string;
}

export default function MDComponent({ path, baseUrl }: MDComponentProps) {
  const router = useRouter();
  const { t } = useTranslation();

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

  // 재시도 핸들러
  const handleRetry = async () => {
    // 기존 상태 초기화
    setError(null);
    setMarkdownData(null);
    setMDXContent(null);

    try {
      // markdown을 다시 fetch
      const data = await getMarkdown(path, baseUrl, router);
      setMarkdownData(data);
    } catch (err) {
      // fetch 실패 시 에러 상태 복구
      setError(err as Error);
    }
  };

  // 에러 상태 (우선 체크)
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
        <AlertCircle
          size={48}
          className="text-red-600 dark:text-red-400"
          aria-hidden="true"
        />
        <p className="text-lg font-medium text-red-900 dark:text-red-100">
          {t('markdown.loadError')}
        </p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:bg-red-500 dark:hover:bg-red-600"
          aria-label={t('markdown.retry')}
        >
          <RotateCcw size={16} aria-hidden="true" />
          {t('markdown.retry')}
        </button>
      </div>
    );
  }

  // 로딩 상태
  if (!markdownData || !MDXContent) {
    return (
      <div className="flex items-center justify-center gap-2 p-8 text-gray-600 dark:text-gray-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-400" />
        <span>{t('markdown.loading')}</span>
      </div>
    );
  }

  // 4. 렌더링
  return <MDXContent components={components} />;
}
