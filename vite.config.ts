import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig(({ mode }) => {
  // ⭐ 환경 변수 로드 (process.cwd()는 프로젝트 루트)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
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
        buffer: 'buffer', // Buffer polyfill
      },
    },
    define: {
      global: 'globalThis',
      'import.meta.env.VITE_TURNSTILE_SITE_KEY': JSON.stringify(
        env.VITE_TURNSTILE_SITE_KEY || env.TURNSTILE_SITE_KEY || ''
      ),
    },
    optimizeDeps: {
      include: ['buffer'], // Buffer polyfill을 pre-bundle
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          // 코드 스플리팅 - 큰 라이브러리를 별도 청크로 분리
          manualChunks(id) {
            // node_modules 내 패키지를 카테고리별로 분류
            if (id.includes('node_modules')) {
              // React 코어
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              // TanStack 라이브러리
              if (id.includes('@tanstack')) {
                return 'tanstack';
              }
              // MDX 및 콘텐츠 처리
              if (
                id.includes('gray-matter') ||
                id.includes('rehype') ||
                id.includes('remark') ||
                id.includes('highlight.js')
              ) {
                return 'mdx';
              }
              // i18n
              if (id.includes('i18next')) {
                return 'i18n';
              }
              // UI 라이브러리
              if (id.includes('lucide-react') || id.includes('@base-ui')) {
                return 'ui';
              }
              // 유틸리티 (날짜, 검증 등)
              if (
                id.includes('date-fns') ||
                id.includes('zod') ||
                id.includes('zustand') ||
                id.includes('clsx')
              ) {
                return 'utils';
              }
              // 나머지 큰 라이브러리들
              if (id.includes('axios') || id.includes('dompurify')) {
                return 'vendor';
              }
            }
          },
        },
      },
    },
  };
});
