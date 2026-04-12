import { Frontmatter as PostInfo } from "@/1-entities/markdown/model/markdown.schema";

export interface GetPostsProps {
  locale: LocaleType;
  page?: number;
  size?: number;
  tags?: string[];
  /** 제목·태그·summary 클라이언트 검색어 */
  query?: string;
}

export interface GetAvailableTagsProps {
  locale: LocaleType;
}

export interface PagingPosts {
  posts: PostInfo[];
  total: number;
  page: number;
  size: number;
}
