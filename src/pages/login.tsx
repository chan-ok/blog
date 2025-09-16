import { createFileRoute, useNavigate, useSearch, redirect } from "@tanstack/react-router";
import { LoginForm } from "@/features/auth/components/LoginForm";

type LoginSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search): LoginSearch => ({
    redirect: search.redirect as string,
  }),
  beforeLoad: async ({ search }) => {
    try {
      const { getCurrentUser } = await import("@/entities/user/api/userAPI");
      const user = await getCurrentUser();

      // 이미 로그인된 관리자는 대시보드로 리다이렉트
      if (user && user.role === "admin") {
        const redirectTo = search.redirect || "/admin";
        throw redirect({ to: redirectTo });
      }
    } catch (error) {
      // 인증되지 않은 경우 로그인 페이지 표시
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });

  const handleLoginSuccess = () => {
    const redirectTo = search.redirect || "/admin";
    navigate({ to: redirectTo });
  };

  const handleLoginError = (error: string) => {
    console.error("로그인 에러:", error);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md px-6">
        <LoginForm onSuccess={handleLoginSuccess} onError={handleLoginError} />

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate({ to: "/" })}
            className="text-sm text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
