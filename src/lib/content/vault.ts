import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import { basename, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { parseMarkdownSource } from './frontmatter';
import { LOCALES } from '../presentation/types';
import { validateSegments } from '../presentation/routes';
import { PostMetadataSchema } from './metadata';
import type { VaultPost } from './types';

export function isInside(root: string, path: string): boolean {
  const rel = relative(root, path);
  return !isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`);
}
export async function resolveVaultDirectory(
  projectRoot: string,
  override?: string
): Promise<string> {
  try {
    const root = await realpath(resolve(projectRoot, override || '../blog-content'));
    if (!(await stat(root)).isDirectory()) throw new Error('Not a directory');
    return root;
  } catch (cause) {
    throw new Error('Set BLOG_CONTENT_DIR to an existing content directory', { cause });
  }
}
export async function readVaultPosts(directory: string): Promise<VaultPost[]> {
  const root = await realpath(directory);
  const posts: VaultPost[] = [];
  const paths = new Map<string, string>();
  async function walk(
    dir: string,
    locale: (typeof LOCALES)[number],
    localeRoot: string,
    ancestors: Set<string>
  ) {
    const actual = await realpath(dir);
    if (!isInside(root, actual)) throw new Error(`Content path outside vault: ${dir}`);
    if (ancestors.has(actual)) throw new Error(`Content directory cycle: ${dir}`);
    const next = new Set(ancestors).add(actual);
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const file = join(dir, entry.name);
      const actualFile = await realpath(file);
      if (!isInside(root, actualFile)) throw new Error(`Content path outside vault: ${file}`);
      const info = await stat(actualFile);
      if (info.isDirectory()) {
        await walk(file, locale, localeRoot, next);
        continue;
      }
      if (!info.isFile() || !['.md', '.mdx'].includes(extname(file))) continue;
      if (info.size > 2 * 1024 * 1024) throw new Error(`Content size limit: ${file}`);
      try {
        const parsed = parseMarkdownSource(await readFile(file, 'utf8'));
        const parts = relative(localeRoot, file)
          .replace(/\.mdx?$/u, '')
          .split(sep);
        parts[parts.length - 1] = parts.at(-1)!.replaceAll(' ', '_');
        validateSegments(parts);
        const id = `${locale}/${parts.join('/')}`;
        if (paths.has(id)) throw new Error(`URL collision: ${paths.get(id)} and ${file}`);
        paths.set(id, file);
        posts.push({
          id,
          locale,
          slug: parts,
          metadata: PostMetadataSchema.parse({
            title: basename(file, extname(file)),
            ...parsed.data,
          }),
          body: parsed.content,
          sourcePath: file,
        });
      } catch (cause) {
        throw new Error(`${file}: ${cause instanceof Error ? cause.message : 'Invalid content'}`, {
          cause,
        });
      }
    }
  }
  for (const locale of LOCALES) {
    const dir = join(root, locale);
    try {
      await stat(dir);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
      throw error;
    }
    await walk(dir, locale, dir, new Set());
  }
  return posts.toSorted(
    (a, b) => b.metadata.createdAt.localeCompare(a.metadata.createdAt) || a.id.localeCompare(b.id)
  );
}
