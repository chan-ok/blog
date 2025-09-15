import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthGuard } from '../AuthGuard';
import type { ReactNode } from 'react';

// 인증 훅 모킹
vi.mock('@/entities/user/hooks/useAuth', () => ({
  useAuth: vi.fn(),
  useLogin: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
    isSuccess: false,
  })),
}));

describe('AuthGuard 컴포넌트', () => {
  let queryClient: QueryClient;

  const createWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  it('로딩 중일 때 로딩 표시를 해야 한다', async () => {
    const { useAuth } = await import('@/entities/user/hooks/useAuth');
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });

    render(
      <AuthGuard>
        <div>보호된 콘텐츠</div>
      </AuthGuard>,
      { wrapper: createWrapper }
    );

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    expect(screen.queryByText('보호된 콘텐츠')).not.toBeInTheDocument();
  });

  it('인증되지 않았을 때 로그인 폼을 표시해야 한다', async () => {
    const { useAuth } = await import('@/entities/user/hooks/useAuth');
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    render(
      <AuthGuard>
        <div>보호된 콘텐츠</div>
      </AuthGuard>,
      { wrapper: createWrapper }
    );

    expect(screen.getByText('로그인이 필요합니다')).toBeInTheDocument();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.queryByText('보호된 콘텐츠')).not.toBeInTheDocument();
  });

  it('인증되었을 때 자식 컴포넌트를 표시해야 한다', async () => {
    const { useAuth } = await import('@/entities/user/hooks/useAuth');
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user-id',
        email: 'test@example.com',
        name: '테스트 사용자',
        role: 'user',
        createdAt: new Date(),
      },
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <AuthGuard>
        <div>보호된 콘텐츠</div>
      </AuthGuard>,
      { wrapper: createWrapper }
    );

    expect(screen.getByText('보호된 콘텐츠')).toBeInTheDocument();
    expect(screen.queryByText('로그인이 필요합니다')).not.toBeInTheDocument();
  });

  it('관리자 권한이 필요한 경우 일반 사용자를 차단해야 한다', async () => {
    const { useAuth } = await import('@/entities/user/hooks/useAuth');
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user-id',
        email: 'test@example.com',
        name: '일반 사용자',
        role: 'user',
        createdAt: new Date(),
      },
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <AuthGuard requireAdmin>
        <div>관리자 전용 콘텐츠</div>
      </AuthGuard>,
      { wrapper: createWrapper }
    );

    expect(screen.getByText('관리자 권한이 필요합니다')).toBeInTheDocument();
    expect(screen.queryByText('관리자 전용 콘텐츠')).not.toBeInTheDocument();
  });

  it('관리자 권한이 필요한 경우 관리자는 접근할 수 있어야 한다', async () => {
    const { useAuth } = await import('@/entities/user/hooks/useAuth');
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'admin-id',
        email: 'admin@example.com',
        name: '관리자',
        role: 'admin',
        createdAt: new Date(),
      },
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <AuthGuard requireAdmin>
        <div>관리자 전용 콘텐츠</div>
      </AuthGuard>,
      { wrapper: createWrapper }
    );

    expect(screen.getByText('관리자 전용 콘텐츠')).toBeInTheDocument();
    expect(screen.queryByText('관리자 권한이 필요합니다')).not.toBeInTheDocument();
  });

  it('커스텀 로딩 컴포넌트를 표시할 수 있어야 한다', async () => {
    const { useAuth } = await import('@/entities/user/hooks/useAuth');
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });

    const LoadingComponent = () => <div>커스텀 로딩</div>;

    render(
      <AuthGuard loadingComponent={<LoadingComponent />}>
        <div>보호된 콘텐츠</div>
      </AuthGuard>,
      { wrapper: createWrapper }
    );

    expect(screen.getByText('커스텀 로딩')).toBeInTheDocument();
  });

  it('커스텀 인증 실패 컴포넌트를 표시할 수 있어야 한다', async () => {
    const { useAuth } = await import('@/entities/user/hooks/useAuth');
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    const UnauthorizedComponent = () => <div>커스텀 인증 실패</div>;

    render(
      <AuthGuard unauthorizedComponent={<UnauthorizedComponent />}>
        <div>보호된 콘텐츠</div>
      </AuthGuard>,
      { wrapper: createWrapper }
    );

    expect(screen.getByText('커스텀 인증 실패')).toBeInTheDocument();
  });
});