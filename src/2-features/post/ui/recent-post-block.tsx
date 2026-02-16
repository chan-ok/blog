import { use } from 'react';
import { useTranslation } from 'react-i18next';
import { PagingPosts } from '../model/post.schema';
import PostCompactCard from './post-compact-card';

interface RecentPostBlockProps {
  locale: LocaleType;
  postsPromise: Promise<PagingPosts>;
}

export default function RecentPostBlock({
  locale,
  postsPromise,
}: RecentPostBlockProps) {
  const { t } = useTranslation();
  const pagingPosts = use(postsPromise);
  const posts = pagingPosts.posts;

  // 에러가 발생하여 posts가 비어있는 경우 처리
  if (!posts || posts.length === 0) {
    return (
      <div>
        <h2 className="mb-4 text-2xl font-bold">{t('post.recentPosts')}</h2>
        <div className="rounded-lg border border-gray-200 p-6 text-center dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            {t('post.noPosts')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">{t('post.recentPosts')}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <PostCompactCard
            key={post.path.join('/')}
            locale={locale}
            {...post}
          />
        ))}
      </div>
    </div>
  );
}

export function RecentPostBlockSkeleton() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">{t('post.recentPosts')}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="h-96 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 md:h-96" />
        <div className="h-96 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 md:h-96" />
        <div className="h-96 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 md:h-96" />
      </div>
    </div>
  );
}
