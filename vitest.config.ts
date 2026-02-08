import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    alias: {
      '@': path.join(dirname, 'src'),
    },
  },
  test: {
    globals: true, // Enable global test APIs (describe, it, expect, etc.)
    exclude: ['**/node_modules/**', '**/.git/**'],
    projects: [
      // Unit tests project
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      // Storybook tests project
      // Note: Storybook 8.5+ handles test.include internally via the stories field in .storybook/main.ts
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
