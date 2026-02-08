import { compile } from '@mdx-js/mdx';
import { api } from '@/shared/config/api';
import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeHighlight from 'rehype-highlight';
import { Frontmatter } from '../model/markdown.schema';

interface MarkdownElement {
  frontmatter: Frontmatter;
  content: string;
  source: string;
  compiledSource: string; // 컴파일된 MDX 코드 (function body string)
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

  // MDX 컴파일 (outputFormat: 'function-body')
  const compiled = await compile(content, {
    outputFormat: 'function-body',
    remarkPlugins: [remarkGfm, remarkFrontmatter],
    rehypePlugins: [rehypeHighlight],
  });

  return {
    content,
    frontmatter: data as unknown as Frontmatter,
    source: response.data,
    compiledSource: String(compiled),
  };
}
