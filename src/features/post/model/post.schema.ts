import { Frontmatter as PostInfo } from '@/entities/markdown/model/model.schema';

import { LocaleType } from '@/shared/locale/types';

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
