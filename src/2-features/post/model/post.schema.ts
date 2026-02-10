import { Frontmatter as PostInfo } from '@/1-entities/markdown/model/markdown.schema';

export interface GetPostsProps {
  locale: LocaleType;
  page?: number;
  size?: number;
  tags?: string[];
}

export interface PagingPosts {
  posts: PostInfo[];
  total: number;
  page: number;
  size: number;
}
