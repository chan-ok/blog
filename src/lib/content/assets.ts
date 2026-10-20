import { createHash } from 'node:crypto';
import { readFile, realpath, mkdir, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { assetStagingDir } from '../../integrations/content-assets';
import { isInside } from './vault';
import { hasAsciiControlCharacter } from '../../shared/util/text-security';
export interface ContentAsset {
  publicPath: string;
  sourcePath: string;
  digest: string;
  mime: string;
}
export interface AssetRegistry {
  resolve(path: string): Promise<string | undefined>;
  entries(): ContentAsset[];
}
export function createAssetRegistry(vaultRoot: string): AssetRegistry {
  const assets = new Map<string, ContentAsset>();
  return {
    entries: () => [...assets.values()],
    async resolve(source) {
      if (source.startsWith('https://')) {
        const url = new URL(source);
        return !url.username &&
          !url.password &&
          (url.origin === 'https://skillicons.dev' ||
            (url.origin === 'https://raw.githubusercontent.com' &&
              url.pathname.startsWith('/chan-ok/')))
          ? url.href
          : undefined;
      }
      if (
        !source ||
        source.startsWith('/') ||
        source.includes('\\') ||
        hasAsciiControlCharacter(source) ||
        /[%?#:]/u.test(source) ||
        source.split('/').some((part) => part === '..' || part === '.')
      )
        throw new Error(`Invalid image path: ${source}`);
      const root = await realpath(vaultRoot);
      const path = await realpath(resolve(root, source));
      if (!isInside(root, path)) throw new Error('Image outside content root');
      const buffer = await readFile(path);
      if (buffer.length > 10 * 1024 * 1024) throw new Error('Image size limit');
      const extension = extname(path).toLowerCase();
      const valid =
        (extension === '.png' &&
          buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
        (['.jpg', '.jpeg'].includes(extension) && buffer[0] === 255 && buffer[1] === 216) ||
        (extension === '.gif' && buffer.toString('ascii', 0, 3) === 'GIF') ||
        (extension === '.webp' && buffer.toString('ascii', 8, 12) === 'WEBP') ||
        (extension === '.avif' && buffer.toString('ascii', 4, 8) === 'ftyp');
      if (!valid) throw new Error(`Unsupported or invalid image: ${source}`);
      const digest = createHash('sha256').update(buffer).digest('hex');
      const publicPath = `/content-assets/${digest.slice(0, 24)}${extension}`;
      const mime =
        extension === '.jpg' || extension === '.jpeg'
          ? 'image/jpeg'
          : `image/${extension.slice(1)}`;
      await mkdir(assetStagingDir, { recursive: true });
      await writeFile(resolve(assetStagingDir, publicPath.split('/').at(-1)!), buffer);
      assets.set(path, { publicPath, sourcePath: path, digest, mime });
      return publicPath;
    },
  };
}
