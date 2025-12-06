import { api } from '@/shared/config/api';
import matter from 'gray-matter';
import { Frontmatter } from '../model/mdx.schema';

interface MarkdownElement {
  frontmatter: Frontmatter;
  content: string;
  source: string;
}

export default async function getMarkdown(
  locale: LocaleType,
  path: string,
  extension: string = 'mdx'
): Promise<MarkdownElement> {
  const baseURL = process.env.NEXT_PUBLIC_GIT_RAW_URL;
  const url = `/${locale}/${path}.${extension}`;
  const response = await api.get<string>(url, { baseURL });

  if (response.axios.status !== 200) {
    throw new Error('Failed to fetch posts');
  }

  const { content, data } = matter(response.data);
  return {
    content,
    frontmatter: data as unknown as Frontmatter,
    source: response.data,
  };
}
