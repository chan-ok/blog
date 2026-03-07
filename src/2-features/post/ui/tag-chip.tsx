import Link from '@/5-shared/components/ui/link';

interface TagChipProps {
  tag: string;
  locale: string;
}

/**
 * TagChip 컴포넌트
 *
 * 태그를 칩 형태로 표시하고, 클릭 시 해당 태그로 필터된 포스트 목록으로 이동합니다.
 */
export default function TagChip({ tag, locale }: TagChipProps) {
  const href = `/${locale}/posts?tags=${encodeURIComponent(tag)}`;

  return (
    <Link
      href={href}
      className="rounded-full px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
      aria-label={`태그: ${tag}`}
    >
      {tag}
    </Link>
  );
}
