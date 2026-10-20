import { writeFile, unlink, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test, expect, postSource } from '../browser/fixtures/blog-fixture';

test('열린 브라우저에 파일 추가·수정·삭제·공개 상태·이미지 변경이 자동 반영된다', async ({
  page,
  blog,
}) => {
  await page.goto('/react/ko/posts/');
  await expect(page.locator('main')).toContainText('Fixture post');
  const path = join(blog.vault, 'ko', 'watch.md');
  await writeFile(path, postSource('Watch added'));
  await expect(page.locator('main')).toContainText('Watch added');
  await writeFile(path, postSource('Watch edited'));
  await expect(page.locator('main')).toContainText('Watch edited');
  await writeFile(path, postSource('Watch edited', false));
  await expect(page.locator('main')).not.toContainText('Watch edited');
  expect((await page.request.get('/react/ko/posts/watch/')).status()).toBe(200);
  await unlink(path);
  await expect
    .poll(async () => (await page.request.get('/react/ko/posts/watch/')).status())
    .toBe(404);
  await page.goto('/react/ko/posts/sample/');
  const image = page.locator('.mdx-content img');
  const before = await image.getAttribute('src');
  await writeFile(
    join(blog.vault, 'images/sample.png'),
    await readFile(join(blog.vault, 'images/private.png'))
  );
  await expect(image).not.toHaveAttribute('src', before!);
  expect((await page.request.get((await image.getAttribute('src'))!)).status()).toBe(200);
  await blog.stop();
  await blog.start();
  await page.goto('/react/ko/');
  await expect(page.locator('main')).toContainText('Fixture post');
});
