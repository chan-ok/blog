import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { implementedFrameworks } from '../src/lib/presentation/frameworks';
import { readVaultPosts, resolveVaultDirectory } from '../src/lib/content/vault';
import { isVisible } from '../src/lib/content/visibility';
import { validateHtml } from './html-validation';

const dist = resolve(process.env.BLOG_OUT_DIR || 'dist');
async function files(directory: string): Promise<string[]> {
  return (
    await Promise.all(
      (
        await readdir(directory, { withFileTypes: true })
      ).map((entry) =>
        entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]
      )
    )
  ).flat();
}
const output = await files(dist);
const vault = await resolveVaultDirectory(process.cwd(), process.env.BLOG_CONTENT_DIR);
const posts = await readVaultPosts(vault);
const contexts = [undefined, ...implementedFrameworks];
for (const framework of contexts)
  for (const locale of ['ko', 'ja']) {
    const root = join(dist, ...(framework ? [framework] : []), locale);
    for (const suffix of ['', 'posts', 'about']) {
      const html = await readFile(join(root, suffix, 'index.html'), 'utf8');
      assert(html.includes(`<html lang="${locale}"`), 'HTML language');
      assert(
        html.includes(`href="https://chan-ok.com/${locale}${suffix ? `/${suffix}` : ''}"`),
        'canonical URL'
      );
      assert(
        html.includes(`data-framework="${framework || 'react'}"`),
        'server-rendered framework'
      );
    }
    for (const post of posts.filter((post) => post.locale === locale)) {
      const path = join(root, 'posts', ...post.slug, 'index.html');
      assert.equal(
        output.includes(path),
        isVisible(post.metadata, true, 'detail'),
        `post visibility: ${post.id}`
      );
    }
  }
for (const file of output.filter((path) => path.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  assert(await validateHtml(html), `invalid HTML nesting: ${file}`);
  assert(!html.includes('sourcePath') && !html.includes(vault), `private server paths: ${file}`);
  assert(!/\b(?:src|href)="__ASTRO_IMAGE_/u.test(html), `unresolved image: ${file}`);
  for (const match of html.matchAll(/src="(\/content-assets\/[^"?#]+)"/gu)) {
    assert((await stat(join(dist, match[1]))).isFile(), `missing image: ${match[1]}`);
  }
}
console.log(
  `Verified ${output.filter((path) => path.endsWith('.html')).length} HTML pages: routes, visibility, metadata, images and HTML nesting.`
);
