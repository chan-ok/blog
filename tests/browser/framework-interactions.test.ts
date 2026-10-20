import { test, expect } from './fixtures/blog-fixture';

for (const framework of ['react', 'vue', 'svelte']) {
  test(`${framework}: 코드 복사·목차·Mermaid와 원문 공백`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.addInitScript(() =>
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            Object.assign(window, { __copied: text });
          },
        },
      })
    );
    await page.goto(`/${framework}/ko/posts/sample/`);
    await expect(page.locator('astro-island')).not.toHaveAttribute('ssr');
    const button = page.getByRole('button', { name: '코드 복사', exact: true });
    await button.click();
    await expect(page.getByRole('status')).toHaveText('복사됨');
    expect(
      await page.evaluate(() => (window as unknown as { __copied: string }).__copied)
    ).toContain('const message = "copy me";');
    await page.evaluate(() =>
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: async () => {
            throw new Error('Denied');
          },
        },
      })
    );
    await button.click();
    await expect(page.getByRole('status')).toHaveText('복사하지 못했습니다');
    const toc = page.locator('.toc');
    await toc.getByRole('button').click();
    await expect(toc.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    await toc.getByRole('link', { name: 'Second heading' }).click();
    await expect(toc.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('[data-mermaid] svg')).toBeVisible();
    await expect(page.locator('.mdx-content p').filter({ hasText: 'before' })).toHaveText(
      'before bold after and "hello" -- ...'
    );
    await expect(page.locator('.mdx-content img')).toHaveAttribute('alt', 'Sample image');
  });
  test(`${framework}: 프로필과 본문 이미지 실패를 표시한다`, async ({ page }) => {
    await page.route('**/image/git-profile.png', (route) => route.abort());
    await page.goto(`/${framework}/ko/`);
    await expect(page.getByText('이미지를 불러올 수 없습니다', { exact: true })).toBeVisible();
    await expect(page.locator('.animate-pulse')).toHaveCount(0);
    await page.route('**/content-assets/*', (route) => route.abort());
    await page.goto(`/${framework}/ko/posts/sample/`);
    await expect(page.getByText('이미지를 불러올 수 없습니다', { exact: true })).toBeVisible();
  });
}
