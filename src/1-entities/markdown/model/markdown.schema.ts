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
  // z.coerce.date(): Date 객체(YAML) 또는 문자열(JSON) 모두 처리
  createdAt: z.coerce.date(),
  // updatedAt: null은 "미업데이트" 의미이므로 nullable 허용
  updatedAt: z.coerce.date().nullish(),
  published: z.boolean().default(false),
  thumbnail: z.string().optional(),
  summary: z.string().optional(),
  // series: 관련 포스트를 하나의 시리즈로 묶기 위한 식별자
  series: z.string().optional(),
});
export type Frontmatter = z.infer<typeof FrontmatterSchema>;
