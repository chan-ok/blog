import type { Loader } from 'astro/loaders';
import { readVaultPosts, resolveVaultDirectory, isInside } from './vault';
import { resolve } from 'node:path';
export function createBlogLoader({ root }: { root: string }): Loader {
  return {
    name: 'obsidian-vault',
    async load(context) {
      const directory = await resolveVaultDirectory(root, process.env.BLOG_CONTENT_DIR);
      async function refresh() {
        const posts = await readVaultPosts(directory);
        const entries = await Promise.all(
          posts.map(async (post) => ({
            id: post.id,
            data: await context.parseData({ id: post.id, data: { ...post } }),
          }))
        );
        context.store.clear();
        entries.forEach((entry) => context.store.set(entry));
      }
      await refresh();
      if (context.watcher) {
        context.watcher.add(directory);
        let timer: ReturnType<typeof setTimeout>;
        const change = (path: string) => {
          if (!isInside(directory, resolve(path))) return;
          clearTimeout(timer);
          timer = setTimeout(() => {
            void refresh().catch((error) => context.logger.error(String(error)));
          }, 80);
        };
        context.watcher.on('add', change).on('change', change).on('unlink', change);
        context.watcher.once('close', () => {
          clearTimeout(timer);
          context.watcher?.off('add', change).off('change', change).off('unlink', change);
        });
      }
    },
  };
}
