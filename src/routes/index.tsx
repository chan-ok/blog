import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: RootRedirect,
});

// 루트 경로 → /ko 리다이렉트
function RootRedirect() {
  return <Navigate to="/ko" replace />;
}
