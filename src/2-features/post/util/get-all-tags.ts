import { api } from '@/5-shared/config/api';
import { Frontmatter as PostInfo } from '@/1-entities/markdown/model/markdown.schema';

export async function getAllTags(locale: LocaleType): Promise<string[]> {
  const baseURL = import.meta.env.VITE_GIT_RAW_URL;

  if (!baseURL) {
    console.error('VITE_GIT_RAW_URL is not defined');
    return [];
  }

  try {
    const response = await api.get<PostInfo[]>(`/${locale}/index.json`, {
      baseURL,
    });

    if (response.axios.status !== 200 || !response.data) {
      return [];
    }

    const allTags = response.data
      .filter((post) => post.published)
      .flatMap((post) => post.tags);

    return [...new Set(allTags)].sort();
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return [];
  }
}
