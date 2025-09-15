import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useAuth, useLogin, useLogout, useSignup } from '../useAuth';

// API 함수들 모킹
vi.mock('../../api/userAPI', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  signup: vi.fn(),
  getCurrentUser: vi.fn(),
}));

// Supabase 모킹
vi.mock('@/shared/config/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

describe('인증 관련 훅', () => {
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

  describe('useAuth', () => {
    it('초기 상태에서 로딩중이어야 한다', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('사용자가 로그인되었을 때 인증상태를 반환해야 한다', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: '테스트 사용자',
        role: 'user' as const,
        createdAt: new Date(),
      };

      const { getCurrentUser } = await import('../../api/userAPI');
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('useLogin', () => {
    it('로그인 성공 시 사용자 정보를 반환해야 한다', async () => {
      const loginRequest = {
        email: 'test@example.com',
        password: 'password123!',
      };

      const expectedResponse = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
          name: '테스트 사용자',
          role: 'user' as const,
          createdAt: new Date(),
        },
        token: 'access-token',
      };

      const { login } = await import('../../api/userAPI');
      vi.mocked(login).mockResolvedValue(expectedResponse);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper,
      });

      result.current.mutate(loginRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expectedResponse);
      expect(login).toHaveBeenCalledWith(loginRequest);
    });

    it('로그인 실패 시 에러를 반환해야 한다', async () => {
      const loginRequest = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      const { login } = await import('../../api/userAPI');
      vi.mocked(login).mockRejectedValue(new Error('로그인 실패'));

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper,
      });

      result.current.mutate(loginRequest);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useLogout', () => {
    it('로그아웃 성공 시 인증 상태를 초기화해야 한다', async () => {
      const { logout } = await import('../../api/userAPI');
      vi.mocked(logout).mockResolvedValue();

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper,
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(logout).toHaveBeenCalled();
    });
  });

  describe('useSignup', () => {
    it('회원가입 성공 시 사용자 정보를 반환해야 한다', async () => {
      const signupRequest = {
        email: 'newuser@example.com',
        password: 'password123!',
        name: '새 사용자',
      };

      const expectedResponse = {
        user: {
          id: 'new-user-id',
          email: 'newuser@example.com',
          name: '새 사용자',
          role: 'user' as const,
          createdAt: new Date(),
        },
        emailConfirmationRequired: true,
      };

      const { signup } = await import('../../api/userAPI');
      vi.mocked(signup).mockResolvedValue(expectedResponse);

      const { result } = renderHook(() => useSignup(), {
        wrapper: createWrapper,
      });

      result.current.mutate(signupRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(expectedResponse);
      expect(signup).toHaveBeenCalledWith(signupRequest);
    });
  });
});