import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: RootRedirect,
});

// 루트 경로 → /ko 리다이렉트
function RootRedirect() {
  // @ts-ignore - TanStack Router 타입 이슈
  return <Navigate to="/ko" replace />;
}
