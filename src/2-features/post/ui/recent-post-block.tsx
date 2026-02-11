import { use } from 'react';
import { PagingPosts } from '../model/post.schema';
import PostBasicCard from './post-basic-card';
import PostSimpleCard from './post-simple-card';

interface RecentPostBlockProps {
  locale: LocaleType;
  postsPromise: Promise<PagingPosts>;
}

export default function RecentPostBlock({
  locale,
  postsPromise,
}: RecentPostBlockProps) {
  const pagingPosts = use(postsPromise);
  const posts = pagingPosts.posts;

  // 에러가 발생하여 posts가 비어있는 경우 처리
  if (!posts || posts.length === 0) {
    return (
      <div>
        <h2 className="mb-4 text-2xl font-bold">Recent Posts</h2>
        <div className="rounded-lg border border-gray-200 p-6 text-center dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            No posts found. Please check your content repository.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Recent Posts</h2>
      <div className="flex flex-col gap-4">
        {posts.map((post, i) => {
          if (i === 0) {
            return (
              <PostBasicCard
                key={post.path.join('/')}
                locale={locale}
                {...post}
              />
            );
          } else {
            return (
              <PostSimpleCard
                key={post.path.join('/')}
                locale={locale}
                {...post}
              />
            );
          }
        })}
      </div>
    </div>
  );
}

export function RecentPostBlockSkeleton() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Recent Posts</h2>
      <div className="flex flex-col gap-4">
        <div className="h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
