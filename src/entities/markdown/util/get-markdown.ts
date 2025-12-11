import { api } from '@/shared/config/api';
import matter from 'gray-matter';
import { Frontmatter } from '../model/markdown.schema';

interface MarkdownElement {
  frontmatter: Frontmatter;
  content: string;
  source: string;
}

export default async function getMarkdown(
  path: string,
  baseUrl?: string
): Promise<MarkdownElement> {
  const baseURL = baseUrl || process.env.NEXT_PUBLIC_GIT_RAW_URL;

  console.log(baseURL);
  console.log(path);
  const response = await api.get<string>(path, { baseURL });

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
