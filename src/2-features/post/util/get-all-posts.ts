import { api } from "@/5-shared/config/api";
import { compareDesc } from "date-fns";

import { Frontmatter as PostInfo } from "@/1-entities/markdown/model/markdown.schema";
import type { LocaleType } from "@/5-shared/types/common.schema";
import { isProduction, hasDevOnlyTag } from "./get-posts";

/** 네비게이션용 전체 포스트 목록 (필터 없이 날짜 내림차순) */
export async function getAllPosts(locale: LocaleType): Promise<PostInfo[]> {
  const baseURL = import.meta.env.VITE_GIT_RAW_URL;

  if (!baseURL) {
    return [];
  }

  try {
    const response = await api.get<PostInfo[]>(`/${locale}/index.json`, {
      baseURL,
    });

    if (response.axios.status !== 200 || !response.data) {
      return [];
    }

    let posts = response.data
      .toSorted((a, b) => compareDesc(a.createdAt, b.createdAt))
      .filter((post) => post.published);

    if (isProduction()) {
      posts = posts.filter((post) => !hasDevOnlyTag(post.tags ?? []));
    }

    return posts;
  } catch {
    return [];
  }
}
