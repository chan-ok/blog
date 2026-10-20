import type { AstroIntegration } from 'astro';
import { mkdir, readdir, copyFile, rm, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
export const assetStagingDir = resolve(
  process.env.BLOG_CACHE_DIR || resolve(process.cwd(), 'node_modules/.cache'),
  'blog-content-assets'
);
export default function contentAssets(): AstroIntegration {
  return {
    name: 'blog-content-assets',
    hooks: {
      'astro:build:start': async () => {
        await rm(assetStagingDir, { recursive: true, force: true });
        await mkdir(assetStagingDir, { recursive: true });
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use('/content-assets', async (req, res, next) => {
          const name = req.url?.split('?')[0]?.replace(/^\//u, '');
          if (!name || !/^[a-f0-9]{24}\.(png|jpe?g|gif|webp|avif)$/u.test(name)) {
            next();
            return;
          }
          try {
            const bytes = await readFile(join(assetStagingDir, name));
            res.setHeader(
              'Content-Type',
              name.endsWith('.jpg') || name.endsWith('.jpeg')
                ? 'image/jpeg'
                : `image/${name.split('.').at(-1)}`
            );
            res.end(bytes);
          } catch {
            next();
          }
        });
      },
      'astro:build:done': async ({ dir }) => {
        const output = new URL('content-assets/', dir);
        await mkdir(output, { recursive: true });
        for (const name of await readdir(assetStagingDir))
          await copyFile(join(assetStagingDir, name), new URL(name, output));
      },
    },
  };
}
