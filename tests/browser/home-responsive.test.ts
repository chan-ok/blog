import { expect, test, type Locator } from 'playwright/test';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutSnapshot {
  imageFrame: Box;
  introCopy: Box;
  introGrid: Box;
  recentPostsTop: number;
}

const viewports = [
  { width: 320, expectedImageWidth: 96 },
  { width: 375, expectedImageWidth: 105 },
  { width: 768, expectedImageWidth: 192 },
  { width: 1023, expectedImageWidth: 192 },
  { width: 1440, expectedImageWidth: 416 },
];

async function getVisibleBox(locator: Locator, message: string): Promise<Box> {
  const box = await locator.boundingBox();
  expect(box, message).not.toBeNull();
  return box as Box;
}

test.describe('responsive home introduction', () => {
  test.describe.configure({ mode: 'serial' });

  for (const { width, expectedImageWidth } of viewports) {
    test(`keeps a compact two-column intro without layout shift at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1600 });
      const errors: string[] = [];

      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));

      let releaseImage!: () => void;
      const imageGate = new Promise<void>((resolve) => {
        releaseImage = resolve;
      });

      await page.route('**/image/git-profile.png', async (route) => {
        await imageGate;
        await route.continue();
      });

      const imageRequested = page.waitForRequest((request) =>
        request.url().endsWith('/image/git-profile.png')
      );
      await page.goto('/ko/', { waitUntil: 'domcontentloaded' });
      await imageRequested;

      const image = page.locator('img[src="/image/git-profile.png"]');
      await image.waitFor({ state: 'attached' });

      const imageFrame = image.locator('..');
      const introGrid = imageFrame.locator('..');
      const introCopy = introGrid.locator(':scope > div').first();
      const skeleton = imageFrame.locator('[aria-hidden="true"].animate-pulse');
      const recentPostsSection = page.locator('section.border-t').first();

      await expect(skeleton).toBeVisible();
      await expect(recentPostsSection).toBeAttached();

      const readLayout = async (): Promise<LayoutSnapshot> => ({
        imageFrame: await getVisibleBox(imageFrame, `${width}px image frame`),
        introCopy: await getVisibleBox(introCopy, `${width}px introduction copy`),
        introGrid: await getVisibleBox(introGrid, `${width}px introduction grid`),
        recentPostsTop: await recentPostsSection.evaluate(
          (element) => element.getBoundingClientRect().top
        ),
      });

      const before = await readLayout();
      expect(before.imageFrame.width).toBeCloseTo(expectedImageWidth, 0);

      if (width < 1024) {
        expect(before.imageFrame.width).toBeLessThanOrEqual(193);
        expect(before.imageFrame.x + before.imageFrame.width).toBeLessThanOrEqual(
          before.introCopy.x + 0.5
        );
        expect(Math.abs(before.imageFrame.y - before.introCopy.y)).toBeLessThanOrEqual(0.5);
      }

      expect(before.recentPostsTop).toBeGreaterThanOrEqual(
        before.introGrid.y + before.introGrid.height
      );

      releaseImage();
      await page.waitForFunction(() => {
        const element = document.querySelector('img[src="/image/git-profile.png"]');
        return (
          element instanceof HTMLImageElement && element.complete && element.naturalWidth === 591
        );
      });

      await expect(skeleton).toHaveCount(0);
      const after = await readLayout();

      expect(Math.abs(after.recentPostsTop - before.recentPostsTop)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(after.imageFrame.height - before.imageFrame.height)).toBeLessThanOrEqual(0.5);
      expect(errors).toEqual([]);
    });
  }
});
