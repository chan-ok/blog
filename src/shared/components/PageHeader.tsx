import type { PageHeaderProps } from '../types';

/**
 * 페이지 상단에 표시되는 공통 헤더 컴포넌트
 * 제목과 설명을 일관된 스타일로 표시합니다.
 */
export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
        {children && (
          <div className="flex items-center space-x-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}