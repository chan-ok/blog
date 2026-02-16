import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import { getAllTags } from '@/2-features/post/util/get-all-tags';
import { getPosts } from '@/2-features/post/util/get-posts';
import PostBasicCard from '@/2-features/post/ui/post-basic-card';
import { PostCardListSkeleton } from '@/2-features/post/ui/post-card-list';
import { parseLocale } from '@/5-shared/types/common.schema';

export const Route = createFileRoute('/$locale/tag')({
  component: TagPage,
});

function TagPage() {
  const { locale } = Route.useParams();

  return (
    <Suspense fallback={<PostCardListSkeleton />}>
      <TagPageContent locale={parseLocale(locale)} />
    </Suspense>
  );
}

function TagPageContent({ locale }: { locale: LocaleType }) {
  const { t } = useTranslation();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: allTags } = useSuspenseQuery({
    queryKey: ['tags', locale],
    queryFn: () => getAllTags(locale),
    staleTime: 1000 * 60 * 5,
  });

  const { data: pagingPosts } = useSuspenseQuery({
    queryKey: ['posts', locale, 'tags', selectedTags],
    queryFn: () => getPosts({ locale, tags: selectedTags, size: 100 }),
    staleTime: 1000 * 60 * 5,
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const posts = pagingPosts.posts;

  return (
    <div className="flex flex-col gap-6">
      {/* 태그 목록 */}
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedTags.includes(tag)
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 필터된 포스트 목록 */}
      {posts.length === 0 ? (
        <div className="rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('post.noPosts')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostBasicCard
              key={post.path.join('/')}
              locale={locale}
              {...post}
            />
          ))}
        </div>
      )}
    </div>
  );
}
