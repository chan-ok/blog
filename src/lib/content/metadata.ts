import { z } from 'zod';
export const PostMetadataSchema = z.object({
  title: z.string().min(1).max(300),
  createdAt: z.coerce.date().transform((date) => date.toISOString()),
  updatedAt: z.coerce
    .date()
    .transform((date) => date.toISOString())
    .nullish(),
  tags: z.array(z.string().min(1).max(64)).max(50).default([]),
  published: z.boolean().default(false),
  thumbnail: z.string().min(1).max(2048).optional(),
  summary: z.string().max(2000).optional(),
  series: z.string().min(1).max(160).optional(),
});
