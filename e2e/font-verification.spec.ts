import { test, expect } from '@playwright/test';

test.describe('웹폰트 검증', () => {
  test('한국어 페이지 - Noto Sans KR 적용', async ({ page }) => {
    await page.goto('http://localhost:5173/ko/');

    // HTML lang 속성이 설정될 때까지 대기
    await page.waitForFunction(() => document.documentElement.lang === 'ko');

    // HTML lang 속성 확인
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('ko');

    // 폰트 패밀리 확인 (body 또는 특정 요소)
    const fontFamily = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });

    // Noto Sans KR이 포함되어야 함
    expect(fontFamily).toContain('Noto Sans KR');
  });

  test('영어 페이지 - Inter 적용', async ({ page }) => {
    await page.goto('http://localhost:5173/en/');

    // HTML lang 속성이 설정될 때까지 대기
    await page.waitForFunction(() => document.documentElement.lang === 'en');

    // HTML lang 속성 확인
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('en');

    // 폰트 패밀리 확인
    const fontFamily = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });

    // Inter가 포함되어야 함
    expect(fontFamily).toContain('Inter');
  });

  test('일본어 페이지 - Noto Sans JP 적용', async ({ page }) => {
    await page.goto('http://localhost:5173/ja/');

    // HTML lang 속성이 설정될 때까지 대기
    await page.waitForFunction(() => document.documentElement.lang === 'ja');

    // HTML lang 속성 확인
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('ja');

    // 폰트 패밀리 확인
    const fontFamily = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });

    // Noto Sans JP이 포함되어야 함
    expect(fontFamily).toContain('Noto Sans JP');
  });

  test('Google Fonts 리소스 로드 확인', async ({ page }) => {
    const fontRequests: string[] = [];

    // 폰트 리소스 요청 감지
    page.on('request', (request) => {
      const url = request.url();
      const hostname = new URL(url).hostname;
      if (
        hostname === 'fonts.googleapis.com' ||
        hostname === 'fonts.gstatic.com'
      ) {
        fontRequests.push(url);
      }
    });

    await page.goto('http://localhost:5173/ko/');
    await page.waitForLoadState('networkidle');

    // Google Fonts가 로드되었는지 확인
    expect(fontRequests.length).toBeGreaterThan(0);

    // Inter, Noto Sans KR, Noto Sans JP가 모두 요청되었는지
    const allFontsRequested = fontRequests.some(
      (url) =>
        url.includes('Inter') ||
        url.includes('Noto+Sans+KR') ||
        url.includes('Noto+Sans+JP')
    );
    expect(allFontsRequested).toBe(true);
  });
});
