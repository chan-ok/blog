import { Frontmatter as PostInfo } from '@/entities/markdown/model/markdown.schema';
import { api } from '@/shared/config/api';
import { compareDesc } from 'date-fns';

interface GetPostsProps {
  locale: LocaleType;
  page?: number;
  size?: number;
  tags?: string[];
}

interface PagingPosts {
  posts: PostInfo[];
  total: number;
  page: number;
  size: number;
}

export async function getPosts(props: GetPostsProps): Promise<PagingPosts> {
  'use server';
  const { locale, page = 0, size = 10, tags = [] } = props;

  const baseURL = process.env.NEXT_PUBLIC_GIT_RAW_URL;
  const response = await api.get<PostInfo[]>(`/${locale}/index.json`, {
    baseURL,
  });

  if (response.axios.status !== 200) {
    console.error('Failed to fetch posts');
    return {
      posts: [],
      total: 0,
      page,
      size,
    };
  }
  const posts: PostInfo[] = response.data;

  const filteredPosts = posts
    .toSorted((a, b) => compareDesc(a.createdAt, b.createdAt))
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
