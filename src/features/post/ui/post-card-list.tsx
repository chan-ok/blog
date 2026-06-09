import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import type { LocaleType } from '@/shared/types/common.schema';
import PostCard from '@/features/post/ui/post-card';
import { getPosts } from '../util/get-posts';

interface PostCardListProps {
  locale: LocaleType;
  tags?: string[];
  query?: string;
}

export default function PostCardList({ locale, tags = [], query = '' }: PostCardListProps) {
  const { t } = useTranslation();

  const { data: pagingPosts } = useSuspenseQuery({
    queryKey: ['posts', locale, tags, query],
    queryFn: () => getPosts({ locale, tags, query }),
    retry: 3,
    staleTime: 1000 * 60 * 5,
  });

  const posts = pagingPosts.posts;

  if (!posts || posts.length === 0) {
    return (
      <p className="text-ink3 text-sm py-8 text-center">
        {query ? t('post.noSearchResults') : t('post.noPosts')}
      </p>
    );
  }

  return (
    <ol>
      {posts.map((post, idx) => (
        <PostCard key={post.path.join('/')} index={idx + 1} locale={locale} {...post} />
      ))}
    </ol>
  );
}

export function PostCardListSkeleton() {
  return (
    <ol>
      {[...Array(5)].map((_, i) => (
        <li key={i} className="flex gap-3 py-4 border-b border-rule">
          <div className="w-4 h-3 bg-bg2 rounded animate-pulse" />
          <div className="flex-1 h-4 bg-bg2 rounded animate-pulse" />
          <div className="w-12 h-3 bg-bg2 rounded animate-pulse" />
        </li>
      ))}
    </ol>
  );
}
