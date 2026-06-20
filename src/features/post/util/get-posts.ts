import { api } from '@/shared/api';
import { compareDesc } from 'date-fns';

import { Frontmatter as PostInfo } from '@/entities/markdown/model/model.schema';
import { GetPostsProps, PagingPosts } from '../model/post.schema';

export async function getPosts(props: GetPostsProps): Promise<PagingPosts> {
  const { locale, page = 0, size = 10 } = props;

  // Vite 환경 변수 사용
  const baseURL = import.meta.env.VITE_GIT_RAW_URL;

  if (!baseURL) {
    console.error('VITE_GIT_RAW_URL is not defined');
    return {
      posts: [],
      total: 0,
      page,
      size,
    };
  }

  try {
    // axios 사용 (get-markdown.ts와 일관성 유지)
    const response = await api.get<PostInfo[]>(`/${locale}/index.json`, {
      baseURL, // baseURL을 옵션으로 전달 (axios가 자동으로 조합)
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

    if (!response.data) {
      throw new Error('Failed to fetch posts: empty response');
    }

    let filteredPosts = response.data
      .map((post) => ({
        ...post,
        // 상대 경로인 thumbnail을 절대 URL로 변환
        thumbnail:
          post.thumbnail && !post.thumbnail.startsWith('http')
            ? `${baseURL}/${post.thumbnail}`
            : post.thumbnail,
      }))
      .toSorted((a, b) => compareDesc(a.createdAt, b.createdAt))
      .filter((post) => post.published);

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
