import { afterEach, expect, it } from 'vitest';
import { mkdtemp, readFile, writeFile, rm, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createAssetRegistry } from './assets';
const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});
it('실제 이미지의 내용을 해시하고 서버 경로를 공개 URL에 넣지 않는다', async () => {
  const root = await mkdtemp(join(tmpdir(), 'blog-assets-'));
  roots.push(root);
  const bytes = await readFile(new URL('../../../public/image/git-profile.png', import.meta.url));
  await writeFile(join(root, 'image.png'), bytes);
  const registry = createAssetRegistry(root);
  const first = await registry.resolve('image.png');
  expect(first).toMatch(/^\/content-assets\/[a-f0-9]+\.png$/u);
  expect(first).not.toContain(root);
  expect(registry.entries()).toHaveLength(1);
  await writeFile(join(root, 'image.png'), Buffer.concat([bytes, Buffer.from('changed')]));
  expect(await registry.resolve('image.png')).not.toBe(first);
});
it('traversal·외부 파일·능동 파일을 거부한다', async () => {
  const root = await mkdtemp(join(tmpdir(), 'blog-assets-'));
  roots.push(root);
  const registry = createAssetRegistry(root);
  await writeFile(join(root, 'unsafe.png'), '<script>alert(1)</script>');
  await symlink('/etc/hosts', join(root, 'outside.png'));
  await expect(registry.resolve('../etc/hosts')).rejects.toThrow(/Invalid|outside/);
  await expect(registry.resolve('outside.png')).rejects.toThrow(/outside/);
  await expect(registry.resolve('unsafe.png')).rejects.toThrow(/image/i);
  expect(await registry.resolve('https://attacker.example/pixel')).toBeUndefined();
});
