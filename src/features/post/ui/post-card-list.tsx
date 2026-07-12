import { use } from 'react';
import { useTranslation } from 'react-i18next';

import PostCard from '@/features/post/ui/post-card';
import { LocaleType } from '@/shared/locale/types';

import type { PagingPosts } from '../model/post.schema';

interface PostCardListProps {
  locale: LocaleType;
  postsPromise: Promise<PagingPosts>;
}

export default function PostCardList({ locale, postsPromise }: PostCardListProps) {
  const { t } = useTranslation();

  const pagingPosts = use(postsPromise);
  const posts = pagingPosts.posts;

  if (!posts || posts.length === 0) {
    return <p className="text-ink3 text-sm py-8 text-center">{t('post.noPosts')}</p>;
  }

  return (
    <ol className="divide-y divide-rule">
      {posts.map((post, idx) => (
        <PostCard key={post.path.join('/')} index={idx + 1} locale={locale} {...post} />
      ))}
    </ol>
  );
}

export function PostCardListSkeleton() {
  return (
    <ol className="divide-y divide-rule">
      {[...Array(5)].map((_, i) => (
        <li key={i} className="flex gap-3 py-4">
          <div className="w-4 h-3 bg-bg2 rounded animate-pulse" />
          <div className="flex-1 h-4 bg-bg2 rounded animate-pulse" />
          <div className="w-12 h-3 bg-bg2 rounded animate-pulse" />
        </li>
      ))}
    </ol>
  );
}
