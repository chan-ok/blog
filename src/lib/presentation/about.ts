import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fetchTextWithLimit, MAX_REMOTE_CONTENT_BYTES } from '../../shared/util/fetch-limited';
import { parseMarkdownSource } from '../content/frontmatter';
import type { Locale } from './types';
const cache = new Map<string, Promise<string>>();
export const ABOUT_ROOT = 'https://raw.githubusercontent.com/chan-ok/chan-ok/main';
export async function getAbout(locale: Locale): Promise<string> {
  if (process.env.BLOG_ABOUT_DIR)
    return parseMarkdownSource(
      await readFile(join(process.env.BLOG_ABOUT_DIR, `README.${locale}.md`), 'utf8')
    ).content;
  if (!cache.has(locale))
    cache.set(
      locale,
      (async () => {
        const result = await fetchTextWithLimit(
          `${ABOUT_ROOT}/README.${locale}.md`,
          MAX_REMOTE_CONTENT_BYTES
        );
        if (result.status !== 200)
          throw new Error(`About README.${locale}.md: HTTP ${result.status}`);
        return parseMarkdownSource(result.text || '').content;
      })()
    );
  return cache.get(locale)!;
}
