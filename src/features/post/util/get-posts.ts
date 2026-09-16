import { compareDesc } from 'date-fns';

import { PostIndexSchema } from '@/entities/markdown/model/model.schema';
import { buildMarkdownUrl } from '@/entities/markdown/util/markdown-path';
import { fetchTextWithLimit, MAX_REMOTE_CONTENT_BYTES } from '@/shared/util/fetch-limited';
import { GetPostsProps, PagingPosts } from '../model/post.schema';
import { resolveContentUrl } from '@/shared/util/content-url';
import { isPostVisible } from './post-visibility';

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
    const indexUrl = buildMarkdownUrl(`${locale}/index.json`, baseURL);
    const response = await fetchTextWithLimit(indexUrl, MAX_REMOTE_CONTENT_BYTES);

    if (response.status !== 200) {
      console.error('Failed to fetch posts');
      return {
        posts: [],
        total: 0,
        page,
        size,
      };
    }

    if (!response.text) {
      throw new Error('Failed to fetch posts: empty response');
    }

    const posts = PostIndexSchema.parse(JSON.parse(response.text));
    const filteredPosts = posts
      .map((post) => ({
        ...post,
        thumbnail: post.thumbnail ? resolveContentUrl(post.thumbnail, baseURL) : undefined,
      }))
      .toSorted((a, b) => compareDesc(a.createdAt, b.createdAt))
      .filter((post) =>
        isPostVisible(post, {
          isProduction: import.meta.env.PROD,
          surface: 'list',
        })
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
