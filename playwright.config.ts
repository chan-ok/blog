import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
  },
  webServer: {
    command: 'pnpm dev --host 127.0.0.1 --port 4173 --ignore-lock',
    url: 'http://127.0.0.1:4173/ko/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
