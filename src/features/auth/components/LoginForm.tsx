import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLogin } from '@/entities/user/hooks/useAuth';
import type { LoginRequest } from '@/entities/user/model/types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function LoginForm({ onSuccess, onError, className = '' }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>('');

  const form = useForm<LoginRequest>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useLogin();

  const validateForm = (data: LoginRequest) => {
    if (!data.email.trim()) {
      form.setError('email', { message: '이메일을 입력해주세요' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      form.setError('email', { message: '올바른 이메일 형식을 입력해주세요' });
      return false;
    }
    if (!data.password.trim()) {
      form.setError('password', { message: '비밀번호를 입력해주세요' });
      return false;
    }
    if (data.password.length < 6) {
      form.setError('password', { message: '비밀번호는 최소 6자 이상이어야 합니다' });
      return false;
    }
    return true;
  };

  const onSubmit = async (data: LoginRequest) => {
    try {
      setLoginError('');

      if (!validateForm(data)) {
        return;
      }

      await loginMutation.mutateAsync(data);

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : '로그인 중 오류가 발생했습니다.';

      setLoginError(errorMessage);
      onError?.(errorMessage);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          관리자 로그인
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          블로그 관리를 위해 로그인해주세요
        </p>
      </div>

      {loginError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>비밀번호</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="비밀번호를 입력하세요"
                      autoComplete="current-password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>관리자 계정으로만 로그인 가능합니다.</p>
        <p className="mt-1">
          계정이 없으시면{' '}
          <a
            href="mailto:admin@example.com"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            관리자에게 문의
          </a>
          해주세요.
        </p>
      </div>
    </div>
  );
}