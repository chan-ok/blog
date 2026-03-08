import { api } from '@/5-shared/config/api';
import { compareAsc } from 'date-fns';

import { Frontmatter as PostInfo } from '@/1-entities/markdown/model/markdown.schema';
import { isProduction, hasDevOnlyTag } from './get-posts';

export interface GetSeriesPostsProps {
  locale: string;
  series: string;
}

/**
 * 동일 시리즈에 속하는 포스트 목록을 가져옵니다.
 * - published 포스트만 반환
 * - 프로덕션에서는 test/draft 태그 포스트 제외
 * - createdAt 오름차순 정렬 (시리즈 순서대로)
 */
export async function getSeriesPosts(
  props: GetSeriesPostsProps
): Promise<PostInfo[]> {
  const { locale, series } = props;

  const baseURL = import.meta.env.VITE_GIT_RAW_URL;

  if (!baseURL) {
    console.error('VITE_GIT_RAW_URL is not defined');
    return [];
  }

  try {
    const response = await api.get<PostInfo[]>(`/${locale}/index.json`, {
      baseURL,
    });

    if (response.axios.status !== 200 || !response.data) {
      console.error('Failed to fetch posts for series');
      return [];
    }

    let filteredPosts = response.data
      .filter((post) => post.published)
      .filter((post) => post.series === series);

    // 프로덕션에서는 test/draft 태그가 있는 포스트 제외
    if (isProduction()) {
      filteredPosts = filteredPosts.filter(
        (post) => !hasDevOnlyTag(post.tags ?? [])
      );
    }

    // createdAt 오름차순 정렬 (시리즈 첫 글부터 순서대로)
    return filteredPosts.toSorted((a, b) =>
      compareAsc(new Date(a.createdAt), new Date(b.createdAt))
    );
  } catch (error) {
    console.error('Failed to fetch series posts:', error);
    return [];
  }
}
