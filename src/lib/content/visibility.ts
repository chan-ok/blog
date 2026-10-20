import type { PostMetadata } from './types';
export function isVisible(
  metadata: PostMetadata,
  production: boolean,
  surface: 'list' | 'detail'
): boolean {
  if (production)
    return metadata.published && !metadata.tags.some((tag) => tag === 'test' || tag === 'draft');
  return surface === 'detail' || metadata.published;
}
