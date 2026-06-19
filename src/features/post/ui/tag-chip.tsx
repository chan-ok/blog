import Link from '@/shared/components/ui/link';

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
      className="rounded-md border border-rule bg-bg px-2 py-0.5 text-[9px] text-ink3 transition-colors duration-150 hover:border-accent hover:bg-accent-soft hover:text-ink"
      aria-label={`태그: ${tag}`}
    >
      {tag}
    </Link>
  );
}
