import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from '../LoginForm';
import type { ReactNode } from 'react';

// 인증 훅 모킹
vi.mock('@/entities/user/hooks/useAuth', () => ({
  useLogin: vi.fn(),
}));

describe('LoginForm 컴포넌트', () => {
  let queryClient: QueryClient;
  let mockLogin: any;

  const createWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockLogin = {
      mutate: vi.fn(),
      isPending: false,
      error: null,
      isSuccess: false,
    };

    const authModule = await import('@/entities/user/hooks/useAuth');
    vi.mocked(authModule.useLogin).mockReturnValue(mockLogin);

    vi.clearAllMocks();
  });

  it('로그인 폼이 올바르게 렌더링되어야 한다', () => {
    render(<LoginForm />, { wrapper: createWrapper });

    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('이메일과 비밀번호를 입력할 수 있어야 한다', async () => {
    render(<LoginForm />, { wrapper: createWrapper });

    const emailInput = screen.getByLabelText('이메일') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('비밀번호') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123!' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123!');
  });

  it('폼 제출 시 로그인 함수가 호출되어야 한다', async () => {
    render(<LoginForm />, { wrapper: createWrapper });

    const emailInput = screen.getByLabelText('이메일');
    const passwordInput = screen.getByLabelText('비밀번호');
    const loginButton = screen.getByRole('button', { name: '로그인' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123!' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin.mutate).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123!',
      });
    });
  });

  it('필수 필드가 비어있을 때 유효성 검사 에러를 표시해야 한다', async () => {
    render(<LoginForm />, { wrapper: createWrapper });

    const loginButton = screen.getByRole('button', { name: '로그인' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('이메일을 입력해주세요')).toBeInTheDocument();
      expect(screen.getByText('비밀번호를 입력해주세요')).toBeInTheDocument();
    });

    expect(mockLogin.mutate).not.toHaveBeenCalled();
  });

  it('잘못된 이메일 형식일 때 에러를 표시해야 한다', async () => {
    render(<LoginForm />, { wrapper: createWrapper });

    const emailInput = screen.getByLabelText('이메일');
    const passwordInput = screen.getByLabelText('비밀번호');
    const loginButton = screen.getByRole('button', { name: '로그인' });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123!' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식이 아닙니다')).toBeInTheDocument();
    });
  });

  it('로그인 중일 때 로딩 상태를 표시해야 한다', () => {
    mockLogin.isPending = true;

    render(<LoginForm />, { wrapper: createWrapper });

    const loginButton = screen.getByRole('button', { name: '로그인 중...' });
    expect(loginButton).toBeDisabled();
  });

  it('로그인 에러가 있을 때 에러 메시지를 표시해야 한다', () => {
    mockLogin.error = new Error('로그인 실패');

    render(<LoginForm />, { wrapper: createWrapper });

    expect(screen.getByText('로그인 실패')).toBeInTheDocument();
  });

  it('로그인 성공 시 성공 콜백이 호출되어야 한다', async () => {
    const onSuccess = vi.fn();

    const { rerender } = render(<LoginForm onSuccess={onSuccess} />, { wrapper: createWrapper });

    // 로그인 성공 상태로 변경하고 컴포넌트 다시 렌더링
    mockLogin.isSuccess = true;

    const authModule = await import('@/entities/user/hooks/useAuth');
    vi.mocked(authModule.useLogin).mockReturnValue(mockLogin);

    rerender(<LoginForm onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});