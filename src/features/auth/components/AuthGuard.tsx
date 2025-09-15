import { useAuth } from '@/entities/user/hooks/useAuth';
import { LoginForm } from './LoginForm';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
  adminRequiredComponent?: React.ReactNode;
}

export function AuthGuard({
  children,
  requireAdmin = false,
  loadingComponent,
  unauthorizedComponent,
  adminRequiredComponent,
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {loadingComponent || (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        )}
      </div>
    );
  }

  // 인증되지 않음
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        {unauthorizedComponent || (
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              로그인이 필요합니다
            </h2>
            <LoginForm />
          </div>
        )}
      </div>
    );
  }

  // 관리자 권한 필요
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        {adminRequiredComponent || (
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              관리자 권한이 필요합니다
            </h2>
            <p className="text-gray-600 mb-6">
              이 페이지에 접근하려면 관리자 권한이 필요합니다.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              돌아가기
            </button>
          </div>
        )}
      </div>
    );
  }

  // 인증되고 권한도 충족
  return <>{children}</>;
}