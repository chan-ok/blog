import { Link } from "@tanstack/react-router";
import type { TagBadgeProps, Tag } from '../types';

/**
 * 태그를 배지 형태로 표시하는 재사용 가능한 컴포넌트
 * 크기와 스타일을 커스터마이징할 수 있습니다.
 */
export default function TagBadge({
  tag,
  size = 'md',
  variant = 'default',
  className = ""
}: TagBadgeProps) {
  // tag가 문자열인지 Tag 객체인지 확인
  const tagName = typeof tag === 'string' ? tag : tag.name;
  const tagColor = typeof tag === 'string' ? 'gray' : (tag.color || 'gray');

  // 크기에 따른 클래스
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  // 색상에 따른 클래스 (Tailwind의 색상 팔레트 사용)
  const colorClasses = {
    blue: variant === 'outline'
      ? 'border-blue-300 text-blue-700 hover:bg-blue-50'
      : 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    green: variant === 'outline'
      ? 'border-green-300 text-green-700 hover:bg-green-50'
      : 'bg-green-100 text-green-800 hover:bg-green-200',
    yellow: variant === 'outline'
      ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    purple: variant === 'outline'
      ? 'border-purple-300 text-purple-700 hover:bg-purple-50'
      : 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    gray: variant === 'outline'
      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    red: variant === 'outline'
      ? 'border-red-300 text-red-700 hover:bg-red-50'
      : 'bg-red-100 text-red-800 hover:bg-red-200',
    indigo: variant === 'outline'
      ? 'border-indigo-300 text-indigo-700 hover:bg-indigo-50'
      : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    pink: variant === 'outline'
      ? 'border-pink-300 text-pink-700 hover:bg-pink-50'
      : 'bg-pink-100 text-pink-800 hover:bg-pink-200',
    orange: variant === 'outline'
      ? 'border-orange-300 text-orange-700 hover:bg-orange-50'
      : 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    teal: variant === 'outline'
      ? 'border-teal-300 text-teal-700 hover:bg-teal-50'
      : 'bg-teal-100 text-teal-800 hover:bg-teal-200',
  };

  const baseClasses = `
    inline-block font-medium rounded transition-colors
    ${variant === 'outline' ? 'border bg-white' : ''}
    ${sizeClasses[size]}
    ${colorClasses[tagColor as keyof typeof colorClasses] || colorClasses.gray}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <Link
      to="/tags/$tagName"
      params={{ tagName }}
      className={baseClasses}
      title={typeof tag === 'object' && tag.description ? tag.description : `${tagName} 태그 글 보기`}
    >
      {tagName}
      {typeof tag === 'object' && tag.postCount !== undefined && (
        <span className="ml-1 opacity-75">({tag.postCount})</span>
      )}
    </Link>
  );
}