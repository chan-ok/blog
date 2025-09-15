import { useLogout } from '@/entities/user/hooks/useAuth';

interface LogoutButtonProps {
  onSuccess?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({
  onSuccess,
  className = '',
  children = '로그아웃'
}: LogoutButtonProps) {
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        if (onSuccess) {
          onSuccess();
        }
      },
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      className={`px-4 py-2 text-gray-700 hover:text-gray-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {logoutMutation.isPending ? '로그아웃 중...' : children}
    </button>
  );
}