import { expect, test } from '@playwright/test';

/**
 * ============================================================================
 * Critical Paths E2E Tests
 * ============================================================================
 *
 * ## 테스트 목적
 * 주요 사용자 플로우를 브라우저에서 실제로 검증하여 프로덕션 환경에서의 동작을 보장합니다.
 *
 * ## 검증 항목
 * 1. 홈 페이지 (다국어: ko, en, ja)
 * 2. About 페이지
 * 3. 포스트 목록
 * 4. 포스트 상세
 * 5. 네비게이션
 * 6. 테마 전환 (다크 모드)
 * 7. 언어 전환
 */

const BASE_URL = 'http://localhost:5173';

test.describe('Critical Paths - 홈 페이지', () => {
  test('홈 페이지 - 한국어', async ({ page }) => {
    await page.goto(`${BASE_URL}/ko`);

    // TODO: 페이지별 타이틀 변경은 SEO 기능 구현 후 활성화
    // 현재는 기본 타이틀만 확인
    await expect(page).toHaveTitle(/Chanho/i);

    // 메인 콘텐츠 확인
    await expect(page.locator('main')).toBeVisible();

    // 헤더 확인 (로고 텍스트 확인)
    await expect(page.locator('header').getByText('Chanho.dev')).toBeVisible();

    // 푸터 확인
    await expect(page.locator('footer')).toBeVisible();
  });

  test('홈 페이지 - 영어', async ({ page }) => {
    await page.goto(`${BASE_URL}/en`);

    // TODO: 페이지별 타이틀 변경은 SEO 기능 구현 후 활성화
    // 현재는 기본 타이틀만 확인
    await expect(page).toHaveTitle(/Chanho/i);

    // 메인 콘텐츠 확인
    await expect(page.locator('main')).toBeVisible();

    // 헤더 확인 (로고 텍스트 확인)
    await expect(page.locator('header').getByText('Chanho.dev')).toBeVisible();

    // 푸터 확인
    await expect(page.locator('footer')).toBeVisible();
  });

  test('홈 페이지 - 일본어', async ({ page }) => {
    await page.goto(`${BASE_URL}/ja`);

    // TODO: 페이지별 타이틀 변경은 SEO 기능 구현 후 활성화
    // 현재는 기본 타이틀만 확인
    await expect(page).toHaveTitle(/Chanho/i);

    // 메인 콘텐츠 확인
    await expect(page.locator('main')).toBeVisible();

    // 헤더 확인 (로고 텍스트 확인)
    await expect(page.locator('header').getByText('Chanho.dev')).toBeVisible();

    // 푸터 확인
    await expect(page.locator('footer')).toBeVisible();
  });
});

