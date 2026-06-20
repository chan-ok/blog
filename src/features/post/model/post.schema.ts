import { Frontmatter as PostInfo } from '@/entities/markdown/model/markdown.schema';
import type { LocaleType } from '@/shared/types/common.schema';

export interface GetPostsProps {
  locale: LocaleType;
  page?: number;
  size?: number;
}

export interface PagingPosts {
  posts: PostInfo[];
  total: number;
  page: number;
  size: number;
}
