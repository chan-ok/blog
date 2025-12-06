import { api } from '@/shared/config/api';
import { LocaleType } from '@/shared/types/common.schema';
import { MDXContent } from 'mdx/types';
import { parsePost } from './parse-post';

export async function getPost(
  locale: LocaleType,
  path: string,
  extension: string = 'mdx'
): Promise<MDXContent> {
  const baseURL =
    process.env.NEXT_PUBLIC_GIT_RAW_URL +
    process.env.NEXT_PUBLIC_CONTENT_REPO_URL;
  const response = await api.get<string>(`/${locale}/${path}.${extension}`, {
    baseURL,
  });

  if (response.axios.status !== 200) {
    throw new Error('Failed to fetch posts');
  }
  return await parsePost(response.data);
}
