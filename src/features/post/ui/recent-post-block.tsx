import { Suspense } from 'react';
import { getPosts } from '../util/get-posts';
import PostBasicCard from './post-basic-card';
import PostSimpleCard from './post-simple-card';

interface PostCardListProps {
  locale: LocaleType;
}

export default async function RecentPostBlock({ locale }: PostCardListProps) {
  const pagingPosts = await getPosts({ locale, size: 3 });
  const posts = pagingPosts.posts;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <h2 className="mb-4 text-2xl font-bold">Recent Posts</h2>
        <div className="flex flex-col gap-4">
          {posts.length > 0 ? (
            posts.map((post, i) => {
              if (i === 0) {
                return <PostBasicCard key={post.id} {...post} />;
              } else {
                return <PostSimpleCard key={post.id} {...post} />;
              }
            })
          ) : (
            <div>No posts found</div>
          )}
        </div>
      </div>
    </Suspense>
  );
}
