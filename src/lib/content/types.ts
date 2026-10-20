import type { Locale } from '../presentation/types';
export interface PostMetadata {
  title: string;
  createdAt: string;
  updatedAt?: string | null;
  tags: string[];
  published: boolean;
  thumbnail?: string;
  summary?: string;
  series?: string;
}
export interface VaultPost {
  id: string;
  locale: Locale;
  slug: string[];
  metadata: PostMetadata;
  body: string;
  sourcePath: string;
}
