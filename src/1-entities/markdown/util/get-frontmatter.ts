import matter from 'gray-matter';

import { api } from '@/5-shared/config/api';

import { FrontmatterSchema, Frontmatter } from '../model/markdown.schema';

// partial(): frontmatter 일부 필드가 없는 파일도 지원
export type PartialFrontmatter = Partial<Frontmatter>;

/**
 * MDX 파일에서 frontmatter만 추출한다.
 * MDX 컴파일 없이 gray-matter 파싱만 수행하여 빠르게 메타데이터를 가져온다.
 * SEO 메타태그 생성을 위한 loader에서 사용한다.
 */
export async function getFrontmatter(
  path: string,
  baseUrl?: string
): Promise<PartialFrontmatter> {
  const baseURL = baseUrl || import.meta.env.VITE_GIT_RAW_URL;

  // URL 디코딩 + 경로 내 파일명의 언더바를 공백으로 변환
  const realPath = decodeURIComponent(path).replace(/[^/]+$/, (s) =>
    s.replaceAll('_', ' ')
  );

  let response = await api.get<string>(realPath, { baseURL });

  // .mdx 요청 실패 시 .md 확장자로 재시도
  if (response.axios.status !== 200 && realPath.endsWith('.mdx')) {
    const mdPath = realPath.replace(/\.mdx$/, '.md');
    response = await api.get<string>(mdPath, { baseURL });
  }

  if (response.axios.status !== 200) {
    throw new Error('Failed to fetch markdown file');
  }

  const stringData =
    typeof response.data === 'string' ? response.data : String(response.data);

  const { data } = matter(stringData);

  // partial(): 필수 필드가 없는 파일에서도 오류 없이 파싱
  return FrontmatterSchema.partial().parse(data);
}
