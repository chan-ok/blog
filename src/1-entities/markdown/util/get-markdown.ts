import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import matter from 'gray-matter';

import { api } from '@/5-shared/config/api';

import { Frontmatter } from '../model/markdown.schema';
import remarkObsidianImage from './remark-obsidian-image';
import rehypeUnwrapImages from './rehype-unwrap-images';

interface MarkdownElement {
  frontmatter: Frontmatter;
  content: string;
  source: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MDXContent: React.ComponentType<{ components?: any }>;
}

export default async function getMarkdown(
  path: string,
  baseUrl?: string
): Promise<MarkdownElement> {
  // Vite 환경 변수 사용
  const baseURL = baseUrl || import.meta.env.VITE_GIT_RAW_URL;
  const realPath = decodeURIComponent(path).replace(/[^/]+$/, (s) =>
    s.replaceAll('-', ' ')
  );

  const response = await api.get<string>(realPath, { baseURL });

  if (response.axios.status !== 200) {
    throw new Error('Failed to fetch posts');
  }

  // 브라우저 환경을 위한 Buffer polyfill 방지
  // gray-matter에 문자열만 전달하면 Buffer 사용 안 함
  const stringData =
    typeof response.data === 'string' ? response.data : String(response.data);

  const { content, data } = matter(stringData);

  // MDX evaluate (1단계 처리)
  const { default: MDXContent } = await evaluate(content, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(runtime as any),
    remarkPlugins: [remarkObsidianImage, remarkGfm, remarkFrontmatter],
    rehypePlugins: [
      rehypeHighlight,
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          properties: {
            className: ['anchor'],
            ariaHidden: 'true',
            tabIndex: -1,
          },
          content: {
            type: 'element',
            tagName: 'span',
            properties: { className: ['anchor-icon'] },
            children: [{ type: 'text', value: '#' }],
          },
        },
      ],
      rehypeUnwrapImages,
    ],
  });

  return {
    content,
    frontmatter: data as unknown as Frontmatter,
    source: response.data,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MDXContent: MDXContent as React.ComponentType<{ components?: any }>,
  };
}
