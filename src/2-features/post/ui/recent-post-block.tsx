import { use } from 'react';
import { useTranslation } from 'react-i18next';
import { format, isValid } from 'date-fns';

import Link from '@/5-shared/components/ui/link';
import type { LocaleType } from '@/5-shared/types/common.schema';
import { PagingPosts } from '../model/post.schema';

interface RecentPostBlockProps {
  locale: LocaleType;
  postsPromise: Promise<PagingPosts>;
}

export default function RecentPostBlock({ locale, postsPromise }: RecentPostBlockProps) {
  const { t } = useTranslation();
  const pagingPosts = use(postsPromise);
  const posts = pagingPosts.posts;

  if (!posts || posts.length === 0) {
    return (
      <div>
        <p className="text-[9px] tracking-[4px] uppercase text-ink3 mb-5">
          {t('post.recentPosts')}
        </p>
        <p className="text-ink3 text-sm">{t('post.noPosts')}</p>
      </div>
    );
  }

  return (
    <div>
      {/* 구분선 */}
      <hr className="border-t border-rule mb-8" />

      {/* 레이블 */}
      <p className="text-[9px] tracking-[4px] uppercase text-ink3 mb-5">{t('post.recentPosts')}</p>

      {/* 목차형 목록 */}
      <ol>
        {posts.map((post, idx) => {
          const date =
            post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt as string);
          const formattedDate = isValid(date) ? format(date, 'yyyy.MM') : '—';
          const href = `/${locale}/posts/${post.path.join('/')}`;
          const num = String(idx + 1).padStart(2, '0');

          return (
            <li
              key={post.path.join('/')}
              className="flex items-baseline gap-3 py-4 border-b border-rule first:border-t"
            >
              <span className="text-[9px] text-ink3 min-w-[18px] shrink-0">{num}</span>
              <Link href={href} className="flex-1 group">
                <span className="block text-[15px] font-semibold text-ink leading-[1.35] mb-1 group-hover:underline underline-offset-2">
                  {post.title}
                </span>
                {post.tags && post.tags.length > 0 && (
                  <span className="text-[10px] text-ink3">{post.tags.join(' · ')}</span>
                )}
              </Link>
              <span className="text-[10px] text-ink3 shrink-0 tabular-nums">{formattedDate}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function RecentPostBlockSkeleton() {
  return (
    <div>
      <hr className="border-t border-rule mb-8" />
      <div className="h-3 w-24 bg-bg2 rounded mb-5 animate-pulse" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-3 py-4 border-b border-rule first:border-t">
          <div className="w-4 h-3 bg-bg2 rounded animate-pulse" />
          <div className="flex-1 h-4 bg-bg2 rounded animate-pulse" />
          <div className="w-12 h-3 bg-bg2 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
