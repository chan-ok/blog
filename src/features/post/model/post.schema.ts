import { z } from 'zod';

export const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  summary: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  path: z.string(),
  published: z.boolean().default(false),
});
export type Post = z.infer<typeof PostSchema>;
