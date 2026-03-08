import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import type { MDXComponents } from 'mdx/types';

import getMarkdown, { type MarkdownFrontmatter } from './util/get-markdown';
import setMdxComponents from './util/set-md-components';

export type { MarkdownFrontmatter } from './util/get-markdown';

interface MDComponentProps {
  path: string;
  baseUrl?: string;
  onParseStatus?: (status: 'loading' | 'success' | 'error') => void;
  onFrontmatterLoaded?: (frontmatter: MarkdownFrontmatter) => void;
  components?: MDXComponents;
}

export default function MDComponent({
  path,
  baseUrl,
  onParseStatus,
  onFrontmatterLoaded,
  components: customComponents,
}: MDComponentProps) {
  const { t } = useTranslation();

  // 파생 값: MDX 컴포넌트 설정 (customComponents로 기본값 오버라이드 가능)
  const components = useMemo(
    () => setMdxComponents(customComponents, baseUrl, path),
    [customComponents, baseUrl, path]
  );

  // TanStack Query로 마크다운 페칭 및 evaluate
  // retry/staleTime은 __root.tsx QueryClient 전역 기본값 사용
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['markdown', path, baseUrl],
    queryFn: () => getMarkdown(path, baseUrl),
  });

  // 콜백: 쿼리 상태 변화를 상위 컴포넌트에 전달
  useEffect(() => {
    if (isLoading) {
      onParseStatus?.('loading');
    } else if (error) {
      onParseStatus?.('error');
      console.error('Failed to fetch markdown:', error);
    } else if (data) {
      onParseStatus?.('success');
      onFrontmatterLoaded?.(data.frontmatter);
    }
  }, [isLoading, error, data, onParseStatus, onFrontmatterLoaded]);

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
          onClick={() => refetch()}
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
  if (isLoading || !data) {
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
