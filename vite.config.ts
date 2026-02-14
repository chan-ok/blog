import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import tailwindcss from '@tailwindcss/vite';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      tailwindcss(),
      tanstackRouter({
        routesDirectory: './src/4-pages',
        generatedRouteTree: './src/5-shared/config/route/routeTree.gen.ts',
        routeFileIgnorePattern: '\\.test\\.tsx?$',
        autoCodeSplitting: true,
      }),
      react(),
      tsconfigPaths(),
      ViteImageOptimizer({
        png: { quality: 80 },
        jpeg: { quality: 85 },
        jpg: { quality: 85 },
        webp: { quality: 80 },
        avif: { quality: 70 },
        cache: true,
        cacheLocation: '.cache/images',
      }),
    ],
    envPrefix: 'VITE_',
    resolve: {
      alias: {
        buffer: 'buffer',
      },
    },
    define: {
      global: 'globalThis',
      'import.meta.env.VITE_TURNSTILE_SITE_KEY': JSON.stringify(
        env.VITE_TURNSTILE_SITE_KEY || env.TURNSTILE_SITE_KEY || ''
      ),
    },
    optimizeDeps: {
      include: ['buffer'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              if (id.includes('@tanstack')) {
                return 'tanstack';
              }
              if (
                id.includes('gray-matter') ||
                id.includes('rehype') ||
                id.includes('remark') ||
                id.includes('highlight.js')
              ) {
                return 'mdx';
              }
              if (id.includes('i18next')) {
                return 'i18n';
              }
              if (id.includes('lucide-react') || id.includes('@base-ui')) {
                return 'ui';
              }
              if (
                id.includes('date-fns') ||
                id.includes('zod') ||
                id.includes('zustand') ||
                id.includes('clsx')
              ) {
                return 'utils';
              }
              if (id.includes('axios') || id.includes('dompurify')) {
                return 'vendor';
              }
            }
          },
        },
      },
    },
    test: {
      globals: true,
      exclude: ['**/node_modules/**', '**/.git/**'],
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
            environment: 'jsdom',
            setupFiles: ['./vitest.setup.ts'],
          },
        },
        {
          extends: true,
          plugins: [
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
  };
});
