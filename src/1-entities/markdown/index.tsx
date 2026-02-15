import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, RotateCcw } from 'lucide-react';

import getMarkdown from './util/get-markdown';
import setMdxComponents from './util/set-md-components';

interface MDComponentProps {
  path: string;
  baseUrl?: string;
  onParseStatus?: (status: 'loading' | 'success' | 'error') => void;
}

export default function MDComponent({ path, baseUrl, onParseStatus }: MDComponentProps) {
  const { t } = useTranslation();

  // 상태: MDX 데이터
  const [data, setData] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MDXContent: React.ComponentType<{ components?: any }>;
    frontmatter: unknown;
  } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // 파생 값: MDX 컴포넌트 설정
  const components = useMemo(
    () => setMdxComponents(undefined, baseUrl, path),
    [baseUrl, path]
  );

  // 이펙트: 마크다운 페칭 및 evaluate
  useEffect(() => {
    setError(null);
    setData(null);
    onParseStatus?.('loading');

    getMarkdown(path, baseUrl)
      .then((result) => {
        setData({
          MDXContent: result.MDXContent,
          frontmatter: result.frontmatter,
        });
        onParseStatus?.('success');
      })
      .catch((err) => {
        setError(err);
        onParseStatus?.('error');
        console.error('Failed to fetch markdown:', err);
      });
  }, [path, baseUrl, onParseStatus]);

  // 이벤트 핸들러: 재시도
  const handleRetry = async () => {
    setError(null);
    setData(null);
    onParseStatus?.('loading');
    try {
      const result = await getMarkdown(path, baseUrl);
      setData({
        MDXContent: result.MDXContent,
        frontmatter: result.frontmatter,
      });
      onParseStatus?.('success');
    } catch (err) {
      setError(err as Error);
      onParseStatus?.('error');
    }
  };

  // 렌더링: 에러 상태
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

  // 렌더링: 로딩 상태
  if (!data) {
    return (
      <div className="flex items-center justify-center gap-2 p-8 text-gray-600 dark:text-gray-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-400" />
        <span>{t('markdown.loading')}</span>
      </div>
    );
  }

  // 렌더링: 성공
  return <data.MDXContent components={components} />;
}
