import { Link } from "@tanstack/react-router";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

/**
 * 빈 상태를 표시하는 컴포넌트
 * 데이터가 없거나 검색 결과가 없을 때 사용자에게 안내를 제공합니다.
 */
export default function EmptyState({
  icon = "📝",
  title,
  description,
  actionText,
  actionHref,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4" role="img" aria-label={title}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-600 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {actionText && actionHref && (
        <Link
          to={actionHref}
          className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}