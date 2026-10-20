import { test, expect } from './fixtures/blog-fixture';

for (const framework of ['react', 'vue', 'svelte']) {
  test(`${framework}: MDX·HTML을 실행하지 않으며 활성 외부 요청을 만들지 않는다`, async ({
    page,
  }) => {
    const external: string[] = [];
    const errors: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('attacker.example')) external.push(request.url());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/${framework}/ko/posts/sample/`);
    await expect(page.locator('astro-island')).not.toHaveAttribute('ssr');
    await expect(page.locator('[data-mermaid] svg')).toBeVisible();
    expect(
      await page.evaluate(() => (window as unknown as { __blogPwned?: boolean }).__blogPwned)
    ).toBeUndefined();
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
    expect(await page.locator('.mdx-content').innerHTML()).not.toMatch(
      /<script|onerror=|javascript:|<foreignObject/iu
    );
  });
  test(`${framework}: JavaScript 없이 본문과 탐색을 제공한다`, async ({ browser, blog }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.goto(`${blog.url}/${framework}/ko/posts/sample/`);
      await expect(page.locator('.mdx-content')).toContainText('First heading');
      await expect(page.locator('.mdx-content p').filter({ hasText: 'before' })).toHaveText(
        'before bold after and "hello" -- ...'
      );
      await expect(page.locator('.mdx-content p figure, .mdx-content p div')).toHaveCount(0);
      await page
        .locator('.framework-links a')
        .filter({ hasText: framework === 'vue' ? 'svelte' : 'vue' })
        .click();
      await expect(page.locator('article h1').first()).toHaveText('Fixture post');
      const href = await page.locator('.locale-links a[lang=ja]').getAttribute('href');
      expect((await page.goto(new URL(href!, blog.url).href))?.status()).toBe(404);
    } finally {
      await context.close();
    }
  });
}
