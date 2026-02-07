import { compareDesc } from 'date-fns';

import { Frontmatter as PostInfo } from '@/entities/markdown/model/markdown.schema';
import { GetPostsProps, PagingPosts } from '../model/post.schema';

export async function getPosts(props: GetPostsProps): Promise<PagingPosts> {
  const { locale, page = 0, size = 10, tags = [] } = props;

  // Vite 환경 변수 사용
  const baseURL = import.meta.env.VITE_GIT_RAW_URL;

  try {
    const response = await fetch(`${baseURL}/${locale}/index.json`, {
      // Vite는 'next' 옵션 없음 - 일반 fetch 사용
    });

    if (!response.ok) {
      console.error('Failed to fetch posts');
      return {
        posts: [],
        total: 0,
        page,
        size,
      };
    }

    const data: PostInfo[] = await response.json();
    const filteredPosts = data
      .toSorted((a, b) => compareDesc(a.createdAt, b.createdAt))
      .filter((post) => post.published)
      .filter(
        (post) =>
          tags.length === 0 || tags.some((tag) => post.tags.includes(tag))
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
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return {
      posts: [],
      total: 0,
      page,
      size,
    };
  }
}
