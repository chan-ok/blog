import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthError } from '@supabase/supabase-js';
import type { LoginRequest, SignupRequest } from '../../model/types';
import {
  login,
  logout,
  signup,
  getCurrentUser,
} from '../userAPI';

// Supabase 클라이언트 모킹
vi.mock('@/shared/config/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      getUser: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
  },
}));

describe('사용자 API 함수', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('올바른 자격 증명으로 로그인에 성공해야 한다', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123!',
      };

      const expectedResponse = {
        data: {
          user: {
            id: 'user-id',
            email: 'test@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2023-01-01T00:00:00Z'
          },
          session: {
            access_token: 'token',
            refresh_token: 'refresh_token',
            expires_in: 3600,
            token_type: 'bearer',
            user: {
              id: 'user-id',
              email: 'test@example.com',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: '2023-01-01T00:00:00Z'
            }
          },
        },
        error: null,
      };

      const { supabase } = await import('@/shared/config/supabase');
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(expectedResponse);

      const result = await login(loginRequest);

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: loginRequest.email,
        password: loginRequest.password,
      });

      expect(result).toBeDefined();
    });

    it('잘못된 자격 증명으로 로그인에 실패해야 한다', async () => {
      const loginRequest: LoginRequest = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      const errorResponse = {
        data: { user: null, session: null },
        error: new AuthError('로그인 실패', 400, 'invalid_credentials'),
      };

      const { supabase } = await import('@/shared/config/supabase');
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(errorResponse);

      await expect(login(loginRequest)).rejects.toThrow('로그인 실패');
    });
  });

  describe('signup', () => {
    it('유효한 정보로 회원가입에 성공해야 한다', async () => {
      const signupRequest: SignupRequest = {
        email: 'newuser@example.com',
        password: 'newpassword123!',
        name: '새 사용자',
      };

      const expectedResponse = {
        data: {
          user: {
            id: 'new-user-id',
            email: 'newuser@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2023-01-01T00:00:00Z'
          },
          session: null,
        },
        error: null,
      };

      const { supabase } = await import('@/shared/config/supabase');
      vi.mocked(supabase.auth.signUp).mockResolvedValue(expectedResponse);

      const result = await signup(signupRequest);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: signupRequest.email,
        password: signupRequest.password,
        options: {
          data: {
            name: signupRequest.name,
            role: 'user',
          },
        },
      });

      expect(result).toBeDefined();
    });
  });

  describe('logout', () => {
    it('로그아웃에 성공해야 한다', async () => {
      const { supabase } = await import('@/shared/config/supabase');
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      await expect(logout()).resolves.not.toThrow();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('현재 로그인된 사용자 정보를 가져와야 한다', async () => {
      const expectedUser = {
        data: {
          user: {
            id: 'current-user-id',
            email: 'current@example.com',
            app_metadata: {},
            user_metadata: { name: '현재 사용자' },
            aud: 'authenticated',
            created_at: '2023-01-01T00:00:00Z'
          },
        },
        error: null,
      };

      const { supabase } = await import('@/shared/config/supabase');
      vi.mocked(supabase.auth.getUser).mockResolvedValue(expectedUser);

      const result = await getCurrentUser();

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});