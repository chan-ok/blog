import { seriesSchema, type Series } from '../model/series.schema';

const BASE_URL = 'https://raw.githubusercontent.com/chan-ok/blog-content/main';

/**
 * blog-content 리포지터리에서 전체 시리즈 목록을 fetch한다.
 * 실패 시 빈 배열을 반환한다.
 */
export async function getSeries(baseUrl: string = BASE_URL): Promise<Series[]> {
  try {
    const res = await fetch(`${baseUrl}/series/index.json`);
    if (!res.ok) return [];

    const raw = await res.json();
    const parsed = seriesSchema.array().safeParse(raw);
    if (!parsed.success) return [];

    return parsed.data;
  } catch {
    return [];
  }
}

/**
 * slug에 해당하는 시리즈를 반환한다. 없으면 null.
 */
export async function getSeriesBySlug(
  slug: string,
  baseUrl: string = BASE_URL
): Promise<Series | null> {
  const list = await getSeries(baseUrl);
  return list.find((s) => s.slug === slug) ?? null;
}
