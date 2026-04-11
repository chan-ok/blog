import Link from '@/5-shared/components/ui/link';

interface TagChipProps {
  tag: string;
  locale: string;
}

/**
 * TagChip: 사각형 테두리만 있는 모노크롬 태그 칩.
 */
export default function TagChip({ tag, locale }: TagChipProps) {
  const href = `/${locale}/posts?tags=${encodeURIComponent(tag)}`;

  return (
    <Link
      href={href}
      className="border border-rule text-[9px] text-ink3 px-2 py-0.5 hover:border-ink hover:text-ink transition-colors duration-150"
      aria-label={`태그: ${tag}`}
    >
      {tag}
    </Link>
  );
}