test.describe('Critical Paths - About 페이지', () => {
  test('About 페이지 렌더링', async ({ page }) => {
    await page.goto(`${BASE_URL}/ko/about`);

    // MDX 콘텐츠 로딩 완료 대기
    await page.waitForLoadState('networkidle');

    // 메인 콘텐츠 확인 (MDXContent는 article이 아닌 다른 요소로 렌더링될 수 있음)
    await expect(page.locator('main')).toBeVisible();

    // MDX 콘텐츠가 렌더링되었는지 확인 (제목이나 본문 텍스트 확인)
    await expect(page.locator('h2').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Critical Paths - 포스트', () => {
  test('포스트 목록 렌더링', async ({ page }) => {
    await page.goto(`${BASE_URL}/ko/posts`);

    // 메인 콘텐츠 확인
    await expect(page.locator('main')).toBeVisible();

    // 포스트 카드가 1개 이상 있는지 확인 (article 태그 사용)
    const postCards = page.locator('article');
    await expect(postCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('포스트 상세 페이지', async ({ page }) => {
    await page.goto(`${BASE_URL}/ko/posts`);

    // 첫 번째 포스트 카드 클릭 (article 내의 링크 클릭)
    const firstPostLink = page.locator('article a').first();
    await expect(firstPostLink).toBeVisible({ timeout: 10000 });
    await firstPostLink.click();

    // URL 변경 확인
    await expect(page).toHaveURL(/\/ko\/posts\/.+/);

    // 포스트 상세 내용 확인 (MDX 콘텐츠 렌더링 대기)
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Critical Paths - 네비게이션', () => {
  test('네비게이션 동작 - Home to About', async ({ page }) => {
    await page.goto(`${BASE_URL}/ko`);

    // About 링크 클릭
    await page.click('a[href="/ko/about"]');

    // URL 변경 확인
    await expect(page).toHaveURL(/\/ko\/about/);

    // About 페이지 콘텐츠 확인 (MDX 로딩 대기)
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('네비게이션 동작 - Home to Posts', async ({ page }) => {
    await page.goto(`${BASE_URL}/ko`);

    // Posts 링크 클릭
    await page.click('a[href="/ko/posts"]');

    // URL 변경 확인
    await expect(page).toHaveURL(/\/ko\/posts/);

    // 포스트 목록 확인 (article 태그 사용)
    const postCards = page.locator('article');
    await expect(postCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('네비게이션 동작 - Home to Contact', async ({ page }) => {
    await page.goto(`${BASE_URL}/ko`);

    // Contact 링크 클릭
    await page.click('a[href="/ko/contact"]');

    // URL 변경 확인
    await expect(page).toHaveURL(/\/ko\/contact/);

    // Contact 폼 확인
    await expect(page.locator('form')).toBeVisible();
  });
});

test.describe('Critical Paths - 테마 전환', () => {
  test('다크 모드 전환', async ({ page }) => {
    await page.goto(`${BASE_URL}/ko`);

    // 테마 토글 버튼 찾기 (aria-label 기반)
    const themeToggle = page.locator('button[aria-label*="theme"]').first();
    await expect(themeToggle).toBeVisible();

    // 초기 aria-label 저장
    const initialAriaLabel = await themeToggle.getAttribute('aria-label');

    // 버튼 클릭
    await themeToggle.click();

    // 짧은 대기 후 aria-label 변경 확인 (테마가 전환되면 aria-label도 변경됨)
    await page.waitForTimeout(500);

    // 테마가 실제로 변경되었는지 확인 (버튼 aria-label 변경)
    const newAriaLabel = await themeToggle.getAttribute('aria-label');
    expect(newAriaLabel).not.toBe(initialAriaLabel);
  });
});

test.describe('Critical Paths - 언어 전환', () => {
  test('언어 전환 (ko → en)', async ({ page }) => {
    await page.goto(`${BASE_URL}/ko`);

    // 현재 URL이 /ko인지 확인
    await expect(page).toHaveURL(/\/ko/);

    // 언어 토글 버튼 찾기 (aria-label 기반)
    const localeToggle = page
      .locator('button[aria-label*="language"], button[aria-label*="언어"]')
      .first();

    // 버튼에 hover하여 메뉴 열기
    await localeToggle.hover();

    // 메뉴가 나타날 때까지 대기
    await page.waitForTimeout(300);

    // English 옵션 찾기 및 클릭
    const englishOption = page.getByText('English').first();
    await expect(englishOption).toBeVisible({ timeout: 5000 });
    await englishOption.click();

    // URL이 /en으로 변경되었는지 확인
    await expect(page).toHaveURL(/\/en/, { timeout: 5000 });
  });

  test('언어 전환 (en → ja)', async ({ page }) => {
    await page.goto(`${BASE_URL}/en`);

    // 현재 URL이 /en인지 확인
    await expect(page).toHaveURL(/\/en/);

    // 언어 토글 버튼 찾기 (aria-label 기반)
    const localeToggle = page
      .locator('button[aria-label*="language"], button[aria-label*="언어"]')
      .first();

    // 버튼에 hover하여 메뉴 열기
    await localeToggle.hover();

    // 메뉴가 나타날 때까지 대기
    await page.waitForTimeout(300);

    // Japanese 옵션 찾기 및 클릭
    const japaneseOption = page.getByText('日本語').first();
    await expect(japaneseOption).toBeVisible({ timeout: 5000 });
    await japaneseOption.click();

    // URL이 /ja로 변경되었는지 확인
    await expect(page).toHaveURL(/\/ja/, { timeout: 5000 });
  });
});
