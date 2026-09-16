import { z } from 'zod';

import { hasAsciiControlCharacter } from '@/shared/util/text-security';

const SafePathSegmentSchema = z
  .string()
  .min(1)
  .max(160)
  .refine(
    (segment) =>
      segment !== '.' &&
      segment !== '..' &&
      !/[\\/?#]/u.test(segment) &&
      !hasAsciiControlCharacter(segment),
    'Invalid post path segment'
  );

const TagSchema = z.string().min(1).max(64);
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
  title: z.string().min(1).max(300),
  path: z.array(SafePathSegmentSchema).min(1).max(20),
  tags: z.array(TagSchema).max(50).default([]),
  // z.coerce.date(): Date 객체(YAML) 또는 문자열(JSON) 모두 처리
  createdAt: z.coerce.date(),
  // updatedAt: null은 "미업데이트" 의미이므로 nullable 허용
  updatedAt: z.coerce.date().nullish(),
  published: z.boolean().default(false),
  thumbnail: z.string().min(1).max(2_048).optional(),
  summary: z.string().max(2_000).optional(),
  // series: 관련 포스트를 하나의 시리즈로 묶기 위한 식별자
  series: z.string().min(1).max(160).optional(),
});
export type Frontmatter = z.infer<typeof FrontmatterSchema>;

export const PostIndexSchema = z.array(FrontmatterSchema).max(1_000);
