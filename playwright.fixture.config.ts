import { defineConfig } from 'playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: [
    'browser/framework-{interactions,security,runtime}.test.ts',
    'integration/vault-watch.test.ts',
  ],
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    headless: true,
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
  },
});
