import { useTranslation } from 'react-i18next';

import Button from '@/5-shared/components/ui/button';

export interface ErrorPageProps {
  statusCode: 403 | 404 | 500;
  title?: string;
  description?: string;
  onRetry?: () => void;
  onGoHome: () => void;
}

// 각 에러 코드별 기본 메시지
const defaultMessages = {
  404: {
    title: 'Page Not Found',
    description: "The page you're looking for doesn't exist or has been moved.",
  },
  403: {
    title: 'Access Denied',
    description: "You don't have permission to access this page.",
  },
  500: {
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred. Please try again later.',
  },
} as const;

// 상태 코드별 색상 매핑
const statusCodeColors = {
  404: 'text-amber-500',
  403: 'text-red-500',
  500: 'text-rose-500',
} as const;

export function ErrorPage({
  statusCode,
  title,
  description,
  onRetry,
  onGoHome,
}: ErrorPageProps) {
  const { t } = useTranslation();

  // i18n 키 매핑
  const i18nKeys = {
    404: {
      title: 'error.notFound',
      description: 'error.notFoundDesc',
    },
    403: {
      title: 'error.forbidden',
      description: 'error.forbiddenDesc',
    },
    500: {
      title: 'error.serverError',
      description: 'error.serverErrorDesc',
    },
  };

  // title과 description 우선순위: props > i18n > 기본값
  const displayTitle =
    title || t(i18nKeys[statusCode].title, defaultMessages[statusCode].title);
  const displayDescription =
    description ||
    t(
      i18nKeys[statusCode].description,
      defaultMessages[statusCode].description
    );

  return (
    <div
      className="flex flex-col min-h-[60vh] items-center justify-center gap-6 px-6 py-12"
      role="alert"
      aria-label={`Error ${statusCode}: ${displayTitle}`}
    >
      {/* 상태 코드 */}
      <h1
        className={`text-8xl font-bold ${statusCodeColors[statusCode]} transition-colors duration-200`}
        aria-hidden="true"
      >
        {statusCode}
      </h1>

      {/* 제목 */}
      <h2 className="text-2xl font-semibold text-gray-900 transition-colors duration-200 dark:text-gray-100">
        {displayTitle}
      </h2>

      {/* 설명 */}
      <p className="max-w-md text-center text-gray-600 transition-colors duration-200 dark:text-gray-400">
        {displayDescription}
      </p>

      {/* 버튼 영역 */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
        <Button
          variant="primary"
          onClick={onGoHome}
          aria-label={t('error.goHome', 'Go Home')}
        >
          {t('error.goHome', 'Go Home')}
        </Button>

        {onRetry && (
          <Button
            variant="default"
            onClick={onRetry}
            aria-label={t('error.retry', 'Try Again')}
          >
            {t('error.retry', 'Try Again')}
          </Button>
        )}
      </div>
    </div>
  );
}
