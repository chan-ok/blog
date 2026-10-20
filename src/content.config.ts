import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { createBlogLoader } from './lib/content/loader';
import { PostMetadataSchema } from './lib/content/metadata';
const posts = defineCollection({
  loader: createBlogLoader({ root: process.cwd() }),
  schema: z.object({
    id: z.string(),
    locale: z.enum(['ko', 'ja']),
    slug: z.array(z.string()),
    metadata: PostMetadataSchema,
    body: z.string(),
    sourcePath: z.string(),
  }),
});
export const collections = { posts };
