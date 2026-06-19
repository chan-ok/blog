import { format, isValid } from 'date-fns';

import Link from '@/shared/components/ui/link';
import type { Frontmatter } from '@/entities/markdown/model/markdown.schema';
import type { LocaleType } from '@/shared/types/common.schema';

interface PostCardProps extends Frontmatter {
  locale: LocaleType;
  /** 목록에서의 순번 (1부터 시작) */
  index: number;
}

/**
 * TOC(목차) 형태의 포스트 행 컴포넌트.
 * 번호 · 제목+태그 · 날짜를 한 행에 표시한다.
 */
export default function PostCard({ title, path, createdAt, tags, locale, index }: PostCardProps) {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt as string);
  const formattedDate = isValid(date) ? format(date, 'yyyy.MM') : '—';
  const href = `/${locale}/posts/${path.join('/')}`;
  const num = String(index).padStart(2, '0');

  return (
    <li className="flex items-baseline gap-3 py-4 border-b border-rule">
      <span className="text-[9px] text-ink3 min-w-[18px] shrink-0">{num}</span>
      <Link href={href} className="flex-1 group">
        <span className="block text-[16px] font-semibold text-ink leading-[1.45] mb-1 group-hover:underline underline-offset-2">
          {title}
        </span>
        {tags && tags.length > 0 && (
          <span className="text-[10px] text-ink3">{tags.join(' · ')}</span>
        )}
      </Link>
      <span className="text-[10px] text-ink3 shrink-0 tabular-nums">{formattedDate}</span>
    </li>
  );
}
