import { expect, test } from 'playwright/test';

for (const framework of ['react', 'vue']) {
  for (const locale of ['ko', 'ja']) {
    test(`${framework}/${locale}: 전체 페이지와 탐색 축을 유지한다`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      for (const suffix of ['', 'posts/', 'about/']) {
        const path = `/${framework}/${locale}/${suffix}`;
        expect((await page.goto(path))?.status()).toBe(200);
        await expect(page.locator(`[data-framework="${framework}"]`)).toBeVisible();
        await expect(page.locator('main')).not.toBeEmpty();
        await expect(page.locator('footer')).toContainText('chanho.kim');
        await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
          'href',
          `https://chan-ok.com/${locale}${suffix ? `/${suffix.slice(0, -1)}` : ''}`
        );
        await expect(
          page.locator(`.locale-links a[lang="${locale === 'ko' ? 'ja' : 'ko'}"]`)
        ).toHaveAttribute('href', `/${framework}/${locale === 'ko' ? 'ja' : 'ko'}/${suffix}`);
        await expect(page.locator('.framework-links a').first()).toHaveAttribute(
          'href',
          `/react/${locale}/${suffix}`
        );
      }
      if (locale === 'ko') {
        await page.goto(`/${framework}/ko/posts/`);
        const href = await page.locator('main ol a').first().getAttribute('href');
        expect(href).toBeTruthy();
        expect((await page.goto(href!))?.status()).toBe(200);
        await expect(page.locator('article h1').first()).not.toBeEmpty();
        await expect(page.locator('.mdx-content')).not.toBeEmpty();
        const jaHref = await page.locator('.locale-links a[lang=ja]').getAttribute('href');
        expect((await page.goto(jaHref!))?.status()).toBe(404);
      }
      expect(errors).toEqual([]);
    });
  }
}
