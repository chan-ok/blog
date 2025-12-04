import { LocaleType } from '@/shared/types/common.schema';
import { Post } from '../model/post.schema';

interface GetPostsProps {
  locale: LocaleType;
  page?: number;
  size?: number;
  tags?: string[];
}

interface PagingPosts {
  posts: Post[];
  total: number;
  page: number;
  size: number;
}

export async function getPosts(props: GetPostsProps): Promise<PagingPosts> {
  'use server';
  const { locale, page = 0, size = 10, tags = [] } = props;

  // load from src/features/post/model/{locale}.index.json
  const filePath = `src/features/post/model/${locale}.index.json`;
  const fileContent = await import(filePath);
  const posts = fileContent.default as Post[];

  const filteredPosts = posts
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter((post) => post.published)
    .filter(
      (post) => tags.length === 0 || tags.some((tag) => post.tags.includes(tag))
    );

  const startIndex = page * size;
  const endIndex = Math.min(startIndex + size, filteredPosts.length);
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  return {
    posts: paginatedPosts,
    total: filteredPosts.length,
    page,
    size,
  };
}
