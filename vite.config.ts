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
    },
  },
});
