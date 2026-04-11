import { z } from 'zod';

/** 시리즈 아이템 타입: 내 글(post) 또는 스크랩(scrap) */
const seriesItemSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('post'),
    /** blog-content 내 경로 (예: "ko/fsd-retrospective") */
    path: z.string(),
    title: z.string(),
  }),
  z.object({
    type: z.literal('scrap'),
    /** 외부 URL */
    url: z.string().url(),
    title: z.string(),
    /** 선택적 한 줄 코멘트 */
    comment: z.string().optional(),
  }),
]);

export const seriesSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.string(),
  items: z.array(seriesItemSchema),
});

export type Series = z.infer<typeof seriesSchema>;
export type SeriesItem = z.infer<typeof seriesItemSchema>;
export type PostItem = Extract<SeriesItem, { type: 'post' }>;
export type ScrapItem = Extract<SeriesItem, { type: 'scrap' }>;
