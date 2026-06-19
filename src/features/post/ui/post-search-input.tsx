import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';

interface PostSearchInputProps {
  locale: string;
  initialValue?: string;
  selectedTags?: string[];
}

/**
 * 포스트 검색 입력창.
 * 입력 후 300ms debounce로 URL ?q= 파라미터를 업데이트한다.
 * 태그 필터(tags=)와 함께 동작한다.
 */
export default function PostSearchInput({
  locale,
  initialValue = '',
  selectedTags = [],
}: PostSearchInputProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [value, setValue] = useState(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // URL 파라미터와 로컬 상태 동기화
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const updateUrl = useCallback(
    (q: string) => {
      const searchParams = new URLSearchParams();
      if (selectedTags.length > 0) {
        searchParams.set('tags', selectedTags.map(encodeURIComponent).join(','));
      }
      if (q.trim()) {
        searchParams.set('q', q.trim());
      }
      const search = searchParams.toString();
      const href = `/${locale}/posts${search ? `?${search}` : ''}`;
      navigate({ to: href, replace: true });
    },
    [locale, navigate, selectedTags]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      updateUrl(newValue);
    }, 300);
  };

  const handleClear = () => {
    setValue('');
    if (timerRef.current) clearTimeout(timerRef.current);
    updateUrl('');
  };

  return (
    <div className="relative mb-4">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3 pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={t('post.searchPlaceholder')}
        className="w-full h-9 rounded-md border border-rule bg-bg pl-8 pr-8 text-[13px] text-ink placeholder:text-ink3 transition-colors focus:border-accent focus:outline-2 focus:-outline-offset-1 focus:outline-accent-strong"
        aria-label={t('post.searchPlaceholder')}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink3 transition-colors hover:text-ink"
          aria-label="검색어 지우기"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
