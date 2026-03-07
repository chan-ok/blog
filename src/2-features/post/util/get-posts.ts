import { api } from '@/5-shared/config/api';
import { compareDesc } from 'date-fns';

import { Frontmatter as PostInfo } from '@/1-entities/markdown/model/markdown.schema';
import {
  GetAvailableTagsProps,
  GetPostsProps,
  PagingPosts,
} from '../model/post.schema';

/** index.json 항목에서 tags만 추출하기 위한 최소 타입 */
interface IndexItem {
  published?: boolean;
  tags?: string[];
}

export async function getPosts(props: GetPostsProps): Promise<PagingPosts> {
  const { locale, page = 0, size = 10, tags = [] } = props;

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

    const filteredPosts = response.data
      .map((post) => ({
        ...post,
        // 상대 경로인 thumbnail을 절대 URL로 변환
        thumbnail:
          post.thumbnail && !post.thumbnail.startsWith('http')
            ? `${baseURL}/${post.thumbnail}`
            : post.thumbnail,
      }))
      .toSorted((a, b) => compareDesc(a.createdAt, b.createdAt))
      .filter((post) => post.published)
      .filter(
        (post) =>
          tags.length === 0 ||
          tags.some((tag) => (post.tags ?? []).includes(tag))
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

/**
 * locale에 해당하는 index.json에서 published 포스트의 태그를 모아
 * 중복 제거 후 정렬된 배열로 반환합니다.
 */
function hasValidBaseURL(url: unknown): url is string {
  return (
    typeof url === 'string' && url.trim().length > 0 && url !== 'undefined'
  );
}

export async function getAvailableTags(
  props: GetAvailableTagsProps
): Promise<string[]> {
  const { locale } = props;
  const baseURL = import.meta.env.VITE_GIT_RAW_URL;

  if (!hasValidBaseURL(baseURL)) {
    console.error('VITE_GIT_RAW_URL is not defined');
    return [];
  }

  try {
    const response = await api.get<IndexItem[]>(`/${locale}/index.json`, {
      baseURL,
    });

    if (response.axios.status !== 200 || !response.data) {
      return [];
    }

    const tags = response.data
      .filter((post) => post.published)
      .flatMap((post) => post.tags ?? [])
      .filter(
        (tag): tag is string => typeof tag === 'string' && tag.length > 0
      );

    return [...new Set(tags)].toSorted((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error('Failed to fetch available tags:', error);
    return [];
  }
}
