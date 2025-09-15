import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/shared/config/supabase';
import {
  login,
  logout,
  signup,
  getCurrentUser,
  updateUser,
} from '../api/userAPI';
import type {
  User,
  LoginRequest,
  SignupRequest,
  UserUpdateRequest,
  AuthState,
  LoginResponse,
  SignupResponse,
} from '../model/types';

/**
 * 현재 인증 상태를 관리하는 훅
 */
export function useAuth(): AuthState {
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    data: user,
    isLoading,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5분
  });

  // Supabase Auth 상태 변화 감지
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const queryClient = useQueryClient();

        if (event === 'SIGNED_IN' && session) {
          // 로그인 시 사용자 정보 새로고침
          queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        } else if (event === 'SIGNED_OUT') {
          // 로그아웃 시 캐시 정리
          queryClient.setQueryData(['currentUser'], null);
        }

        setIsInitialized(true);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 초기 로딩이 완료되면 초기화 상태로 설정
  useEffect(() => {
    if (!isLoading && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isLoading, isInitialized]);

  return {
    user: user || null,
    isLoading: isLoading || !isInitialized,
    isAuthenticated: !!user,
  };
}

/**
 * 로그인 뮤테이션 훅
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: (response) => {
      // 로그인 성공 시 사용자 정보 캐시 업데이트
      queryClient.setQueryData(['currentUser'], response.user);
    },
    onError: (error) => {
      console.error('로그인 실패:', error.message);
    },
  });
}

/**
 * 로그아웃 뮤테이션 훅
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: logout,
    onSuccess: () => {
      // 로그아웃 성공 시 모든 캐시 정리
      queryClient.setQueryData(['currentUser'], null);
      queryClient.removeQueries({ queryKey: ['adminRole'] });
      queryClient.removeQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      console.error('로그아웃 실패:', error.message);
    },
  });
}

/**
 * 회원가입 뮤테이션 훅
 */
export function useSignup() {
  return useMutation<SignupResponse, Error, SignupRequest>({
    mutationFn: signup,
    onError: (error) => {
      console.error('회원가입 실패:', error.message);
    },
  });
}

/**
 * 사용자 정보 업데이트 뮤테이션 훅
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UserUpdateRequest>({
    mutationFn: updateUser,
    onSuccess: (updatedUser) => {
      // 사용자 정보 업데이트 성공 시 캐시 업데이트
      queryClient.setQueryData(['currentUser'], updatedUser);
    },
    onError: (error) => {
      console.error('사용자 정보 수정 실패:', error.message);
    },
  });
}

/**
 * 관리자 권한 확인 훅
 */
export function useAdminRoleCheck(userId?: string) {
  return useQuery({
    queryKey: ['adminRole', userId],
    queryFn: async () => {
      if (!userId) return false;

      const userInfo = await getCurrentUser();
      return userInfo?.role === 'admin';
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10분
  });
}

/**
 * 현재 사용자가 관리자인지 확인하는 편의 훅
 */
export function useCurrentUserAdminStatus() {
  const { user } = useAuth();

  return useAdminRoleCheck(user?.id);
}