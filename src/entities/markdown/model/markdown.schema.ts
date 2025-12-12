import { z } from 'zod';

export const FrontmatterSchema = z.object({
  id: z.string(),
  title: z.string(),
  thumbnail: z.string().optional(),
  summary: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  tags: z.array(z.string()).default([]),
  path: z.array(z.string()),
  published: z.boolean().default(false),
});
export type Frontmatter = z.infer<typeof FrontmatterSchema>;
