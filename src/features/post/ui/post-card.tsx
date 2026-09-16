import { format, isValid } from 'date-fns';

import Link from '@/shared/components/ui/link';
import { LocaleType } from '@/shared/locale/types';

import type { Frontmatter } from '@/entities/markdown/model/model.schema';

interface PostCardProps extends Frontmatter {
  locale: LocaleType;
  /** 목록에서의 순번 (1부터 시작) */
  index: number;
}

/**
 * TOC(목차) 형태의 포스트 행 컴포넌트.
 * 번호 · 제목 · 날짜를 한 행에 표시한다.
 */
export default function PostCard({ title, path, createdAt, locale, index }: PostCardProps) {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt as string);
  const formattedDate = isValid(date) ? format(date, 'yyyy.MM') : '-';
  const href = `/${locale}/posts/${path.join('/')}`;
  const num = String(index).padStart(2, '0');

  return (
    <li className="py-5">
      <div className="flex items-start justify-between gap-5">
        <span className="mt-1.5 min-w-9 shrink-0 text-[11px] text-ink3 tabular-nums">{num}</span>
        <Link href={href} className="group block min-w-0 flex-1">
          <span className="text-[16px] leading-[1.45] font-semibold text-ink transition-colors group-hover:text-ink2">
            {title}
          </span>
        </Link>
        <time className="text-[11px] text-ink3 shrink-0 tabular-nums">{formattedDate}</time>
      </div>
    </li>
  );
}
