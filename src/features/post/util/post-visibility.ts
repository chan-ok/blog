import type { Frontmatter } from '@/entities/markdown/model/model.schema';

const NON_PUBLIC_TAGS = new Set(['test', 'draft']);

export type PostVisibilitySurface = 'list' | 'detail';

export interface PostVisibilityOptions {
  isProduction: boolean;
  surface: PostVisibilitySurface;
}

export type PostVisibilityFrontmatter = Pick<Partial<Frontmatter>, 'published' | 'tags'>;

export function isPostVisible(
  frontmatter: PostVisibilityFrontmatter,
  context: PostVisibilityOptions
): boolean {
  if (context.isProduction) {
    return (
      frontmatter.published === true && !frontmatter.tags?.some((tag) => NON_PUBLIC_TAGS.has(tag))
    );
  }

  if (context.surface === 'list') {
    return frontmatter.published === true;
  }

  return true;
}
