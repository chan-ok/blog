import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite({
      // ⭐ 커스텀 route tree 생성 경로 (FSD 구조 준수)
      generatedRouteTree: './src/shared/config/route/routeTree.gen.ts',
      // 테스트 파일 제외
      routeFileIgnorePattern: '\\.test\\.tsx?$',
    }),
    tsconfigPaths(),
    ViteImageOptimizer({
      // 이미지 품질 설정
      png: { quality: 80 },
      jpeg: { quality: 85 },
      jpg: { quality: 85 },
      webp: { quality: 80 },
      avif: { quality: 70 },

      // 추가 옵션
      cache: true, // 캐싱 활성화 (빌드 속도 향상)
      cacheLocation: '.cache/images', // 캐시 위치
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
      buffer: 'buffer', // Buffer polyfill
    },
  },
  define: {
    // Buffer를 global로 주입 (gray-matter 호환성)
    global: 'globalThis',
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
});
