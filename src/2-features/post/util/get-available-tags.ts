import { api } from '@/5-shared/config/api';

import { GetAvailableTagsProps } from '../model/post.schema';
import { isProduction, hasDevOnlyTag } from './get-posts';

/** index.json 항목에서 tags만 추출하기 위한 최소 타입 */
interface IndexItem {
  published?: boolean;
  tags?: string[];
}

function hasValidBaseURL(url: unknown): url is string {
  return (
    typeof url === 'string' && url.trim().length > 0 && url !== 'undefined'
  );
}

/**
 * locale에 해당하는 index.json에서 published 포스트의 태그를 모아
 * 중복 제거 후 정렬된 배열로 반환합니다.
 */
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

    let posts = response.data.filter((post) => post.published);
    // 프로덕션에서는 test/draft 태그가 있는 포스트 제외 후 태그 수집 (목록과 동일한 노출 기준)
    if (isProduction()) {
      posts = posts.filter((post) => !hasDevOnlyTag(post.tags ?? []));
    }

    const tags = posts
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
