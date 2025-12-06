import { api } from '@/shared/config/api';
import { LocaleType } from '@/shared/types/common.schema';
import matter from 'gray-matter';

export async function getPost(
  locale: LocaleType,
  path: string,
  extension: string = 'mdx'
) {
  const baseURL = process.env.NEXT_PUBLIC_GIT_RAW_URL;
  const url = `/${locale}/${path}.${extension}`;
  const response = await api.get<string>(url, { baseURL });

  if (response.axios.status !== 200) {
    throw new Error('Failed to fetch posts');
  }

  const { content } = matter(response.data);
  return content;
}
