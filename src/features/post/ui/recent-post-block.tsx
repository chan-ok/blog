'use client';

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

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Recent Posts</h2>
      <div className="flex flex-col gap-4">
        {posts.length > 0 ? (
          posts.map((post, i) => {
            if (i === 0) {
              return (
                <PostBasicCard key={post.title} locale={locale} {...post} />
              );
            } else {
              return (
                <PostSimpleCard key={post.title} locale={locale} {...post} />
              );
            }
          })
        ) : (
          <div>No posts found</div>
        )}
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
