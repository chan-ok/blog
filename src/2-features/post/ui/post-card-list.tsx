import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import type { LocaleType } from '@/5-shared/types/common.schema';
import PostCard from '@/2-features/post/ui/post-card';
import { getPosts } from '../util/get-posts';

interface PostCardListProps {
  locale: LocaleType;
  /** 태그 필터 (페이지에서 search params 파싱 후 전달). FSD 준수를 위해 feature는 route를 import하지 않음 */
  tags?: string[];
}

export default function PostCardList({ locale, tags = [] }: PostCardListProps) {
  const { t } = useTranslation();

  // useSuspenseQuery로 데이터 가져오기
  const { data: pagingPosts } = useSuspenseQuery({
    queryKey: ['posts', locale, tags],
    queryFn: () => getPosts({ locale, tags }),
    retry: 3, // 최대 3회 재시도
    staleTime: 1000 * 60 * 5, // 5분간 캐시
  });

  const posts = pagingPosts.posts;

  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {t('post.noPosts')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard
          key={post.path.join('/')}
          variant="basic"
          locale={locale}
          {...post}
        />
      ))}
    </div>
  );
}

export function PostCardListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}
