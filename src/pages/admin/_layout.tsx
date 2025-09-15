import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import Header from '@/shared/components/Header';
import Footer from '@/shared/components/Footer';

export const Route = createFileRoute('/admin/_layout')({
  beforeLoad: async ({ location }) => {
    // AuthGuard에서 인증 체크를 처리하므로 여기서는 간단한 체크만
    try {
      const { getCurrentUser } = await import('@/entities/user/api/userAPI');
      const user = await getCurrentUser();

      if (!user || user.role !== 'admin') {
        // 로그인이 필요하거나 관리자가 아닌 경우 login 페이지로 리다이렉트
        throw redirect({
          to: '/login',
          search: {
            redirect: location.pathname,
          },
        });
      }
    } catch (error) {
      // 인증 실패 시 로그인 페이지로 리다이렉트
      throw redirect({
        to: '/login',
        search: {
          redirect: location.pathname,
        },
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AuthGuard requireAdmin={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>관리자 모드</strong> - 블로그 관리 기능에 접근 중입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Outlet />
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}