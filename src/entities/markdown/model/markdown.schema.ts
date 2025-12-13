import { z } from 'zod';
/**
 * Frontmatter schema
 *
 * Example:
 * ```json
 * {
 *   title: 'AI와 함께 개발을 시도한 경험',
 *   path: [ 'ai-doodle', 'AI와-함께-개발을-시도한-경험' ],
 *   tags: [ '회고', 'AI' ],
 *   createdAt: 2025-12-12T08:12:00.000Z,
 *   updatedAt: null,
 *   published: false
 * }
 * ```
 */
export const FrontmatterSchema = z.object({
  title: z.string(),
  path: z.array(z.string()),
  tags: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  published: z.boolean().default(false),
  thumbnail: z.string().optional(),
  summary: z.string().optional(),
});
export type Frontmatter = z.infer<typeof FrontmatterSchema>;
