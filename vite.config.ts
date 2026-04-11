/// <reference types="vitest/config" />
import { loadEnv, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      tailwindcss(),
      tanstackRouter({
        routesDirectory: './src/4-pages',
        generatedRouteTree: './src/5-shared/config/route/routeTree.gen.ts',
        routeFileIgnorePattern: '\\.test\\.tsx?$',
        // 테스트 환경에서는 코드 스플리팅 비활성화:
        // autoCodeSplitting이 활성화되면 Route.options.component가 lazy 래퍼로 변환되어
        // 단위 테스트에서 동기 렌더링이 불가능해짐 (Suspense 없이는 <div/>만 렌더됨)
        autoCodeSplitting: mode !== 'test',
      }),
      react(),
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
      // tsconfig의 paths (@/* 등)를 Vite 8 네이티브 기능으로 해석
      tsconfigPaths: true,
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
    },
    build: {
      rolldownOptions: {
        // gray-matter 내부의 eval 사용 경고 억제 (외부 라이브러리, 수정 불가)
        onwarn(warning, warn) {
          if (warning.code === 'EVAL' && warning.id?.includes('gray-matter')) return;
          warn(warning);
        },
        output: {
          codeSplitting: {
            groups: [
              // 우선순위가 높을수록 여러 그룹에 매칭될 때 우선 적용
              {
                test: /node_modules\/(react|react-dom)/,
                name: 'react-vendor',
                priority: 30,
              },
              {
                test: /node_modules\/@tanstack/,
                name: 'tanstack',
                priority: 25,
              },

              // MDX 파이프라인: 750 kB → 청크 분리
              {
                test: /node_modules\/@mdx-js/,
                name: 'mdx-compiler',
                priority: 24,
              },
              {
                test: /node_modules\/(micromark|mdast|unist|vfile|hast)/,
                name: 'mdx-ast',
                priority: 23,
              },
              {
                test: /node_modules\/(rehype|remark|gray-matter)/,
                name: 'mdx-plugins',
                priority: 22,
              },

              // mermaid는 내부적으로 diagram 타입을 dynamic import하므로 groups 지정 제외
              // → rolldown이 자연스럽게 lazy chunk로 분리

              {
                test: /node_modules\/highlight\.js/,
                name: 'highlight',
                priority: 20,
              },
              { test: /node_modules\/i18next/, name: 'i18n', priority: 15 },
              {
                test: /node_modules\/(lucide-react|@base-ui)/,
                name: 'ui',
                priority: 15,
              },

              // date-fns는 용량이 크므로 utils에서 분리
              {
                test: /node_modules\/date-fns/,
                name: 'date-fns',
                priority: 12,
              },
              {
                test: /node_modules\/(zod|zustand|clsx)/,
                name: 'utils',
                priority: 10,
              },
              {
                test: /node_modules\/(axios|dompurify|isomorphic-dompurify)/,
                name: 'vendor',
                priority: 10,
              },
            ],
          },
        },
      },
    },
    test: {
      globals: true,
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
            environment: 'jsdom',
            setupFiles: ['./vitest.setup.ts'],
            typecheck: { enabled: true },
            pool: 'threads',
          },
        },
      ],
    },
  };
});
