import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from '@/5-shared/config/route/routeTree.gen';
import './globals.css';

// TanStack Router 인스턴스 생성
const router = createRouter({
  routeTree,
  defaultPreload: 'intent', // hover 시 prefetch
});

// TypeScript 타입 선언 (Router 인스턴스 타입 추론)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// React 앱 마운트
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
