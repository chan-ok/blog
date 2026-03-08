import { useTranslation } from 'react-i18next';

import Link from '@/5-shared/components/ui/link';

interface TagFilterBarProps {
  locale: string;
  availableTags: string[];
  selectedTags: string[];
}

/**
 * 포스트 목록 상단 태그 필터 메뉴 바.
 * "전체" 링크와 각 태그 링크를 표시하며, 선택된 태그는 강조합니다.
 */
export default function TagFilterBar({
  locale,
  availableTags,
  selectedTags,
}: TagFilterBarProps) {
  const { t } = useTranslation();

  const buildTagHref = (tag: string) => {
    const isSelected = selectedTags.includes(tag);
    const newTags = isSelected
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    if (newTags.length === 0) {
      return `/${locale}/posts`;
    }
    return `/${locale}/posts?tags=${newTags.map(encodeURIComponent).join(',')}`;
  };

  return (
    <nav
      className="mb-6 flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4 dark:border-gray-700"
      aria-label={t('post.tags')}
    >
      <Link
        href={`/${locale}/posts`}
        className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
          selectedTags.length === 0
            ? 'bg-zinc-200 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-medium'
            : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600'
        }`}
        aria-current={selectedTags.length === 0 ? 'true' : undefined}
      >
        {t('post.filterAll')}
      </Link>
      {availableTags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <Link
            key={tag}
            href={buildTagHref(tag)}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
              isSelected
                ? 'bg-zinc-200 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-medium'
                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600'
            }`}
            aria-current={isSelected ? 'true' : undefined}
            aria-label={`태그: ${tag}`}
          >
            {tag}
          </Link>
        );
      })}
    </nav>
  );
}
