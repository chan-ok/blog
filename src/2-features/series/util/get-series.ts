import { seriesSchema, type Series } from "../model/series.schema";

/**
 * blog-content 리포지터리에서 해당 로케일의 시리즈 목록을 fetch한다.
 * 경로: series/{locale}/index.json
 * 실패 시 빈 배열을 반환한다.
 */
export async function getSeries(
  locale: string,
  baseUrl: string = import.meta.env.VITE_GIT_RAW_URL ?? "",
): Promise<Series[]> {
  if (!baseUrl) return [];
  try {
    const res = await fetch(`${baseUrl}/series/${locale}/index.json`);
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
  locale: string,
  baseUrl: string = import.meta.env.VITE_GIT_RAW_URL ?? "",
): Promise<Series | null> {
  const list = await getSeries(locale, baseUrl);
  return list.find((s) => s.slug === slug) ?? null;
}
