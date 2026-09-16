import { fetchTextWithLimit, MAX_REMOTE_CONTENT_BYTES } from '@/shared/util/fetch-limited';
import { FrontmatterSchema, Frontmatter } from '../model/model.schema';
import { buildMarkdownUrl } from './markdown-path';
import { parseMarkdownSource } from './parse-markdown';

// partial(): about 페이지(README)처럼 frontmatter 일부 필드가 없는 파일도 지원
export type MarkdownFrontmatter = Partial<Frontmatter>;

export interface MarkdownElement {
  frontmatter: MarkdownFrontmatter;
  content: string;
  source: string;
}

export async function getMarkdown(path: string, baseUrl?: string): Promise<MarkdownElement> {
  const baseURL = baseUrl || import.meta.env.VITE_GIT_RAW_URL;
  const markdownUrl = buildMarkdownUrl(path, baseURL);

  let response = await fetchTextWithLimit(markdownUrl, MAX_REMOTE_CONTENT_BYTES);

  // .mdx 요청 실패 시 .md 확장자로 재시도
  if (response.status === 404 && markdownUrl.endsWith('.mdx')) {
    response = await fetchTextWithLimit(
      markdownUrl.replace(/\.mdx$/, '.md'),
      MAX_REMOTE_CONTENT_BYTES
    );
  }

  if (response.status !== 200) {
    throw new Error('Failed to fetch posts');
  }

  const { content, data } = parseMarkdownSource(response.text);

  return {
    content,
    // partial(): 필수 필드가 없는 파일(README 등)에서도 오류 없이 파싱
    frontmatter: FrontmatterSchema.partial().parse(data),
    source: response.text,
  };
}
