import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readVaultPosts, resolveVaultDirectory } from './vault';
import { isVisible } from './visibility';

const cleanups: string[] = [];
afterEach(async () => {
  await Promise.all(cleanups.splice(0).map((p) => rm(p, { recursive: true, force: true })));
});
async function vault() {
  const root = await mkdtemp(join(tmpdir(), 'blog-vault-'));
  cleanups.push(root);
  await mkdir(join(root, 'ko', 'nested'), { recursive: true });
  await mkdir(join(root, 'ja'));
  return root;
}
const source =
  '---\ntitle: 글 제목\ncreatedAt: 2026-01-31T21:45:00Z\nupdatedAt: null\npublished: true\ntags: [blog]\n---\n# 본문';
describe('Obsidian 콘텐츠 수집', () => {
  it('중첩 경로와 날짜를 보존하고 숨김·인덱스를 무시한다', async () => {
    const root = await vault();
    await writeFile(join(root, 'ko', 'nested', '글 제목.mdx'), source);
    await writeFile(join(root, 'ko', 'index.json'), '[]');
    await mkdir(join(root, 'ko', '.space'));
    await writeFile(join(root, 'ko', '.space', 'hidden.md'), source);
    const [post] = await readVaultPosts(root);
    expect(post.slug).toEqual(['nested', '글_제목']);
    expect(post.metadata.createdAt).toBe('2026-01-31T21:45:00.000Z');
    expect(post.metadata.updatedAt).toBeNull();
    expect(post.body).toContain('# 본문');
    expect(await readVaultPosts(root)).toHaveLength(1);
    await rm(post.sourcePath);
    expect(await readVaultPosts(root)).toHaveLength(0);
  });
  it('공백과 밑줄로 생긴 URL 충돌을 거부한다', async () => {
    const root = await vault();
    await writeFile(join(root, 'ko', '글 제목.md'), source);
    await writeFile(join(root, 'ko', '글_제목.mdx'), source);
    await expect(readVaultPosts(root)).rejects.toThrow(/collision/i);
  });
  it('루트 밖 symlink를 거부한다', async () => {
    const root = await vault();
    const outside = await vault();
    await writeFile(join(outside, 'outside.md'), source);
    await symlink(join(outside, 'outside.md'), join(root, 'ko', 'outside.md'));
    await expect(readVaultPosts(root)).rejects.toThrow(/outside/i);
  });
  it('잘못된 메타데이터·YAML과 과도한 파일을 거부한다', async () => {
    const root = await vault();
    const file = join(root, 'ko', 'bad.md');
    await writeFile(file, source.replace('createdAt: 2026-01-31T21:45:00Z', 'createdAt: bad'));
    await expect(readVaultPosts(root)).rejects.toThrow(/bad.md/);
    await writeFile(file, source.replace('title: 글 제목', 'title: one\ntitle: two'));
    await expect(readVaultPosts(root)).rejects.toThrow(/bad.md/);
    await writeFile(file, '가'.repeat(800_000));
    await expect(readVaultPosts(root)).rejects.toThrow(/size/i);
  });
  it('없는 vault에 설정 방법을 알려준다', async () => {
    await expect(resolveVaultDirectory('/tmp/nonexistent-project')).rejects.toThrow(
      /BLOG_CONTENT_DIR/
    );
  });
  it('공개 정책을 목록과 상세에 적용한다', () => {
    const meta = { title: '글', createdAt: '2026-01-01', tags: [], published: true };
    expect(isVisible(meta, true, 'detail')).toBe(true);
    expect(isVisible({ ...meta, tags: ['test'] }, true, 'detail')).toBe(false);
    expect(isVisible({ ...meta, tags: ['draft'] }, true, 'list')).toBe(false);
    expect(isVisible({ ...meta, published: false }, false, 'detail')).toBe(true);
    expect(isVisible({ ...meta, published: false }, false, 'list')).toBe(false);
  });
});
